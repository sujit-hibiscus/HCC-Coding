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
    analyst: {
        email: "analyst.sujit@mailinator.com",
        password: "test@123",
        userType: "Analyst",
    },
    auditor: {
        email: "auditor.sujit@mailinator.com",
        password: "test@123",
        userType: "Auditor",
    },
    admin: {
        email: "admin.sujit@mailinator.com",
        password: "test@123",
        userType: "Admin",
    },
};

export async function loginAction(formData: FormData): Promise<LoginResponse> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {

        let userType = "";
        if (email === mockCredentials.analyst.email && password === mockCredentials.analyst.password) {
            userType = mockCredentials.analyst.userType;
        } else if (email === mockCredentials.admin.email && password === mockCredentials.admin.password) {
            userType = mockCredentials.admin.userType;
        } else if (email === mockCredentials.auditor.email && password === mockCredentials.auditor.password) {
            userType = mockCredentials.auditor.userType;
        } else {
            return {
                success: false,
                error: "Invalid email or password.",
                token: "",
                message: "Login failed",
            };
        }

        const authToken = `${userType}-token-123`;
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
            maxAge: 3 * 60 * 60,
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

