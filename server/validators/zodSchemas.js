const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  role: z.enum(['user', 'admin']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

const subscribeSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name must not be empty').trim().optional(),
  email: z.string().email('Invalid email address').trim().toLowerCase().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .optional()
    .or(z.literal('')),
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
