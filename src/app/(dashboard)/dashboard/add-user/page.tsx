"use client";

import type React from "react";

import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";

import { UserTable } from "@/components/common/user";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useRedux } from "@/hooks/use-redux";
import useToast from "@/hooks/use-toast";
import type { UserTypes } from "@/lib/types/PrevisitTypes";
import type { RootState } from "@/store";
import { cancelEditing, resetForm, startEditing, updateField } from "@/store/slices/user-form-slice";
import { deleteUser, getAllUsers, registerUser, updateUser } from "@/store/slices/user-slice";

type ProfileType = "Analyst" | "Auditor" | "Admin"

const userSchema = z.object({
    Fname: z.string().min(1, "First name is required"),
    Lname: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    profile_type: z.enum(["Analyst", "Auditor", "Admin"]),
});

export default function AddUserPage() {
    const { dispatch, selector } = useRedux();
    const loading = selector((state: RootState) => state.user.loading);
    const reduxError = selector((state: RootState) => state.user.error);

    const formData = selector((state: RootState) => state.userForm);
    const isEditing = selector((state: RootState) => state.userForm.isEditing);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const { success, error } = useToast();

    useEffect(() => {
        if (reduxError) {
            error({ message: reduxError });
        }
    }, [reduxError, error]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dispatch(updateField({ field: name as any, value }));
    };

    const handleRadioChange = (value: ProfileType) => {
        dispatch(updateField({ field: "profile_type", value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const validationData = {
            Fname: formData.Fname,
            Lname: formData.Lname,
            email: formData.email.toLowerCase(),
            password: formData.password,
            profile_type: formData.profile_type,
        };

        const result = userSchema.safeParse(validationData);
        if (!result.success) {
            error({ message: result.error.errors[0].message });
            return;
        }

        try {
            if (isEditing && formData.editingId) {
                const updateData = {
                    id: formData.editingId as number,
                    userData: {
                        Fname: formData.Fname as string,
                        Lname: formData.Lname as string,
                        email: formData.email as string,
                        profile_type: formData.profile_type === "Analyst" ? 1 : formData.profile_type === "Auditor" ? (2 as number) : (3 as number),
                    },
                };

                const resultAction = await dispatch(updateUser(updateData));

                if (updateUser.fulfilled.match(resultAction)) {
                    success({ message: "User updated successfully" });
                    dispatch(resetForm());
                }
            } else {
                const registerData = {
                    Fname: formData.Fname,
                    Lname: formData.Lname,
                    email: formData.email,
                    password: formData.password || "",
                    profile_type: formData.profile_type === "Analyst" ? 1 : formData.profile_type === "Auditor" ? (2 as number) : (3 as number),
                };

                const resultAction = await dispatch(registerUser(registerData));

                if (registerUser.fulfilled.match(resultAction)) {
                    success({ message: resultAction?.payload });
                    dispatch(resetForm());
                }
            }
        } catch (err) {
            error({ message: `Error: ${(err as Error).message}` });
        } finally {
            setTimeout(async () => {
                await dispatch(getAllUsers());
            });
        }
    };

    const handleEdit = (user: UserTypes) => {
        dispatch(
            startEditing({
                id: user.id,
                userData: {
                    Fname: user.Fname,
                    Lname: user.Lname,
                    email: user.email,
                    password: "",
                    profile_type: user.profile_type as "Analyst" | "Auditor" | "Admin",
                },
            }),
        );
    };

    const handleDelete = (id: number) => {
        setUserToDelete(id);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            try {
                const resultAction = await dispatch(deleteUser(userToDelete));

                if (deleteUser.fulfilled.match(resultAction)) {
                    success({ message: resultAction.payload.message });
                    dispatch(getAllUsers());
                }
            } catch (err) {
                error({ message: `Error: ${(err as Error).message}` });
            }
        }
        setShowDeleteDialog(false);
        setUserToDelete(null);
        dispatch(resetForm());
    };

    return (
        <>
            <div className="p-2 h-full mx-auto space-y-4 flex flex-col">
                <h1 className="text-3xl font-bold">{isEditing ? "Edit User" : "Add New User"}</h1>
                <div>
                    <form onSubmit={handleSubmit}>
                        <div className="hidden">
                            <input placeholder="id" title="username" type="text" name="fake-username" autoComplete="username" />
                            <input placeholder="password" type="password" name="fake-password" autoComplete="new-password" />
                        </div>

                        <div className="grid grid-cols-1 items-center md:grid-cols-6 gap-4">
                            <div>
                                <Label htmlFor="Fname" className="text-xs">
                                    First Name
                                </Label>
                                <Input
                                    id="Fname" name="Fname" placeholder="First name" value={formData.Fname} onChange={handleChange} required />
                            </div>

                            <div>
                                <Label htmlFor="Lname" className="text-xs">
                                    Last Name
                                </Label>
                                <Input id="Lname" name="Lname" placeholder="Last name" value={formData.Lname} onChange={handleChange} required />
                            </div>

                            <div>
                                <Label htmlFor="email" className="text-xs">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    autoComplete="off"
                                    type="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="lowercase"
                                />
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-xs">
                                    Password
                                </Label>
                                <input title="password" type="password" name="fake-password" autoComplete="off" className="hidden" />
                                <PasswordInput
                                    autoComplete="new-password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Password"
                                    data-lpignore="true" // LastPass ignore
                                />
                            </div>

                            <div className="flex flex-col justify-center gap-3">
                                <Label className="text-xs">User Type</Label>
                                <RadioGroup
                                    value={typeof formData.profile_type !== "number" ? formData.profile_type : ""}
                                    onValueChange={handleRadioChange}
                                    className="flex items-center gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Analyst" id="analyst" />
                                        <Label htmlFor="analyst">Analyst</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Auditor" id="Auditor" />
                                        <Label htmlFor="Auditor">Auditor</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Admin" id="Admin" />
                                        <Label htmlFor="Admin">Admin</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="flex gap-2 ml-auto">
                                {isEditing && (
                                    <Button type="button" variant="outline" onClick={() => dispatch(cancelEditing())}>
                                        Cancel
                                    </Button>
                                )}
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Saving..." : isEditing ? "Update User" : "Add User"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>

                <Separator />
                <UserTable onEdit={handleEdit} onDelete={(id) => handleDelete(Number(id))} />
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user and remove their data from our
                            servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

