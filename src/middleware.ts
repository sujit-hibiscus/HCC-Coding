import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const authToken = request.cookies.get("authToken")?.value;
    const { pathname } = request.nextUrl;

    // If there is no authToken and the user is trying to access a protected route (e.g., /dashboard)
    if (!authToken && pathname.startsWith("/dashboard")) {
        // Redirect unauthenticated users from protected routes to the login page (root path)
        return NextResponse.redirect(new URL("/", request.url));
    }

    // If there is an authToken and the user is trying to access the root path (login page)
    if (authToken && pathname === "/") {
        // Redirect authenticated users from the login page to the dashboard
        // Assuming userType specific redirection is handled elsewhere or /dashboard is default for all logged-in users.
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // For all other cases (authenticated users on protected routes, or unauthenticated users on public routes), allow access
    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/document/:path*", "/dashboard/:path*", "/profile/:path*"],
};

