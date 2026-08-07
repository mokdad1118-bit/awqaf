import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const SALT_LENGTH = 16
const KEY_LENGTH = 64
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 }

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH).toString('hex')
  const derivedKey = scryptSync(password, salt, KEY_LENGTH, SCRYPT_PARAMS)
  const hash = derivedKey.toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [salt, hash] = hashedPassword.split(':')
    if (!salt || !hash) return false
    
    const derivedKey = scryptSync(password, salt, KEY_LENGTH, SCRYPT_PARAMS)
    const derivedHash = derivedKey.toString('hex')
    
    // Use timing-safe comparison to prevent timing attacks
    const hashBuffer = Buffer.from(hash, 'hex')
    const derivedBuffer = Buffer.from(derivedHash, 'hex')
    
    if (hashBuffer.length !== derivedBuffer.length) return false
    
    return timingSafeEqual(hashBuffer, derivedBuffer)
  } catch (error) {
    return false
  }
}
