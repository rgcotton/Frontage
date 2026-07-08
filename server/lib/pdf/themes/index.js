import institutional from './institutional.js';
import editorial from './editorial.js';
import bold from './bold.js';
import minimal from './minimal.js';

export const THEMES = {
  institutional,
  editorial,
  bold,
  minimal,
};

/**
 * Returns the active theme with brokerage color/logo overrides merged.
 * Falls back to 'institutional' on unknown template key.
 */
export function resolveTheme(branding = {}) {
  const base = THEMES[branding.template] || THEMES.institutional;
  // Merge brokerage overrides into tokens
  const tokens = { ...base.tokens };
  if (branding.primaryColor) tokens.primaryColor = branding.primaryColor;
  if (branding.accentColor) tokens.accentColor = branding.accentColor;
  if (branding.logo) tokens.logo = branding.logo;
  return { ...base, tokens };
}
