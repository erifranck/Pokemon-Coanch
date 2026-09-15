/**
 * Shared regulation constant.
 *
 * Current active regulation: Pokemon Champions VGC 2026 Reg M-C.
 * To move to a new regulation:
 *   1. Update this constant
 *   2. Update FORMATS_TO_EXTRACT in scripts/update-rules.ts
 *   3. Run `npm run update-data`
 */
export const DEFAULT_REGULATION = 'gen9championsvgc2026regmc';
