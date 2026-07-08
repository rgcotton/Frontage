import { pageShell, resolveTheme } from './layout.js';

export function buildPages(om, ctx) {
  const theme = ctx.theme || resolveTheme(om.branding);
  const inner = theme.components.coverPage(om, ctx, theme.tokens);
  return [pageShell(inner)];
}
