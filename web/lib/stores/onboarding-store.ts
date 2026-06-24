import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OnboardingData {
  fullName: string;
  age: number | null;
  gender: string;
  igdResponses: Record<string, number>;
  bddResponses: Record<string, number>;
  avgGamingHoursPerDay: number;
  primaryGames: string;
  sleepHoursPerNight: number;
  stressLevel: number;
  deviceConnected: boolean;
}

interface OnboardingStore {
  step: number;
  data: OnboardingData;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setData: (patch: Partial<OnboardingData>) => void;
  setIGDResponse: (questionId: string, value: number) => void;
  setBDDResponse: (questionId: string, value: number) => void;
  reset: () => void;
}

const defaultData: OnboardingData = {
  fullName: "",
  age: null,
  gender: "",
  igdResponses: {},
  bddResponses: {},
  avgGamingHoursPerDay: 2,
  primaryGames: "",
  sleepHoursPerNight: 7,
  stressLevel: 5,
  deviceConnected: false,
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      step: 1,
      data: defaultData,

      setStep: (step) => set({ step }),
      nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 7) })),
      prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),
      setData: (patch) =>
        set((s) => ({ data: { ...s.data, ...patch } })),
      setIGDResponse: (id, value) =>
        set((s) => ({
          data: {
            ...s.data,
            igdResponses: { ...s.data.igdResponses, [id]: value },
          },
        })),
      setBDDResponse: (id, value) =>
        set((s) => ({
          data: {
            ...s.data,
            bddResponses: { ...s.data.bddResponses, [id]: value },
          },
        })),
      reset: () => set({ step: 1, data: defaultData }),
    }),
    { name: "mindshield-onboarding" }
  )
);
