"use client";

import type React from "react";

import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";

import { UserTable } from "@/components/user-management/UserDataTable";
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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useRedux } from "@/hooks/use-redux";
import useToast from "@/hooks/use-toast";
import type { UserTypes } from "@/lib/types/chartsTypes";
import type { RootState } from "@/store";
import { cancelEditing, resetForm, startEditing, updateField, updateTargetField } from "@/store/slices/user-form-slice";
import { deleteUser, registerUser, updateUser } from "@/store/slices/user-slice";
import { notFound } from "next/navigation";
import { fetchAnalystUsers, fetchAuditorUsers } from "@/store/slices/DashboardSlice";

type ProfileType = "Analyst" | "Auditor" | "Admin" | "Super Admin"

const userSchema = z.object({
    Fname: z.string().min(1, "First name is required"),
    Lname: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long").optional().or(z.literal("")),
    profile_type: z.enum(["Analyst", "Auditor", "Admin", "Super Admin"]),
    target: z
        .object({
            dailyChartTarget: z.number().optional(),
            maxAssignments: z.number().optional(),
        })
        .optional(),
});


export default function AddUserPage() {
    const { dispatch, selector } = useRedux();
    const { userType } = selector(state => state.user);

    if (!(userType?.toLowerCase().includes("admin"))) {
        notFound();
    }

    const loading = selector((state: RootState) => state.user.loading);
    const reduxError = selector((state: RootState) => state.user.error);

    const formData = selector((state: RootState) => state.userForm);
    const isEditing = selector((state: RootState) => state.userForm.isEditing);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const { success, error } = useToast();

    // State for showing targets section
    const [showTargets, setShowTargets] = useState(false);
    useEffect(() => {
        if (reduxError) {
            error({ message: reduxError });
        }
    }, [reduxError, error]);

    useEffect(() => {
        // Show targets section for Analyst or Auditor
        setShowTargets(formData.profile_type === "Analyst" || formData.profile_type === "Auditor");
    }, [formData.profile_type]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dispatch(updateField({ field: name as any, value }));
    };

    const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = value ? Number(value) : undefined;

        dispatch(
            updateTargetField({
                field: name as "dailyChartTarget" | "maxAssignments",
                value: numValue,
            }),
        );
    };

    const handleUserTypeChange = (value: ProfileType) => {
        dispatch(updateField({ field: "profile_type", value }));
        setShowTargets(value === "Analyst" || value === "Auditor");
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Trim input values to prevent whitespace issues
        const validationData = {
            Fname: formData.Fname.trim(),
            Lname: formData.Lname.trim(),
            email: formData.email.toLowerCase().trim(),
            password: formData.password,
            profile_type: formData.profile_type,
            target: showTargets
                ? {
                    dailyChartTarget: formData.target?.dailyChartTarget,
                    maxAssignments: formData.target?.maxAssignments,
                }
                : undefined,
        };

        // Validate form data
        const result = userSchema.safeParse(validationData);
        if (!result.success) {
            const errorMessages = result.error.errors.map((err) => `${err.message}`).join(", ");
            error({ message: errorMessages });
            return;
        }

        // Add additional validation for target fields when they're shown
        if (showTargets) {
            if (formData.target?.dailyChartTarget !== undefined && formData.target.dailyChartTarget <= 0) {
                error({ message: "Daily chart target must be greater than 0" });
                return;
            }
            if (formData.target?.maxAssignments !== undefined && formData.target.maxAssignments <= 0) {
                error({ message: "Max assignments must be greater than 0" });
                return;
            }
        }

        try {
            if (isEditing && formData.editingId) {
                const updateData = {
                    id: formData.editingId as number,
                    userData: {
                        Fname: formData.Fname as string,
                        Lname: formData.Lname as string,
                        email: formData.email as string,
                        profile_type: formData.profile_type,
                        target: showTargets ? formData.target : undefined,
                    },
                };

                const resultAction = await dispatch(updateUser(updateData));

                if (updateUser.fulfilled.match(resultAction)) {
                    success({ message: "User updated successfully" });
                    dispatch(resetForm());
                    if (formData.profile_type === "Auditor") {
                        dispatch(fetchAuditorUsers());
                        dispatch(fetchAnalystUsers());
                    } else if (formData.profile_type === "Analyst") {
                        dispatch(fetchAuditorUsers());
                        dispatch(fetchAnalystUsers());
                    }
                }
            } else {
                const registerData = {
                    Fname: formData.Fname,
                    Lname: formData.Lname,
                    email: formData.email,
                    password: formData.password || "",
                    profile_type: formData.profile_type,
                    target: showTargets ? formData.target : undefined,
                    prodTarget: formData.target?.dailyChartTarget || 0,
                    maxAssign: formData.target?.maxAssignments || 0
                };

                const resultAction = await dispatch(registerUser(registerData));

                if (registerUser.fulfilled.match(resultAction)) {
                    success({ message: "User registered successfully" });
                    dispatch(resetForm());
                    if (formData.profile_type === "Auditor") {
                        dispatch(fetchAuditorUsers());
                    } else if (formData.profile_type === "Analyst") {
                        dispatch(fetchAnalystUsers());
                    }
                }
            }
        } catch (err) {
            error({ message: `Error: ${(err as Error).message}` });
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
                    password: user?.password,
                    profile_type: user.profile_type as ProfileType,
                    target: user.target,
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
                    success({ message: "User deleted successfully" });
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
            <div className="p-2 h-full mx-auto space-y-6 flex flex-col">
                <h1 className="text-3xl font-bold">{isEditing ? "Edit User" : "Add New User"}</h1>

                <Card className="shadow-sm border-none p-0">
                    <CardContent className="p-0">
                        <form onSubmit={handleSubmit}>
                            <div className="hidden">
                                <input placeholder="id" title="username" type="text" name="fake-username" autoComplete="username" />
                                <input placeholder="password" type="password" name="fake-password" autoComplete="new-password" />
                            </div>

                            <div className="grid sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-9 xl:grid-cols-12 gap-4 items-end">
                                {/* First Name */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="Fname">First Name</Label>
                                    <Input
                                        id="Fname"
                                        name="Fname"
                                        placeholder="First name"
                                        value={formData.Fname}
                                        onChange={handleChange}
                                        required
                                        className="mt-1"
                                    />
                                </div>

                                {/* Last Name */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="Lname">Last Name</Label>
                                    <Input
                                        id="Lname"
                                        name="Lname"
                                        placeholder="Last name"
                                        value={formData.Lname}
                                        onChange={handleChange}
                                        required
                                        className="mt-1"
                                    />
                                </div>

                                {/* Email */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        autoComplete="off"
                                        type="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="lowercase mt-1"
                                    />
                                </div>

                                {/* Password */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="password">Password</Label>
                                    <input title="password" type="password" name="fake-password" autoComplete="off" className="hidden" />
                                    <PasswordInput
                                        autoComplete="new-password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required={!isEditing}
                                        placeholder="Password"
                                        data-lpignore="true" // LastPass ignore
                                        className="mt-1"
                                    />
                                </div>

                                {/* User Type */}
                                <div className="md:col-span-1">
                                    <Label htmlFor="userType">User Type</Label>
                                    <Select value={formData.profile_type} onValueChange={handleUserTypeChange}>
                                        <SelectTrigger id="userType" className="mt-1">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* <SelectItem value="Super Admin">Super Admin</SelectItem> */}
                                            <SelectItem value="Admin">Admin</SelectItem>
                                            <SelectItem value="Auditor">Auditor</SelectItem>
                                            <SelectItem value="Analyst">Analyst</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Target Fields - Only show for Analyst or Auditor */}
                                {showTargets && (
                                    <>
                                        <div className="md:col-span-1">
                                            <Label htmlFor="dailyChartTarget">Daily Target</Label>
                                            <Input
                                                id="dailyChartTarget"
                                                name="dailyChartTarget"
                                                type="number"
                                                placeholder="Daily target"
                                                value={formData.target?.dailyChartTarget || ""}
                                                onChange={handleTargetChange}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <Label htmlFor="maxAssignments">Max Assign</Label>
                                            <Input
                                                id="maxAssignments"
                                                name="maxAssignments"
                                                type="number"
                                                placeholder="Max assignments"
                                                value={formData.target?.maxAssignments || ""}
                                                onChange={handleTargetChange}
                                                className="mt-1"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Submit Button - Always positioned at the end with proper handling for edit mode */}
                                <div className={`${isEditing ?
                                    showTargets ? "" : "col-span-3"
                                    : showTargets ? "" : "col-span-3"} `}>
                                    <div className="flex gap-2 justify-end">
                                        {isEditing ? (
                                            <>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => dispatch(cancelEditing())}
                                                    className="w-1/2 max-w-[100px]"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={loading} size="sm" className="w-1/2 max-w-[100px]">
                                                    {loading ? "Saving..." : "Update"}
                                                </Button>
                                            </>
                                        ) : (
                                            <Button type="submit" disabled={loading} className="w-full max-w-[120px]">
                                                {loading ? "Saving..." : "Add User"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

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
