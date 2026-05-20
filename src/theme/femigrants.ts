/** Brand palette aligned with https://femigrants.com/ */
export const FEMIGRANTS_THEME = {
  primary: '#582BB6',
  primaryDark: '#452094',
  primaryLight: '#7B52C9',
  primaryMuted: '#EDE8F5',
  primarySoft: '#F7F5FB',
  text: '#111827',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  white: '#ffffff',
  success: '#22c55e',
  /** Solid brand — floating icon, header, primary actions */
  solid: '#582BB6',
  hover: '#452094',
  gradient: 'linear-gradient(135deg, #582BB6 0%, #7B52C9 100%)',
  shadow: 'rgba(88, 43, 182, 0.35)',
  shadowHover: 'rgba(88, 43, 182, 0.45)',
} as const;

export const FEMIGRANTS_WIDGET_DEFAULTS = {
  primaryColor: FEMIGRANTS_THEME.primary,
  secondaryColor: FEMIGRANTS_THEME.primaryLight,
};
