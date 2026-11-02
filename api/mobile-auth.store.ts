
import { randomBytes } from 'node:crypto';

interface MobileAuthCode {
  uid: string;
  state: string;
  expiresAt: number;
}

const codes = new Map<string, MobileAuthCode>();

const CODE_TTL = 60 * 1000;

export function createMobileAuthCode(
  uid: string,
  state: string,
): string {
  const code = randomBytes(32).toString('hex');

  codes.set(code, {
    uid,
    state,
    expiresAt: Date.now() + CODE_TTL,
  });

  return code;
}

export function redeemMobileAuthCode(
  code: string,
  state: string,
): string | null {
  const stored = codes.get(code);

  if (!stored) return null;

  // Always invalidate the code after an attempted redemption.
  codes.delete(code);

  if (stored.expiresAt < Date.now()) return null;
  if (stored.state !== state) return null;

  return stored.uid;
}
