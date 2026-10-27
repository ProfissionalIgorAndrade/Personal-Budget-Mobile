// Same palettes and lists as the web app (PersonalBudgetUI core/constants), so
// records created on the phone look the same on the web.

export const COLORS = [
  '#2dd4bf', '#fb923c', '#4ade80', '#f87171', '#818cf8', '#fbbf24',
  '#e879f9', '#60a5fa', '#34d399', '#f472b6', '#a78bfa', '#6ee7b7',
];

export const CATEGORY_ICONS = [
  '🍽️', '🚗', '🏥', '🎮', '📚', '🏠', '💰', '💵', '👕', '📦', '📈', '📺',
  '✈️', '🎵', '💊', '🐾', '🛒', '⚡', '📱', '🎁', '🏋️', '🍺', '☕', '🎓', '💇', '🏖️', '🧴', '🎪',
];

export const MEMBER_EMOJIS = ['🙂', '👨', '👩', '🧑', '👦', '👧', '👶', '👴', '👵', '👪', '💑', '🏠', '🐶', '🐱'];

// Keys are the backend's Bank enum names (API contract); labels as on the web.
export const BANKS: { value: string; label: string; color: string }[] = [
  { value: 'Nubank', label: 'Nubank', color: '#8a05be' },
  { value: 'Itau', label: 'Itaú', color: '#f47321' },
  { value: 'Inter', label: 'Inter', color: '#ff7a00' },
  { value: 'Santander', label: 'Santander', color: '#cc0000' },
  { value: 'Bradesco', label: 'Bradesco', color: '#cc092f' },
  { value: 'Caixa', label: 'Caixa', color: '#006f3d' },
  { value: 'BancoDoBrasil', label: 'Banco do Brasil', color: '#fcd116' },
  { value: 'Btg', label: 'BTG Pactual', color: '#0c2340' },
  { value: 'C6Bank', label: 'C6 Bank', color: '#242424' },
  { value: 'Safra', label: 'Safra', color: '#0a2f5c' },
  { value: 'Sicoob', label: 'Sicoob', color: '#00a091' },
  { value: 'Sicredi', label: 'Sicredi', color: '#3fa535' },
  { value: 'Original', label: 'Banco Original', color: '#1fa447' },
  { value: 'Pan', label: 'Banco Pan', color: '#0090e3' },
  { value: 'Neon', label: 'Neon', color: '#00e5e5' },
  { value: 'PicPay', label: 'PicPay', color: '#21c25e' },
  { value: 'MercadoPago', label: 'Mercado Pago', color: '#00b1ea' },
  { value: 'Banrisul', label: 'Banrisul', color: '#0057a8' },
  { value: 'Next', label: 'Next', color: '#00ff5f' },
  { value: 'Bmg', label: 'Banco BMG', color: '#f26522' },
  { value: 'Xp', label: 'XP', color: '#1a1a1a' },
  { value: 'PagBank', label: 'PagBank', color: '#3ab54a' },
  { value: 'Bv', label: 'Banco BV', color: '#0033a0' },
  { value: 'Outro', label: 'Outro', color: '#64748b' },
];

export const ACCOUNT_NAME_MAX_LENGTH = 80;
export const DUE_DAY_SHORTCUTS = [1, 5, 10, 15, 20, 25];
