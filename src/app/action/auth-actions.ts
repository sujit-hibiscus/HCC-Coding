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
    id: string
}


export async function logoutAction() {
    const cookieStore = cookies();
    (await cookieStore).set("authToken", "", {
        httpOnly: true,
        expires: new Date(0),
        path: "/",
    });
    (await cookieStore).set("userType", "", {
        httpOnly: true,
        expires: new Date(0),
        path: "/",
    });
}


const ROLE_CHOICES: readonly [number, string][] = [
    [1, "Super Admin"],
    [2, "Admin"],
    [3, "Analyst"],
    [4, "Auditor"],
];

const getUserType = (roleNumber: number) => {
    const roleMap = new Map(ROLE_CHOICES);
    return roleMap.get(roleNumber) || "Unknown Role";
};


export async function loginAction(formData: FormData): Promise<LoginResponse> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : "";
        const bodyData = {
            "email": email,
            "password": password
        };
        const response = await fetch(`${baseUrl}login_user/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData),
            cache: "no-store",
        });

        const data = await response.json();
        if (data.status === "Success") {
            const userType = data?.role_id ? getUserType(data?.role_id) : "";
            const authToken = data?.token;
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
                id: data?.user_id,
                message: "Login successful"
            };
        } else {
            return {
                success: false,
                error: "Invalid email or password. Please try again.",
                token: "",
                message: data?.message,
                id: ""
            };
        }

    } catch (error) {
        console.error("Login error:", error);
        return {
            success: false,
            error: "An error occurred during login. Please try again later.",
            token: "",
            message: "",
            id: ""
        };
    }
}

