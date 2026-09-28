import { Prisma } from './generated/prisma/client.js';

// All money math uses exact decimals; rounding happens only here, when a value leaves the API.
export function toMoney(value: Prisma.Decimal): number {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP).toNumber();
}
