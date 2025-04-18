"use client";

import type React from "react";
import { useState, useEffect } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useRedux } from "@/hooks/use-redux";
import useToast from "@/hooks/use-toast";
import { postData } from "@/lib/api/api-client";
import { Loader2 } from "lucide-react";

interface ChangePasswordProps {
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
    isOpen: boolean // Add isOpen prop to track dialog state
}

export function ChangePassword({ setIsOpen, isOpen }: ChangePasswordProps) {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const { showPromiseToast } = useToast();
    const { selector } = useRedux();
    const userId = selector((state) => state.user.userRoles);

    // Reset form when dialog opens or closes
    useEffect(() => {
        // When dialog closes, reset the form
        if (!isOpen) {
            setTimeout(() => {
                resetForm();
            }, 500);
        }
    }, [isOpen]);

    const resetForm = () => {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setMessage(null);
    };

    const handleClose = () => {
        if (!isLoading) {
            setIsOpen(false);
        }
    };

    const handleChangePassword = async () => {
        if (!oldPassword) {
            setMessage({ type: "error", text: "Please enter your current password" });
            return;
        }

        if (!newPassword) {
            setMessage({ type: "error", text: "Please enter a new password" });
            return;
        }
        if (!(confirmPassword?.length > 0)) {
            setMessage({ type: "error", text: "Please enter a confirm password" });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const changePasswordPromise = new Promise<void>(async (resolve, reject) => {
                try {
                    const response = (await postData("/get/change-password/", {
                        user_id: userId,
                        old_password: oldPassword,
                        new_password: newPassword,
                    })) as {
                        data: {
                            message: string
                        }
                    };

                    if (response.data) {
                        setIsOpen(false);
                        // No need to reset form here as the useEffect will handle it
                        resolve();
                        setIsLoading(false);
                    } else {
                        reject(new Error("Unexpected response format"));
                        setIsLoading(false);
                    }
                } catch (error) {
                    reject(error);
                    setIsLoading(false);
                }
            });

            showPromiseToast({
                promise: changePasswordPromise,
                loading: "Updating password...",
                success: "Password updated successfully!",
                error: "Failed to update password. Please try again.",
            });
        } catch (error: unknown) {
            setIsLoading(false);
            let errorMessage = "An unexpected error occurred. Please try again later.";

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === "object" && error !== null && "response" in error) {
                const axiosError = error as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || errorMessage;
            }

            setMessage({ type: "error", text: errorMessage });
        }
    };

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <PasswordInput
                        id="current-password"
                        placeholder="Enter your old password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <PasswordInput
                        id="new-password"
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <PasswordInput
                        id="confirm-password"
                        placeholder="Enter your confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
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
                    <Button onClick={handleChangePassword} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Changing...
                            </>
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
    );
}

