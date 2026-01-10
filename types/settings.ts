export type SupportedLanguage = 'spanish' | 'chinese';

export interface LanguageConfig {
  label: string;
  nativeName: string;
  code: string;
}

export const LANGUAGE_CONFIG: Record<SupportedLanguage, LanguageConfig> = {
  spanish: { label: 'Spanish', nativeName: 'Español', code: 'es' },
  chinese: { label: 'Traditional Chinese', nativeName: '繁體中文', code: 'zh-TW' },
};

export interface AppSettings {
  targetLanguage: SupportedLanguage;
}

export const DEFAULT_SETTINGS: AppSettings = {
  targetLanguage: 'spanish',
};
