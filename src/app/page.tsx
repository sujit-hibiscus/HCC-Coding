import LoginIMage from "@/components/common/LoginIMage";
import LoginForm from "@/components/layout/LoginForm";
import { HomePageMetaData } from "@/lib/MetaData";

import type { Metadata } from "next";

export const metadata: Metadata = HomePageMetaData;
export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-6 bg-gray-100 dark:bg-gray-900">
            <div className="relative w-full max-w-xl">
                {/* Background decorative elements using only Tailwind classes */}
                <div className="absolute -top-10 -left-10 w-72 h-72 bg-primary-300/20 dark:bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl"></div>
                <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-blue-300/20 dark:bg-yellow-900/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary-300/20 dark:bg-pink-900/20 rounded-full mix-blend-multiply filter blur-3xl"></div>

                {/* Main content container */}
                <div className="relative flex flex-col gap-7 items-center w-full  py-5 px-6 max-w-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-sm " style={{ boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px" }}>
                    {/* Brand Logo */}
                    <LoginIMage />

                    {/* Login Form Container */}
                    <div className="border-0 w-full ">
                        <div className="">
                            <div className="w-full">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Login</h2>
                                    {/* <ThemeToggle /> */}
                                </div>

                                {/* Login Form */}
                                <LoginForm />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
