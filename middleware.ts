import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Maintenance mode: short-circuit all matched requests with 503
  const maintenance = process.env.MAINTENANCE_MODE;
  if (typeof maintenance === "string" && maintenance.toLowerCase() === "true") {
    return new NextResponse(
      `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Service Unavailable</title>
    <style>
      body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background: #0b0b0c; color: #e6e6e6; }
      .wrap { min-height: 100vh; display: grid; place-items: center; padding: 2rem; }
      .card { max-width: 36rem; text-align: center; }
      h1 { font-size: 1.5rem; margin: 0 0 .5rem; }
      p { margin: .25rem 0; color: #b3b3b3; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <h1>We’ll be right back</h1>
        <p>The application is under maintenance. Please try again later.</p>
      </div>
    </div>
  </body>
</html>`,
      {
        status: 503,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "retry-after": "600",
        },
      }
    );
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
