import LoginIMage from "@/components/common/LoginIMage";
import LoginForm from "@/components/layout/LoginForm";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import { HomePageMetaData } from "@/lib/MetaData";

import { Metadata } from "next";

export const metadata: Metadata = HomePageMetaData;
export default function LoginPage() {

    return (
        <div className="flex min-h-screen items-center justify-center p-6 bg-[#ffffff] dark:bg-gray-900">
            <div className="flex flex-col gap-7 items-center w-full max-w-xl p-5 bg-white dark:bg-gray-800 ">
                {/* Brand Logo */}
                <LoginIMage />
                {/* Login Form Container */}
                <Card className="border-0 rounded-none pt-5 w-full shadow-lg  bg-back backdrop-blur-sm">

                    <CardContent>
                        <div className="w-full">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Login</h2>
                                <ThemeToggle />
                            </div>

                            {/* Login Form */}
                            <LoginForm />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
