const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['user', 'admin']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

const subscribeSchema = z.object({
  planId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid plan ID format'),
});

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name must not be empty').trim().optional(),
  email: z.string().email('Invalid email address').trim().toLowerCase().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long').optional(),
}).refine(data => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: 'Current password is required to set a new password',
  path: ['currentPassword'],
});

module.exports = {
  registerSchema,
  loginSchema,
  subscribeSchema,
  updateProfileSchema,
};
