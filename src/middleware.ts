import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { resetReduxStore } from "./store";

export function middleware(request: NextRequest) {
    const lastBuildId = request.cookies.get("buildId")?.value;
    const buildId = process.env.NEXT_PUBLIC_BUILD_ID;

    const authToken = request.cookies.get("authToken")?.value;
    if (!authToken) {
        setTimeout(() => {
            resetReduxStore();
        }, 1000);
    }
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
        if (!authToken) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    if (request.nextUrl.pathname === "/" && authToken) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (buildId && lastBuildId && lastBuildId !== buildId) {
        const response = NextResponse.redirect(new URL("/", request.url));
        request.cookies.getAll().forEach(cookie => {
            response.cookies.delete(cookie.name);
        });
        response.cookies.set("buildId", buildId, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
        });
        return response;
    }
    if (buildId && !lastBuildId) {
        const response = NextResponse.next();
        response.cookies.set("buildId", buildId, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
        });
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/document/:path*", "/dashboard/:path*", "/profile/:path*"],
};
