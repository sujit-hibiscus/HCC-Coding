import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { UserTypes as User } from "@/lib/types/chartsTypes";
import { fetchData, postData } from "@/lib/api/api-client";
import toast from "react-hot-toast";
import { EndDateFilter, StartDateFilter } from "@/lib/utils";
import { format } from "date-fns";

export interface AppointmentCounts {
    charts: {
        Pending: number
        Assigned: number
        Audit: number
        Completed: number
    }
}

export type AppointmentStatus = "Success" | "Not Found" | "Error" | "Loading"
export interface UserState {
    isAuthenticated: boolean
    userType: string | null
    token: string | null
    email: string
    userId: string
    userRoles: string[]
    loading: boolean
    error: string | null
    appointmentCounts: {
        data: AppointmentCounts | null
        status: AppointmentStatus
    }
    users: {
        data: User[] | null
        status: AppointmentStatus
        lastUpdated: number | null
    }
    currentUser: {
        data: User | null
        status: AppointmentStatus
    }
}


// Initial state
const initialState: UserState = {
    isAuthenticated: false,
    userType: null,
    userId: "",
    token: null,
    userRoles: [],
    loading: false,
    email: "",
    error: null,
    appointmentCounts: {
        data: {
            charts: {
                Pending: 0,
                Assigned: 0,
                Audit: 0,
                Completed: 0,
            }
        },
        status: "Success",
    },
    users: {
        data: [],
        status: "Success",
        lastUpdated: Date.now()
    },
    currentUser: {
        data: null,
        status: "Success",
    },
};

// Register user request interface
export interface RegisterUserRequest {
    prodTarget: number;
    maxAssign: number;
    Fname: string
    Lname: string
    email: string
    password: string
    profile_type: number | string
    target?: {
        dailyChartTarget?: number
        maxAssignments?: number
    }
}

// Update user request interface
export interface UpdateUserRequest {
    Fname: string
    Lname: string
    email: string
    profile_type: number | string
    target?: {
        dailyChartTarget?: number
        maxAssignments?: number
    }
}

// Helper function to normalize profile type
const normalizeProfileType = (profileType: number | string): string => {
    if (typeof profileType === "number") {
        switch (profileType) {
            case 1: return "Super Admin";
            case 2: return "Admin";
            case 3: return "Analyst";
            case 4: return "Auditor";
            default: return "Analyst";
        }
    }
    return profileType as string;
};

// Check if email already exists
const emailExists = (users: User[], email: string, excludeId?: number): boolean => {
    return users.some(user => user.email.toLowerCase() === email.toLowerCase() && user.id !== excludeId);
};

interface ApiResponseData {
    status: string
    message: string
    data: {
        "id": number,
        "first_name": string,
        "last_name": string,
        "email": string,
        "password": string,
        "role_id": number,
        "prod_target": number,
        "bucket_threshold": number
    }[]
}

// Mock async thunks that work with local state instead of API calls
export const getAllUsers = createAsyncThunk(
    "user/registered/getAll",
    async () => {
        const response = await fetchData("get_users/");
        const data = response.data as ApiResponseData;
        const convertedData = data.data.map((user) => {
            return {
                id: user?.id,
                Fname: user?.first_name,
                Lname: user?.last_name,
                email: user.email,
                profile_type: normalizeProfileType(user?.role_id),
                password: user?.password,
                target: { dailyChartTarget: +user?.prod_target, maxAssignments: +user?.bucket_threshold },
            };
        });


        return {
            message: "Users fetched successfully",
            data: convertedData || [],
        };
    }
);

const roleMap = {
    "Super Admin": 1,
    Admin: 2,
    Analyst: 3,
    Auditor: 4,
};
export const registerUser = createAsyncThunk<string, RegisterUserRequest>(
    "user/registered/register",
    async (userData, { getState, dispatch, rejectWithValue }) => {
        try {
            const apiResponse = await postData("register_user/", {
                "first_name": userData.Fname.trim(),
                "last_name": userData.Lname.trim(),
                "email": userData.email.toLowerCase().trim(),
                "password": userData.password,
                "role_id": roleMap[userData.profile_type as keyof typeof roleMap], // 1: Analyst, 2: Auditor, 3: Admin, 4: Super Admin
                "prod_target": userData?.prodTarget, // Optional, required if the role_id is 3 (Analyst) or 4 (Auditor)
                "bucket_threshold": userData?.maxAssign // Optional, required if the role_id is 3 (Analyst) or 4 (Auditor)
            });
            await new Promise((resolve) => setTimeout(resolve, 800));

            const state = getState() as { user: UserState };
            const users = state.user.users.data || [];

            // Check if email already exists
            if (emailExists(users, userData.email)) {
                return rejectWithValue("Email already exists. Please use a different email address.");
            }

            // Generate a new ID (max ID + 1)
            const newId = users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1;

            // Create new user object
            const newUser: User = {
                id: newId,
                Fname: userData.Fname.trim(),
                Lname: userData.Lname.trim(),
                email: userData.email.toLowerCase().trim(),
                password: userData.password,
                profile_type: normalizeProfileType(userData.profile_type),
                target: userData.target,
            };

            // Add to state in the reducer
            dispatch(addUser(newUser));

            return "User created successfully.";
        } catch (error) {
            return rejectWithValue((error as Error).message || "Failed to register user");
        }
    }
);

export const updateUser = createAsyncThunk<User, { id: number; userData: UpdateUserRequest }>(
    "user/registered/update",
    async ({ id, userData }, { getState, dispatch, rejectWithValue }) => {
        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 800));

            const state = getState() as { user: UserState };
            const users = state.user.users.data || [];

            // Find user to update
            const userToUpdate = users.find((user) => user.id === id);

            if (!userToUpdate) {
                return rejectWithValue("User not found");
            }

            // Check if email already exists (excluding the current user)
            if (emailExists(users, userData.email, id)) {
                return rejectWithValue("Email already exists. Please use a different email address.");
            }

            // Create updated user object
            const updatedUser: User = {
                ...userToUpdate,
                Fname: userData.Fname.trim(),
                Lname: userData.Lname.trim(),
                email: userData.email.toLowerCase().trim(),
                profile_type: normalizeProfileType(userData.profile_type),
                target: userData.target,
            };

            // Update in state in the reducer
            dispatch(updateUserInState(updatedUser));

            return updatedUser;
        } catch (error) {
            return rejectWithValue((error as Error).message || "Failed to update user");
        }
    }
);

export const deleteUser = createAsyncThunk<{ id: number; message: string }, number>(
    "user/registered/delete",
    async (id, { dispatch, getState, rejectWithValue }) => {
        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 600));

            const state = getState() as { user: UserState };
            const users = state.user.users.data || [];

            // Check if user exists
            const userExists = users.some(user => user.id === id);
            if (!userExists) {
                return rejectWithValue("User not found");
            }

            // Remove from state in the reducer
            dispatch(removeUser(id));

            return {
                id,
                message: "User deleted successfully",
            };
        } catch (error) {
            return rejectWithValue((error as Error).message || "Failed to delete user");
        }
    }
);


interface ApiResponse {
    data: {
        "Pending": number,
        "Assigned": number,
        "Audit": number,
        "Completed": number
    }
    status: "Success" | "Not Found" | "Error"
    message: string
}
export const fetchChartCounts = createAsyncThunk("user/fetchChartCounts", async (_, { rejectWithValue }) => {
    try {
        const formattedStart = format(StartDateFilter, 'yyyy-MM-dd');
        const formattedEnd = format(EndDateFilter, 'yyyy-MM-dd');

        const bodyData = {
            "start_date": formattedStart,
            "end_date": formattedEnd
        }
        const response = await postData("charts_count/", bodyData);
        const data = response.data as ApiResponse;
        if (data.status === "Success") {
            return {
                data: {
                    Pending: data.data.Pending,
                    Assigned: data.data.Assigned,
                    Audit: data.data.Audit,
                    Completed: data.data.Completed,
                },
                status: "Success",
            };
        } else {
            toast.error(`${data.message}`);
            return {
                data: {
                    Pending: data.data.Pending,
                    Assigned: data.data.Assigned,
                    Audit: data.data.Audit,
                    Completed: data.data.Completed,
                },
                status: "Success",
            };
        }
    } catch (error) {
        return rejectWithValue((error as Error).message || "Failed to fetch chart counts");
    }
});

// Create the user slice
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (
            state,
            action: PayloadAction<{ userType: string; userRoles: string[]; token: string; email: string; id: string }>,
        ) => {
            state.isAuthenticated = true;
            state.userType = action.payload.userType;
            state.userRoles = action.payload.userRoles;
            state.loading = false;
            state.error = null;
            state.token = action.payload.token;
            state.email = action.payload.email;
            state.userId = action.payload.id;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },

        updateCountByKey: (
            state,
            action: PayloadAction<{ key: string; count: number }>
        ) => {
            const { key, count } = action.payload;
            if (state.appointmentCounts.data) {
                state.appointmentCounts.data.charts[key as keyof typeof state.appointmentCounts.data.charts] = count;
            }
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearError: (state) => {
            state.error = null;
        },
        logout: () => initialState,
        // New reducers for local CRUD operations
        addUser: (state, action: PayloadAction<User>) => {
            if (state.users.data) {
                state.users.data.push(action.payload);
            } else {
                state.users.data = [action.payload];
            }
            state.users.lastUpdated = Date.now();
        },
        updateUserInState: (state, action: PayloadAction<User>) => {
            if (state.users.data) {
                state.users.data = state.users.data.map((user) => (user.id === action.payload.id ? action.payload : user));
                state.users.lastUpdated = Date.now();
            }
        },
        removeUser: (state, action: PayloadAction<number>) => {
            if (state.users.data) {
                state.users.data = state.users.data.filter((user) => user.id !== action.payload);
                state.users.lastUpdated = Date.now();
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Get all users reducers
            .addCase(getAllUsers.pending, (state) => {
                state.users.status = "Loading";
                state.error = null;
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.users.data = action.payload.data;
                state.users.status = "Success";
                state.users.lastUpdated = Date.now();
            })
            .addCase(getAllUsers.rejected, (state, action) => {
                state.users.status = "Error";
                state.error = action.error.message || "Failed to fetch users";
            })

            // Register user reducers
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || action.error.message || "Failed to register user";
                state.currentUser.status = "Error";
            })

            // Update user reducers
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                state.currentUser.data = action.payload;
                state.currentUser.status = "Success";
                state.error = null;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || action.error.message || "Failed to update user";
                state.currentUser.status = "Error";
            })

            // Delete user reducers
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || action.error.message || "Failed to delete user";
            }) // Chart counts reducers
            .addCase(fetchChartCounts.pending, (state) => {
                state.appointmentCounts.status = "Loading";
            })
            .addCase(fetchChartCounts.fulfilled, (state, action) => {
                state.appointmentCounts.data = {
                    charts: action.payload.data,
                };
                state.appointmentCounts.status = "Success";
            })
            .addCase(fetchChartCounts.rejected, (state, action) => {
                state.appointmentCounts.status = "Error";
                state.error = (action.payload as string) || "Failed to fetch chart counts";
            });
    },
});

// Export actions and reducer
export const {
    setUser,
    setLoading,
    setError,
    clearError,
    logout,
    addUser,
    updateUserInState,
    removeUser,
    updateCountByKey
} = userSlice.actions;

export default userSlice.reducer;
