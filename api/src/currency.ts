const CURRENCIES = ['EUR', 'USD'];

// One currency for the whole app. It is read once when the app starts, so a typo
// in CURRENCY stops the app right away instead of showing the wrong currency later.
function readCurrency(): string {
  const currency = process.env.CURRENCY ?? 'EUR';
  if (!CURRENCIES.includes(currency)) {
    throw new Error(`CURRENCY must be one of ${CURRENCIES.join(', ')} (got ${currency})`);
  }
  return currency;
}

export const CURRENCY = readCurrency();
