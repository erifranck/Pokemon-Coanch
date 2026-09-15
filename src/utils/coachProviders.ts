const PROVIDERS_KEY = 'poke-coach-providers';
const ACTIVE_PROVIDER_KEY = 'poke-coach-active-provider';

export interface ProviderConfig {
  id: string;
  provider: 'deepseek' | 'openai' | 'claude' | 'gemini';
  model: string;
  apiKey: string;
  label: string;
}

export const PROVIDER_MODELS: Record<string, { name: string; models: { id: string; name: string }[] }> = {
  deepseek: {
    name: 'Deepseek',
    models: [
      { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro' },
      { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash (non-thinking)' },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner (thinking)' },
      { id: 'deepseek-chat', name: 'DeepSeek Chat (legacy)' },
    ],
  },
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-5.5', name: 'GPT-5.5 (latest)' },
      { id: 'gpt-5.4', name: 'GPT-5.4' },
      { id: 'gpt-5.4-mini', name: 'GPT-5.4 Mini' },
      { id: 'gpt-5.4-nano', name: 'GPT-5.4 Nano' },
      { id: 'gpt-5', name: 'GPT-5' },
      { id: 'gpt-4.1', name: 'GPT-4.1' },
      { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini' },
      { id: 'o4-mini', name: 'o4 Mini' },
      { id: 'o3', name: 'o3' },
      { id: 'o3-mini', name: 'o3 Mini' },
    ],
  },
  claude: {
    name: 'Claude',
    models: [
      { id: 'claude-opus-4-7', name: 'Claude Opus 4.7 (latest)' },
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6' },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5' },
      { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5' },
      { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5' },
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4 (deprecated)' },
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4 (deprecated)' },
    ],
  },
  gemini: {
    name: 'Gemini',
    models: [
      { id: 'gemini-2.5-pro-exp-03-25', name: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.5-flash-preview-04-17', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    ],
  },
};

export function loadProviders(): ProviderConfig[] {
  try {
    const raw = localStorage.getItem(PROVIDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProviders(providers: ProviderConfig[]): void {
  localStorage.setItem(PROVIDERS_KEY, JSON.stringify(providers));
}

export function saveProvider(config: ProviderConfig): void {
  const providers = loadProviders().filter((p) => p.id !== config.id);
  providers.push(config);
  saveProviders(providers);
}

export function deleteProvider(id: string): void {
  const providers = loadProviders().filter((p) => p.id !== id);
  saveProviders(providers);
  const activeId = getActiveProviderId();
  if (activeId === id) {
    const next = providers[0];
    setActiveProviderId(next?.id || '');
  }
}

export function getActiveProviderId(): string {
  return localStorage.getItem(ACTIVE_PROVIDER_KEY) || '';
}

export function setActiveProviderId(id: string): void {
  localStorage.setItem(ACTIVE_PROVIDER_KEY, id);
}

export function getActiveProvider(): ProviderConfig | null {
  const id = getActiveProviderId();
  if (!id) return null;
  return loadProviders().find((p) => p.id === id) || null;
}

export function generateProviderId(): string {
  return `provider_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}
