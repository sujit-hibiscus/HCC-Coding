"use server";

import { cookies } from "next/headers";
import { TokenManager } from "@/lib/api/api-client";

// Define types for the login response
export interface LoginResponse {
    success: boolean
    userType?: string
    userRoles?: string[]
    error?: string
    token: string
    message: string
}

const mockCredentials = {
    provider: {
        email: "provider@example.com",
        password: "provider123",
        userType: "Provider",
    },
    analyst: {
        email: "aadi.sujit@mailinator.com",
        password: "test@123",
        userType: "Analyst",
    },
};

export async function loginAction(formData: FormData): Promise<LoginResponse> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {

        let userType = "";
        if (email === mockCredentials.analyst.email && password === mockCredentials.analyst.password) {
            userType = mockCredentials.analyst.userType;
        } else if (email === mockCredentials.provider.email && password === mockCredentials.provider.password) {
            userType = mockCredentials.provider.userType;
        } else {
            return {
                success: false,
                error: "Invalid email or password.",
                token: "",
                message: "Login failed",
            };
        }

        const authToken = `${userType}-token-123`; // Mock token
        const cookieStore = await cookies();
        cookieStore.set("authToken", authToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 3 * 60 * 60,
            path: "/",
        });
        cookieStore.set("userType", userType, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 3 * 60 * 60, // 3 Hours
            path: "/",
        });

        TokenManager.setToken(authToken);

        return {
            success: true,
            userType: userType,
            userRoles: [],
            token: authToken,
            message: "Login successful"
        };

    } catch (error) {
        console.error("Login error:", error);
        return {
            success: false,
            error: "An error occurred during login. Please try again later.",
            token: "",
            message: ""
        };
    }
}

