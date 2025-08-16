import { NextRequest } from 'next/server';
import { verifyJWT } from './auth';

export async function getAuthenticatedUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  return await verifyJWT(token);
}

export function requireAuth() {
  return async (request: NextRequest) => {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }
    return user;
  };
}

// Helper for extracting user from any protected route
export async function withAuth(request: NextRequest, handler: (user: any) => Promise<Response>) {
  const user = await getAuthenticatedUser(request);
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return handler(user);
}