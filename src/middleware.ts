import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logoutAction } from "./app/action/auth-actions";
import { resetReduxStore } from "./store";

export function middleware(request: NextRequest) {
    const authToken = request.cookies.get("authToken")?.value;
    const userType = request.cookies.get("userType")?.value;
    if (!authToken) {
        logoutAction();
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
        return NextResponse.redirect(new URL(userType === "Provider" ? "/dashboard" : userType === "Analyst" ? "/dashboard" : "", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/document/:path*", "/dashboard/:path*", "/profile/:path*"],
};

