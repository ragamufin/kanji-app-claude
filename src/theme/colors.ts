// Elevated Zen Color System
// Premium Japanese stationery meets modern design tool

export const lightColors = {
  // Backgrounds
  background: '#F7F4EF', // deeper warm parchment
  surface: '#FEFDFB', // barely off-white, premium paper
  canvas: '#FBF6ED', // warm drawing paper

  // Text & Primary
  primary: '#1C1917', // true ink black — deeper, richer
  secondary: '#57534E', // stone gray-brown

  // Accents — warm amber, like a hanko seal
  accent: '#B45309', // warm amber/burnt orange — signature color
  accentLight: '#D97706', // lighter amber hover
  accentText: '#FFFBEB', // warm cream on amber

  // Semantic
  success: '#3F6B54', // deeper matcha
  successLight: '#ECFDF5', // light green background
  error: '#B91C1C', // more decisive red
  errorLight: '#FEF2F2', // light red background

  // Neutral
  muted: '#A8A29E', // cool stone
  border: '#E7E5E4', // subtle stone border
  borderStrong: '#D6D3D1', // stronger stone

  // Shadows
  shadow: 'rgba(28, 25, 23, 0.06)',
  shadowMedium: 'rgba(28, 25, 23, 0.10)',
  shadowStrong: 'rgba(28, 25, 23, 0.14)',
};

export const darkColors = {
  // Backgrounds
  background: '#0C0A09', // deeper sumi ink
  surface: '#1C1917', // charcoal surface
  canvas: '#231F1D', // dark paper

  // Text & Primary
  primary: '#F5F5F4', // clean off-white
  secondary: '#A8A29E', // warm stone

  // Accents — warm gold, like gold leaf on lacquer
  accent: '#F59E0B', // warm gold
  accentLight: '#FBBF24', // lighter gold
  accentText: '#0C0A09', // deep black on gold

  // Semantic
  success: '#6B9B7A', // muted green
  successLight: '#2D3D32', // dark green background
  error: '#EF4444', // clear red
  errorLight: '#3D2A28', // dark red background

  // Neutral
  muted: '#57534E', // warm muted
  border: '#292524', // subtle border
  borderStrong: '#44403C', // stronger border

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.2)',
  shadowMedium: 'rgba(0, 0, 0, 0.3)',
  shadowStrong: 'rgba(0, 0, 0, 0.4)',
};

export type ColorScheme = typeof lightColors;
