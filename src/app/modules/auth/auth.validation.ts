import { Role } from '@prisma/client';
import { z } from 'zod';

const LoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string(),
  }),
});

const RegisterSchema = z.object({
  body: z.object({
    full_name: z.string().min(3).max(255),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum([Role.ADMIN, Role.USER]),
  }),
});

const ChangePasswordSchema = z.object({
  body: z.object({
    old_password: z.string(),
    new_password: z.string(),
  }),
});

const AuthValidation = { LoginSchema, RegisterSchema, ChangePasswordSchema };

export default AuthValidation;
