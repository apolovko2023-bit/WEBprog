// Єдине місце для бізнес-правил: межі класифікації шуму (dB).
// Числа 55 і 70 більше ніде в коді не дублюються.
export const NOISE_LIMITS = Object.freeze({
  normalMax: 55,   // до 55 dB включно — normal
  warningMax: 70   // понад 55 і до 70 dB включно — warning; понад 70 — critical
});

// Допустимий діапазон значень датчика (dB).
export const VALID_RANGE = Object.freeze({
  min: 0,
  max: 200
});