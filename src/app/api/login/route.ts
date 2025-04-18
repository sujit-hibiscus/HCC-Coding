import { TokenManager } from "@/lib/api/api-client";
import { NextResponse } from "next/server";

type UserType = "Analyst" | "Provider";

interface User {
    userType: UserType;
    userId: string;
}

const users: Record<string, User> = {
    "admin@gmail.com": { userType: "Analyst", userId: "analyst-12345" },
    "profile@gmail.com": { userType: "Provider", userId: "provider-67890" },
};

export async function POST(request: Request) {
    const { email, password } = await request.json();

    if (users[email] && password === "admin") {
        const authToken = "your_secure_token_here";

        const { userType, userId } = users[email];
        const userRoles: string[] = ["admin"];

        const response = NextResponse.json({
            success: true,
            userType,
            userId,
            userRoles,
        });

        response.cookies.set("authToken", authToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3 * 60 * 60, // 3 hours
            path: "/",
        });

        TokenManager.setToken(authToken);

        return response;
    } else {
        return NextResponse.json({ success: false }, { status: 401 });
    }
}
