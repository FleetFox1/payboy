import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server';
import { z } from 'zod';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const ProductFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  image: z.instanceof(File).optional()
});

// Mock data storage (replace with real DB later)
let mockProducts: any[] = [
  {
    id: '1',
    name: 'Sample T-Shirt',
    description: 'A comfortable cotton t-shirt',
    price: '29.99',
    imageUrl: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2', 
    name: 'Coffee Mug',
    description: 'Perfect for your morning coffee',
    price: '15.50',
    imageUrl: null,
    createdAt: new Date().toISOString(),
  }
];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const rawFormData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: formData.get('price'),
      image: formData.get('image'),
    };

    const validatedForm = ProductFormSchema.parse(rawFormData);

    const product = {
      id: crypto.randomUUID(),
      name: validatedForm.name,
      description: validatedForm.description ?? '',
      price: validatedForm.price,
      imageUrl: null, // Backend dev will handle image uploads
      createdAt: new Date().toISOString(),
    };

    // Add to mock data
    mockProducts.push(product);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(mockProducts);
}