import type { LoginCredentials } from '@/domains/auth/model/auth.schema'

const DEMO_EMAIL = 'viiccwen@gmail.com'
const PASSWORD_SALT = 'fearyn-demo-v1-2026-09'
const PASSWORD_HASH = 'b8e4567292d30fc9a310dfdd8ed770284028e67178fba7081873899d69bab175'
const PBKDF2_ITERATIONS = 120_000

function bytesToHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false

  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return difference === 0
}

export async function hashDemoPassword(password: string) {
  const encoder = new TextEncoder()
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(PASSWORD_SALT),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    256,
  )
  return bytesToHex(hash)
}

export async function verifyDemoCredentials({ email, password }: LoginCredentials) {
  if (email.trim().toLowerCase() !== DEMO_EMAIL) return false
  const passwordHash = await hashDemoPassword(password)
  return constantTimeEqual(passwordHash, PASSWORD_HASH)
}