import { useState, useEffect, useRef, useCallback } from 'react';

const SIM_KEY = 'poke-coach-simulator';

interface SimState {
  activeAllyId: string;
  activeThreatId: string;
  allySps: Record<string, number>;
  threatSps: Record<string, number>;
  weather: string;
  terrain: string;
  allyTailwind: boolean;
  threatTailwind: boolean;
  allyReflect: boolean;
  allyLightScreen: boolean;
  allyAuroraVeil: boolean;
  threatReflect: boolean;
  threatLightScreen: boolean;
  threatAuroraVeil: boolean;
  allyBurn: boolean;
  threatBurn: boolean;
  allyHelpingHand: boolean;
  threatHelpingHand: boolean;
  fairyAura: boolean;
  darkAura: boolean;
  gravity: boolean;
  allyBoosts: Record<string, number>;
  threatBoosts: Record<string, number>;
  gameType: 'Singles' | 'Doubles';
}

const defaultState: SimState = {
  activeAllyId: '',
  activeThreatId: '',
  allySps: {},
  threatSps: {},
  weather: '',
  terrain: '',
  allyTailwind: false,
  threatTailwind: false,
  allyReflect: false,
  allyLightScreen: false,
  allyAuroraVeil: false,
  threatReflect: false,
  threatLightScreen: false,
  threatAuroraVeil: false,
  allyBurn: false,
  threatBurn: false,
  allyHelpingHand: false,
  threatHelpingHand: false,
  fairyAura: false,
  darkAura: false,
  gravity: false,
  allyBoosts: {},
  threatBoosts: {},
  gameType: 'Doubles' as const,
};

function loadState(): SimState {
  try {
    const raw = sessionStorage.getItem(SIM_KEY);
    if (raw) return { ...defaultState, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultState };
}

function saveState(state: SimState) {
  sessionStorage.setItem(SIM_KEY, JSON.stringify(state));
}

export function useSimulatorState() {
  const [state, setState] = useState<SimState>(loadState);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    saveState(state);
  }, [state]);

  const update = useCallback((updates: Partial<SimState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Stable SP change handler that reads latest state via ref (avoids stale closure on rapid slider drags)
  const setAllySp = useCallback((stat: string, val: number) => {
    const current = stateRef.current;
    update({ allySps: { ...current.allySps, [stat]: val } });
  }, [update]);

  const setThreatSp = useCallback((stat: string, val: number) => {
    const current = stateRef.current;
    update({ threatSps: { ...current.threatSps, [stat]: val } });
  }, [update]);

  const reset = useCallback(() => {
    setState({ ...defaultState });
  }, []);

  return { ...state, updateSimulator: update, resetSimulator: reset, setAllySp, setThreatSp };
}
