import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js'

import type { LoginCredentials } from '@/domains/auth/model/auth.schema'

const DEMO_EMAIL = 'viiccwen@gmail.com'
const PASSWORD_SALT = 'fearyn-demo-v2-mobile'
const PASSWORD_HASH = 'ec5501a01fa0583740c1508431f1254efef75b052f8816524612ff3b9eabcc63'

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false

  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return difference === 0
}

export async function hashDemoPassword(password: string) {
  return bytesToHex(sha256(utf8ToBytes(`${PASSWORD_SALT}:${password}`)))
}

export async function verifyDemoCredentials({ email, password }: LoginCredentials) {
  if (email.trim().toLowerCase() !== DEMO_EMAIL) return false
  const passwordHash = await hashDemoPassword(password)
  return constantTimeEqual(passwordHash, PASSWORD_HASH)
}