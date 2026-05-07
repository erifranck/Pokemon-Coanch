import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TeamCard, ThreatCard, Relationships, TeamProfile } from '../types/store';

interface AppState {
  teams: Record<string, TeamProfile>;
  activeTeamId: string;
  threats: ThreatCard[];
  relationships: Relationships;
  
  // Team Management Actions
  createTeam: (name?: string) => void;
  cloneTeam: () => void;
  deleteTeam: (id: string) => void;
  setActiveTeam: (id: string) => void;
  updateTeamRegulation: (id: string, regulation: string) => void;
  
  // Active Team Member Actions
  addTeamMember: (card: Omit<TeamCard, 'id' | 'isTeamMember'>) => void;
  updateTeamMember: (id: string, updates: Partial<TeamCard>) => void;
  removeTeamMember: (id: string) => void;
  
  // Threat Actions
  addThreat: (card: Omit<ThreatCard, 'id' | 'isTeamMember'>) => void;
  updateThreat: (id: string, updates: Partial<ThreatCard>) => void;
  removeThreat: (id: string) => void;
  
  // Relationship Actions
  linkThreat: (teamMemberId: string, threatId: string) => void;
  unlinkThreat: (teamMemberId: string, threatId: string) => void;
  
  // Data Export/Import
  exportData: () => string;
  importData: (jsonData: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const INITIAL_TEAM_ID = 'default-team';

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      teams: {
        [INITIAL_TEAM_ID]: { id: INITIAL_TEAM_ID, name: 'Team 1', regulation: 'gen9championsvgc2026regma', members: [] }
      },
      activeTeamId: INITIAL_TEAM_ID,
      threats: [],
      relationships: {},

      // Team Management
      createTeam: (name = 'New Team') => set((state) => {
        const id = generateId();
        return {
          teams: { ...state.teams, [id]: { id, name, regulation: 'gen9championsvgc2026regma', members: [] } },
          activeTeamId: id
        };
      }),

        cloneTeam: () => set((state) => {
          const activeTeam = state.teams[state.activeTeamId];
          if (!activeTeam) return state;
  
          const newId = generateId();
          // Ensure cloned members have the correct type for TeamCard
          const clonedMembers = activeTeam.members.map(m => ({ ...m, id: generateId(), isTeamMember: true as const }));
          
          return {
            teams: { 
              ...state.teams, 
              [newId]: { id: newId, name: `${activeTeam.name} (Copy)`, regulation: activeTeam.regulation, members: clonedMembers } 
            },
            activeTeamId: newId
          };
        }),

      deleteTeam: (id) => set((state) => {
        const newTeams = { ...state.teams };
        delete newTeams[id];
        
        // Prevent deleting the last team
        if (Object.keys(newTeams).length === 0) {
          const fallbackId = generateId();
          const newTeamProfile: TeamProfile = { id: fallbackId, name: 'Team 1', regulation: 'gen9championsvgc2026regma', members: [] };
          newTeams[fallbackId] = newTeamProfile;
          return { teams: newTeams, activeTeamId: fallbackId };
        }
        
        // If we deleted the active team, fallback to the first available
        const newActiveId = state.activeTeamId === id ? Object.keys(newTeams)[0] : state.activeTeamId;
        
        return { teams: newTeams, activeTeamId: newActiveId };
      }),

      setActiveTeam: (id) => set({ activeTeamId: id }),

      updateTeamRegulation: (id, regulation) => set((state) => {
        const team = state.teams[id];
        if (!team) return state;
        return {
          teams: { ...state.teams, [id]: { ...team, regulation } }
        };
      }),

      // Active Team Member Actions
      addTeamMember: (card) => set((state) => {
        const activeTeam = state.teams[state.activeTeamId];
        if (!activeTeam || activeTeam.members.length >= 6) return state;
        
        const id = generateId();
        const newMembers = [...activeTeam.members, { ...card, id, isTeamMember: true as const }];
        
        return {
          teams: { ...state.teams, [state.activeTeamId]: { ...activeTeam, members: newMembers } },
          relationships: { ...state.relationships, [id]: [] }
        };
      }),

      updateTeamMember: (id, updates) => set((state) => {
        const activeTeam = state.teams[state.activeTeamId];
        if (!activeTeam) return state;
        
        const newMembers = activeTeam.members.map(c => c.id === id ? { ...c, ...updates } : c);
        return {
          teams: { ...state.teams, [state.activeTeamId]: { ...activeTeam, members: newMembers } }
        };
      }),

      removeTeamMember: (id) => set((state) => {
        const activeTeam = state.teams[state.activeTeamId];
        if (!activeTeam) return state;
        
        const newMembers = activeTeam.members.filter(c => c.id !== id);
        
        const newRelationships = { ...state.relationships };
        delete newRelationships[id];
        
        return {
          teams: { ...state.teams, [state.activeTeamId]: { ...activeTeam, members: newMembers } },
          relationships: newRelationships
        };
      }),

      // Threat Actions
      addThreat: (card) => set((state) => ({
        threats: [...state.threats, { ...card, id: generateId(), isTeamMember: false }]
      })),

      updateThreat: (id, updates) => set((state) => ({
        threats: state.threats.map((c) => (c.id === id ? { ...c, ...updates } : c))
      })),

      removeThreat: (id) => set((state) => {
        const newRelationships = { ...state.relationships };
        for (const teamId in newRelationships) {
          newRelationships[teamId] = newRelationships[teamId].filter(tId => tId !== id);
        }
        return {
          threats: state.threats.filter((c) => c.id !== id),
          relationships: newRelationships
        };
      }),

      // Relationship Actions
      linkThreat: (teamMemberId, threatId) => set((state) => {
        const currentLinks = state.relationships[teamMemberId] || [];
        if (currentLinks.includes(threatId)) return state;
        return {
          relationships: {
            ...state.relationships,
            [teamMemberId]: [...currentLinks, threatId]
          }
        };
      }),

      unlinkThreat: (teamMemberId, threatId) => set((state) => {
        const currentLinks = state.relationships[teamMemberId] || [];
        return {
          relationships: {
            ...state.relationships,
            [teamMemberId]: currentLinks.filter(id => id !== threatId)
          }
        };
      }),

      // Export / Import
      exportData: () => {
        const state = get();
        return JSON.stringify({
          teams: state.teams,
          activeTeamId: state.activeTeamId,
          threats: state.threats,
          relationships: state.relationships
        }, null, 2);
      },

      importData: (jsonData: string) => {
        try {
          const data = JSON.parse(jsonData);
          // Simple migration if importing an old backup
          let importedTeams = data.teams;
          let importedActiveId = data.activeTeamId;
          
          if (!importedTeams && data.team) {
             importedTeams = { [INITIAL_TEAM_ID]: { id: INITIAL_TEAM_ID, name: 'Imported Team', regulation: 'gen9championsvgc2026regma', members: data.team } as TeamProfile };
             importedActiveId = INITIAL_TEAM_ID;
          }

          set({
            teams: (importedTeams || { [INITIAL_TEAM_ID]: { id: INITIAL_TEAM_ID, name: 'Team 1', regulation: 'gen9championsvgc2026regma', members: [] } }) as unknown as Record<string, TeamProfile>,
            activeTeamId: importedActiveId || INITIAL_TEAM_ID,
            threats: data.threats || [],
            relationships: data.relationships || {}
          } as unknown as Partial<AppState>);
        } catch (e) {
          console.error("Failed to import data", e);
        }
      }
    }),
    {
      name: 'poke-coach-storage',
      // Migration function for existing users who had `team: []`
      migrate: (persistedState: any, _version) => {
        if (persistedState && persistedState.team && !persistedState.teams) {
          return {
            ...persistedState,
            teams: {
              [INITIAL_TEAM_ID]: { id: INITIAL_TEAM_ID, name: 'Legacy Team', regulation: 'gen9championsvgc2026regma', members: persistedState.team }
            },
            activeTeamId: INITIAL_TEAM_ID,
            team: undefined // cleanup old key
          };
        }
        return persistedState as any;
      }
    }
  )
);
