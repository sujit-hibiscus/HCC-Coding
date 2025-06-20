"use client";

import type React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useToast from "@/hooks/use-toast";
import { postData } from "@/lib/api/api-client";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ForgotPasswordProps {
    triggerComponent?: React.ReactNode,
}


interface ApiResponse {
    status: "Success" | "Not Found" | "Error"; // Assuming status could be "Failure" too
    message: string;
}
export function ForgotPassword({ triggerComponent }: ForgotPasswordProps) {
    console.info("🚀 ~ ForgotPassword ~ triggerComponent:", triggerComponent);
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const { success, error: showError } = useToast();

    const resetForm = () => {
        setEmail("");
        setMessage(null);
    };

    const handleClose = () => {
        if (!isLoading) {
            setIsOpen(false);
            resetForm();
        }
    };

    const handleForgotPassword = async () => {
        if (!email || !email.includes("@")) {
            setMessage({ type: "error", text: "Please enter a valid email address" });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const response = await postData<ApiResponse>("/get/forgot-password/", { email });
            if (response.data.status === "Success") {
                success({ message: `${response?.data.message}` });
                setIsOpen(false);
                setTimeout(() => {
                    resetForm();
                });
            } else {
                showError({ message: `${response?.data.message}` });
            }

        } catch (error: unknown) {

            let errorMessage = "An unexpected error occurred. Please try again later.";

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === "object" && error !== null && "response" in error) {
                const axiosError = error as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || errorMessage;
            }

            setMessage({ type: "error", text: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <VisuallyHidden>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Forgot Password</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 ">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                // readOnly
                                className="lowercase"
                                onChange={(e) => {
                                    setEmail(e.target.value.toLowerCase());
                                }}
                            // disabled={isLoading}
                            />
                        </div>

                        {message && (
                            <Alert
                                className={
                                    message.type === "success"
                                        ? "bg-green-50 border-green-200 text-green-800"
                                        : "bg-red-50 border-red-200 text-red-800"
                                }
                            >
                                <AlertDescription>{message.text}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <DialogFooter>
                        <div className="w-full flex justify-between">
                            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button onClick={handleForgotPassword} disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Submit"
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </VisuallyHidden>
        </Dialog>
    );
}

