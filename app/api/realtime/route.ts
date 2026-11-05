import { realtime } from '@/lib/realtime';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial connection acknowledgement
      try {
        controller.enqueue(
          encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: 'connected', time: Date.now() })}\n\n`)
        );
      } catch {}

      // 2. Listener for realtime database mutations
      const onChange = (event: any) => {
        try {
          controller.enqueue(
            encoder.encode(`event: change\ndata: ${JSON.stringify(event)}\n\n`)
          );
        } catch {}
      };

      realtime.on('change', onChange);

      // 3. Heartbeat ping every 25 seconds to maintain active connection through proxies
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: ${Date.now()}\n\n`));
        } catch {
          clearInterval(interval);
        }
      }, 25000);

      // 4. Cleanup when client disconnects
      req.signal.addEventListener('abort', () => {
        realtime.off('change', onChange);
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
