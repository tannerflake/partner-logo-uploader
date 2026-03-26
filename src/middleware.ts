import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getAdminAllowlist } from "@/lib/env";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const allow = getAdminAllowlist();
    if (!user?.email || !allow.includes(user.email.toLowerCase())) {
      const redirect = NextResponse.redirect(
        new URL("/admin/login", request.url),
      );
      if (user) {
        await supabase.auth.signOut();
      }
      return redirect;
    }
  }

  if (pathname.startsWith("/admin/login") && user?.email) {
    const allow = getAdminAllowlist();
    if (allow.includes(user.email.toLowerCase())) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
  ],
};
