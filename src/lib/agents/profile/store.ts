import { mockAgent, mockTeamAgents } from '../fixtures';
import type { Agent } from '@/types/agents';

const defaultChecklist = [
  { id: 'photo', label: 'Subir foto profesional', done: true },
  { id: 'bio', label: 'Añadir biografía breve', done: true },
  { id: 'specialties', label: 'Seleccionar especialidades', done: true },
  { id: 'reviews', label: 'Agregar 3 reseñas', done: false },
  { id: 'video', label: 'Subir video tour corto', done: false },
];

const STORAGE_KEY = 'agenthub_profile_completion';

type CompletionState = {
  completion: number;
  checklist: { id: string; label: string; done: boolean }[];
};

function loadState(): CompletionState {
  if (typeof window === 'undefined') return {
    completion: mockAgent.profileCompletion || 70,
    checklist: defaultChecklist,
  };
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return { completion: mockAgent.profileCompletion || 70, checklist: defaultChecklist };
  try {
    const parsed = JSON.parse(raw);
    return { completion: parsed.completion || 0, checklist: parsed.checklist || defaultChecklist };
  } catch (e) {
    return { completion: mockAgent.profileCompletion || 70, checklist: defaultChecklist };
  }
}

let state = loadState();

export function listAgents(): Agent[] {
  return mockTeamAgents;
}

export function getAgent(agentId?: string): Agent | undefined {
  if (!agentId) return mockAgent;
  return mockTeamAgents.find((a) => a.id === agentId);
}

export function getProfileState(): CompletionState {
  return state;
}

export function toggleChecklist(id: string) {
  state = {
    ...state,
    checklist: state.checklist.map((item) => item.id === id ? { ...item, done: !item.done } : item),
  };
  persist();
  recompute();
}

export function setCompletion(value: number) {
  state = { ...state, completion: value };
  persist();
}

function recompute() {
  const done = state.checklist.filter((i) => i.done).length;
  const total = state.checklist.length;
  const completion = Math.round((done / total) * 100);
  state = { ...state, completion };
  persist();
}

function persist() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
