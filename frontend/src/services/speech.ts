import { useApiConfigStore } from '../store/apiConfigStore';
import CryptoJS from 'crypto-js';

/**
 * 科大讯飞语音识别服务
 * 使用 WebSocket 实时语音识别
 */

export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
  is_final: boolean;
}

export interface SpeechConfig {
  onResult: (result: SpeechRecognitionResult) => void;
  onError: (error: Error) => void;
  onEnd: () => void;
  language?: 'zh_cn' | 'en_us';
  accent?: 'mandarin' | 'cantonese';
}

/**
 * 获取科大讯飞配置
 */
const getXfeiConfig = () => {
  const { config } = useApiConfigStore.getState();
  const appId = config.xfei_app_id || import.meta.env.VITE_XFEI_APP_ID;
  const apiKey = config.xfei_api_key || import.meta.env.VITE_XFEI_API_KEY;
  const apiSecret = config.xfei_api_secret || import.meta.env.VITE_XFEI_API_SECRET;

  if (!appId || !apiKey || !apiSecret) {
    throw new Error('科大讯飞 API 未配置，请在设置页面配置');
  }

  return { appId, apiKey, apiSecret };
};

/**
 * 生成 WebSocket 认证 URL
 */
const getWebSocketUrl = (apiKey: string, apiSecret: string): string => {
  const url = 'wss://iat-api.xfyun.cn/v2/iat';
  const host = 'iat-api.xfyun.cn';
  const date = new Date().toUTCString();
  const algorithm = 'hmac-sha256';
  const headers = 'host date request-line';

  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
  const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
  const signature = CryptoJS.enc.Base64.stringify(signatureSha);

  const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
  const authorization = btoa(authorizationOrigin);

  return `${url}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
};

/**
 * 语音识别类
 */
export class SpeechRecognizer {
  private ws: WebSocket | null = null;
  private config: SpeechConfig;
  private appId: string;
  private apiKey: string;
  private apiSecret: string;
  private isRecording = false;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;

  constructor(config: SpeechConfig) {
    this.config = config;
    const xfeiConfig = getXfeiConfig();
    this.appId = xfeiConfig.appId;
    this.apiKey = xfeiConfig.apiKey;
    this.apiSecret = xfeiConfig.apiSecret;
  }

  /**
   * 开始录音和识别
   */
  async start(): Promise<void> {
    if (this.isRecording) {
      throw new Error('已经在录音中');
    }

    try {
      // 获取麦克风权限
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 创建音频上下文
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // 创建处理器
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      // 连接 WebSocket
      await this.connectWebSocket();

      // 处理音频数据
      this.processor.onaudioprocess = (e) => {
        if (!this.isRecording || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = this.convertToPCM(inputData);
        const base64Data = this.arrayBufferToBase64(pcmData);

        // 发送音频数据
        this.ws.send(
          JSON.stringify({
            data: {
              status: 1, // 0: 第一帧, 1: 中间帧, 2: 最后一帧
              format: 'audio/L16;rate=16000',
              encoding: 'raw',
              audio: base64Data,
            },
          })
        );
      };

      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      this.isRecording = true;
    } catch (error) {
      console.error('启动录音失败:', error);
      this.config.onError(error as Error);
      throw error;
    }
  }

  /**
   * 停止录音和识别
   */
  stop(): void {
    if (!this.isRecording) {
      return;
    }

    this.isRecording = false;

    // 发送结束帧
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          data: {
            status: 2, // 最后一帧
            format: 'audio/L16;rate=16000',
            encoding: 'raw',
            audio: '',
          },
        })
      );
    }

    // 清理资源
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * 连接 WebSocket
   */
  private connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = getWebSocketUrl(this.apiKey, this.apiSecret);
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          // 发送开始帧
          const params = {
            common: {
              app_id: this.appId,
            },
            business: {
              language: this.config.language || 'zh_cn',
              domain: 'iat',
              accent: this.config.accent || 'mandarin',
              vad_eos: 5000,
              dwa: 'wpgs',
            },
            data: {
              status: 0,
              format: 'audio/L16;rate=16000',
              encoding: 'raw',
              audio: '',
            },
          };

          this.ws!.send(JSON.stringify(params));
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.code !== 0) {
              this.config.onError(new Error(`识别错误: ${data.message}`));
              return;
            }

            if (data.data && data.data.result) {
              const result = data.data.result;
              const text = result.ws
                .map((w: any) => w.cw.map((c: any) => c.w).join(''))
                .join('');

              this.config.onResult({
                text,
                confidence: result.ws[0]?.cw[0]?.wp || 0,
                is_final: data.data.status === 2,
              });
            }

            if (data.data && data.data.status === 2) {
              this.config.onEnd();
            }
          } catch (error) {
            console.error('解析识别结果失败:', error);
            this.config.onError(error as Error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket 错误:', error);
          this.config.onError(new Error('语音识别连接失败'));
          reject(error);
        };

        this.ws.onclose = () => {
          this.config.onEnd();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 转换为 PCM 格式
   */
  private convertToPCM(input: Float32Array): ArrayBuffer {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output.buffer;
  }

  /**
   * ArrayBuffer 转 Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

/**
 * 简化的语音识别函数
 */
export const startSpeechRecognition = (
  onResult: (text: string) => void,
  onError?: (error: Error) => void
): SpeechRecognizer => {
  let fullText = '';

  const recognizer = new SpeechRecognizer({
    onResult: (result) => {
      console.log('🎤 语音识别结果:', result);

      // 实时更新识别结果
      if (result.text) {
        if (result.is_final) {
          // 最终结果,追加到完整文本
          fullText += result.text;
          console.log('✅ 最终识别文本:', fullText);
        }
        // 无论是否最终结果,都回调给UI更新
        onResult(result.is_final ? fullText : result.text);
      }
    },
    onError: (error) => {
      console.error('❌ 语音识别错误:', error);
      if (onError) {
        onError(error);
      }
    },
    onEnd: () => {
      console.log('🏁 语音识别结束，完整文本:', fullText);
      if (fullText) {
        onResult(fullText);
      }
    },
  });

  // 不在这里自动启动,让调用者控制
  return recognizer;
};

