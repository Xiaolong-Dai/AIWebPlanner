import { create } from 'zustand';
import type { TravelPlan } from '../types/common';

interface PlanState {
  plans: TravelPlan[];
  currentPlan: TravelPlan | null;
  isLoading: boolean;
  setPlans: (plans: TravelPlan[]) => void;
  setCurrentPlan: (plan: TravelPlan | null) => void;
  addPlan: (plan: TravelPlan) => void;
  updatePlan: (id: string, updates: Partial<TravelPlan>) => void;
  deletePlan: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const usePlanStore = create<PlanState>((set) => ({
  plans: [],
  currentPlan: null,
  isLoading: false,
  setPlans: (plans) => set({ plans }),
  setCurrentPlan: (plan) => set({ currentPlan: plan }),
  addPlan: (plan) => set((state) => ({ plans: [...state.plans, plan] })),
  updatePlan: (id, updates) =>
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      currentPlan:
        state.currentPlan?.id === id ? { ...state.currentPlan, ...updates } : state.currentPlan,
    })),
  deletePlan: (id) =>
    set((state) => ({
      plans: state.plans.filter((p) => p.id !== id),
      currentPlan: state.currentPlan?.id === id ? null : state.currentPlan,
    })),
  setLoading: (loading) => set({ isLoading: loading }),
}));

