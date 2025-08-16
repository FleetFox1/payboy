// Update/view one need
export async function GET(req: Request, { params }: { params: { id: string } }) {
  // TODO: Implement need retrieval
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  // TODO: Implement need update
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
