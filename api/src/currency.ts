const CURRENCIES = ['EUR', 'USD'];

// Read once at startup, so a wrong CURRENCY stops the app instead of showing the wrong currency.
function readCurrency(): string {
  const currency = process.env.CURRENCY ?? 'EUR';
  if (!CURRENCIES.includes(currency)) {
    throw new Error(`CURRENCY must be one of ${CURRENCIES.join(', ')} (got ${currency})`);
  }
  return currency;
}

export const CURRENCY = readCurrency();
