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

export async function loginAction(formData: FormData): Promise<LoginResponse> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : `${process.env.NEXT_PUBLIC_BASE_URL}`;
        const bodyData = {
            "email": email,
            "password": password
        };
        const response = await fetch(`${baseUrl}/get/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData),
            cache: "no-store",
        });

        const data = await response.json();
        if (data.status === "Success") {
            const authToken = data?.access_token;
            const userType = data?.profile_type === 1 ? "Analyst" : data?.profile_type === 2 ? "Provider" : "";

            const cookieStore = await cookies();
            cookieStore.set("authToken", authToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 3 * 60 * 60,
                path: "/",
            });
            cookieStore.set("userType", userType, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 3 * 60 * 60, // 3 Hours
                path: "/",
            });

            TokenManager.setToken(authToken);

            return {
                success: true,
                userType: userType,
                userRoles: data.user_id,
                token: authToken,
                message: data.message
            };
        } else {
            return {
                success: false,
                error: "Invalid email or password. Please try again.",
                token: "",
                message: data?.message
            };
        }
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

