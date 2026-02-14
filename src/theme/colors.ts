// Zen Ink Color System
// Inspired by Japanese calligraphy and modern zen aesthetics

export const lightColors = {
  // Backgrounds
  background: '#FAF8F5', // warm cream, like aged paper
  surface: '#FFFFFF', // white
  canvas: '#FFF9F0', // soft cream with warmth

  // Text & Primary
  primary: '#2D2D2D', // rich black ink
  secondary: '#6B5B4F', // warm brown, like aged wood

  // Accents
  accent: '#007AFF', // iOS system blue
  accentLight: '#3395FF', // lighter blue for hover states
  accentText: '#FFFFFF', // white text on blue backgrounds

  // Semantic
  success: '#4A7C59', // matcha green
  successLight: '#dcfce7', // light green background
  error: '#C45B4D', // soft red
  errorLight: '#fee2e2', // light red background

  // Neutral
  muted: '#9C9184', // warm gray
  border: '#E8E4DF', // subtle warm border
  borderStrong: '#D4CFC8', // stronger border

  // Shadows
  shadow: 'rgba(45, 45, 45, 0.08)',
  shadowMedium: 'rgba(45, 45, 45, 0.12)',
  shadowStrong: 'rgba(45, 45, 45, 0.16)',
};

export const darkColors = {
  // Backgrounds
  background: '#1A1918', // deep warm black
  surface: '#242220', // elevated surface
  canvas: '#2A2725', // dark paper feel

  // Text & Primary
  primary: '#F5F2ED', // off-white
  secondary: '#B8A99A', // warm tan

  // Accents
  accent: '#c8e64a', // bright lime green
  accentLight: '#d4f05a', // lighter lime for hover states
  accentText: '#0a0a0f', // dark text for use on bright accent backgrounds

  // Semantic
  success: '#6B9B7A', // muted green
  successLight: '#2D3D32', // dark green background
  error: '#D47A6F', // soft red
  errorLight: '#3D2A28', // dark red background

  // Neutral
  muted: '#6B645C', // muted warm gray
  border: '#3A3634', // subtle border
  borderStrong: '#4A4542', // stronger border

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.2)',
  shadowMedium: 'rgba(0, 0, 0, 0.3)',
  shadowStrong: 'rgba(0, 0, 0, 0.4)',
};

export type ColorScheme = typeof lightColors;
