import { Skeleton, Card, Space } from 'antd';

interface LoadingSkeletonProps {
  type?: 'list' | 'card' | 'detail' | 'table';
  rows?: number;
}

const LoadingSkeleton = ({ type = 'list', rows = 3 }: LoadingSkeletonProps) => {
  if (type === 'list') {
    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {Array.from({ length: rows }).map((_, index) => (
          <Card key={index}>
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
        ))}
      </Space>
    );
  }

  if (type === 'card') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {Array.from({ length: rows }).map((_, index) => (
          <Card key={index}>
            <Skeleton active paragraph={{ rows: 3 }} />
          </Card>
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <Card>
        <Skeleton active avatar paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  if (type === 'table') {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  return <Skeleton active />;
};

export default LoadingSkeleton;

