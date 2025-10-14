import { z } from 'zod';

export const AsseptMessageSchema = z.object({
    acceptMessages: z.boolean()
});