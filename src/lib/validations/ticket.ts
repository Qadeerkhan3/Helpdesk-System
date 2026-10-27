import { z } from 'zod';

export const createTicketSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long').max(100, 'Title is too long'),
  description: z.string().min(10, 'Please provide a detailed description (at least 10 characters)'),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'], {
    errorMap: () => ({ message: 'Invalid priority level selected' }),
  }),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;