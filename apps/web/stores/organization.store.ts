import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Organization, OrganizationMember } from '@vylune/core/schemas';

interface OrganizationStore {
  // Current selected organization
  currentOrganization: Organization | null;
  currentMembership: OrganizationMember | null;

  // All user organizations
  organizations: Organization[];

  // Actions
  setCurrentOrganization: (org: Organization, membership: OrganizationMember | null) => void;
  clearCurrentOrganization: () => void;
  setOrganizations: (orgs: Organization[]) => void;
  addOrganization: (org: Organization) => void;
  removeOrganization: (orgId: string) => void;
  updateOrganization: (orgId: string, updates: Partial<Organization>) => void;

  // Computed helpers
  isLeader: () => boolean;
  isTrialActive: () => boolean;
  isSubscriptionActive: () => boolean;
  canAccessApp: () => boolean;
  daysRemainingInTrial: () => number;
  seatUsagePercentage: () => number;
}

export const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set, get) => ({
      currentOrganization: null,
      currentMembership: null,
      organizations: [],

      setCurrentOrganization: (org, membership) =>
        set({ currentOrganization: org, currentMembership: membership }),

      clearCurrentOrganization: () =>
        set({ currentOrganization: null, currentMembership: null }),

      setOrganizations: (orgs) => set({ organizations: orgs }),

      addOrganization: (org) =>
        set((state) => ({ organizations: [...state.organizations, org] })),

      removeOrganization: (orgId) =>
        set((state) => ({
          organizations: state.organizations.filter((o) => o.id !== orgId),
          ...(state.currentOrganization?.id === orgId
            ? { currentOrganization: null, currentMembership: null }
            : {}),
        })),

      updateOrganization: (orgId, updates) =>
        set((state) => ({
          organizations: state.organizations.map((o) =>
            o.id === orgId ? { ...o, ...updates } : o
          ),
          currentOrganization:
            state.currentOrganization?.id === orgId
              ? { ...state.currentOrganization, ...updates }
              : state.currentOrganization,
        })),

      isLeader: () => {
        const state = get();
        return state.currentMembership?.role === 'leader';
      },

      isTrialActive: () => {
        const state = get();
        const org = state.currentOrganization;
        if (!org) return false;

        return org.subscriptionStatus === 'trial' && Date.now() < org.trialEndDate;
      },

      isSubscriptionActive: () => {
        const state = get();
        return state.currentOrganization?.subscriptionStatus === 'active';
      },

      canAccessApp: () => {
        const state = get();
        return state.isTrialActive() || state.isSubscriptionActive();
      },

      daysRemainingInTrial: () => {
        const state = get();
        const org = state.currentOrganization;
        if (!org || org.subscriptionStatus !== 'trial') return 0;

        const msRemaining = org.trialEndDate - Date.now();
        return Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
      },

      seatUsagePercentage: () => {
        const state = get();
        const org = state.currentOrganization;
        if (!org) return 0;

        // This would need to be fetched from API
        // For now, return placeholder
        return 0;
      },
    }),
    { name: 'organization-storage' }
  )
);
