import { NextResponse } from 'next/server';

const MAINTENANCE_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>AI Energy Analyst is temporarily paused</title>
    <style>
      :root {
        color-scheme: light;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #f8fafc;
        color: #0f172a;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 32px;
      }

      main {
        width: min(100%, 560px);
        border: 1px solid #dbe5e1;
        border-radius: 8px;
        background: #ffffff;
        padding: 32px;
        box-shadow: 0 24px 80px rgba(15, 23, 42, 0.08);
      }

      h1 {
        margin: 0 0 12px;
        font-size: 28px;
        line-height: 1.15;
      }

      p {
        margin: 0;
        color: #475569;
        font-size: 16px;
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>AI Energy Analyst is temporarily paused</h1>
      <p>This workspace is offline for a short maintenance window. Please check back later.</p>
    </main>
  </body>
</html>`;

export function middleware() {
  return new NextResponse(MAINTENANCE_HTML, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'Retry-After': '3600',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon-32.png|icon-192.png|apple-touch-icon.png|manifest.webmanifest).*)'],
};
