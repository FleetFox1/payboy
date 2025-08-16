import { z } from 'zod'

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.string().or(z.number()),
  imageUrl: z.string().nullable(),
  createdAt: z.string().datetime()
})

export type Product = z.infer<typeof ProductSchema>