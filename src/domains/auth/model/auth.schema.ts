import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email('請輸入有效的電子郵件'),
  password: z.string().min(1, '請輸入密碼'),
})

export type LoginCredentials = z.infer<typeof loginSchema>