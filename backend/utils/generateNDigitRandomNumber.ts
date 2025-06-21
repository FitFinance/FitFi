import crypto from 'crypto';

export default function generateNDigitRandomNumber(length: number): number {
  if (length <= 0) return 0;
  const min: number = Math.pow(10, length - 1);
  const max: number = Math.pow(10, length) - 1;
  const range: number = max - min + 1;
  const randomBytes: number = crypto.randomBytes(6).readUIntBE(0, 6);
  const randomNumber: number = min + (randomBytes % range);
  return randomNumber;
}
