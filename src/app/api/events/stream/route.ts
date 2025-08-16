export async function GET() {
  const stream = new ReadableStream({
    start(ctrl) {
      // store ctrl somewhere; broadcast on events
    }
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}
