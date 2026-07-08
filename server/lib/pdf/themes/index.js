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
 *
 * The returned object has:
 *   .key, .label, .fonts, .components  — theme metadata
 *   .tokens                            — nested token object
 *   plus all token keys spread at the top level for backward compatibility
 *     (so theme.primaryColor === theme.tokens.primaryColor)
 */
export function resolveTheme(branding = {}) {
  const base = THEMES[branding.template] || THEMES.institutional;
  // Merge brokerage overrides into tokens
  const tokens = { ...base.tokens };
  if (branding.primaryColor) tokens.primaryColor = branding.primaryColor;
  if (branding.accentColor) tokens.accentColor = branding.accentColor;
  if (branding.logo) tokens.logo = branding.logo;
  // Spread tokens at top level so legacy code that accesses theme.primaryColor still works.
  return { ...base, ...tokens, tokens };
}
