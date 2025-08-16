// GET, PUT merchant data
export async function GET(req: Request, { params }: { params: { id: string } }) {
  // TODO: Implement merchant data retrieval
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  // TODO: Implement merchant data update
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
