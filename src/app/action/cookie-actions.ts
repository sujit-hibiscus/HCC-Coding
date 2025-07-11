"use server";

import { cookies } from "next/headers";

export async function setBuildIdCookie(buildId: string) {
    await resetAllCookies();
    const cookieStore = await cookies();
    cookieStore.set("buildId", buildId, {
        httpOnly: true,
        path: "/",
        maxAge: 365 * 24 * 60 * 60,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
}

export async function getBuildIdCookie() {
    const cookieStore = await cookies();
    const buildIdCookie = cookieStore.get("buildId");
    return buildIdCookie?.value;
}

export async function checkBuildIdStatus() {
    const cookieStore = await cookies();
    const lastBuildId = cookieStore.get("buildId")?.value;
    const currentBuildId = process.env.NEXT_PUBLIC_BUILD_ID;

    return {
        lastBuildId,
        currentBuildId,
        hasChanged: lastBuildId && currentBuildId && lastBuildId !== currentBuildId,
        needsInitialization: !lastBuildId && currentBuildId
    };
}

export async function handleBuildIdChange() {
    const cookieStore = await cookies();
    const currentBuildId = process.env.NEXT_PUBLIC_BUILD_ID;

    // Clear all cookies
    await resetAllCookies();

    // Set new build ID
    if (currentBuildId) {
        cookieStore.set("buildId", currentBuildId, {
            httpOnly: true,
            path: "/",
            maxAge: 365 * 24 * 60 * 60,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
    }

    return { success: true, newBuildId: currentBuildId };
}

export async function resetAllCookies() {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    for (const cookie of allCookies) {
        cookieStore.set(cookie.name, "", {
            expires: new Date(0),
            path: "/",
        });
    }
}
