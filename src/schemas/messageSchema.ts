import { z } from 'zod';

export const MessageSchema= z.object({
    content: z
    .string()
    .min(10, {message: 'Message content cannot be empty'})
    .max(300, {message: 'Message content cannot exceed 300 characters'})
});