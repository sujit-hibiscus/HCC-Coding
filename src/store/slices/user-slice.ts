import { fetchData, postData, putData, deleteData } from "@/lib/api/api-client";
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

import { UserTypes as User } from "@/lib/types/PrevisitTypes";

export interface AppointmentCounts {
    previsit: {
        PENDING?: number
        Draft?: number
        Review?: number
        "Provider Review"?: number
    }
    post_visit: Record<string, number> // Flexible for future keys
}

export type AppointmentStatus = "Success" | "Not Found" | "Error" | "Loading"
export interface UserState {
    isAuthenticated: boolean
    userType: string | null
    token: string | null
    email: string
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
    token: null,
    userRoles: [],
    loading: false,
    email: "",
    error: null,
    appointmentCounts: {
        data: null,
        status: "Success",
    },
    users: {
        data: null,
        status: "Success",
    },
    currentUser: {
        data: null,
        status: "Success",
    },
};

// User API response interface
interface UserResponse {
    status: AppointmentStatus
    message: string
    data: User[]
}

interface SingleUserResponse {
    status: AppointmentStatus
    message: string
    data: User
}

// Register user request interface
export interface RegisterUserRequest {
    Fname: string
    Lname: string
    email: string
    password: string
    profile_type: number
}

// Update user request interface
export interface UpdateUserRequest {
    Fname: string
    Lname: string
    email: string
    profile_type: number
}

// ** Step 2: Create API Call Using Thunk **
export const getAllAppointmentCounts = createAsyncThunk<AppointmentCounts, void, { rejectValue: string }>(
    "user/fetchCount/all",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchData<{ data: AppointmentCounts }>("/get/appointments/count/");
            if (response?.data?.data) {
                return response.data.data;
            }

            throw new Error("Invalid response structure");
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Something went wrong");
        }
    },
);

// Get all users
export const getAllUsers = createAsyncThunk<{
    message: string;
    data: User[]
}, void, { rejectValue: string }>(
    "user/registered/getAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchData<UserResponse>("/get/users/");
            if (response?.data?.status === "Success") {
                const convertedData = response.data.data?.map(item => ({ ...item, profile_type: item?.profile_type === 1 ? "Analyst" : "Provider" }));
                return {
                    message: response.data.message,
                    data: convertedData
                };
            } else {
                return {
                    message: response.data.message,
                    data: []
                };
            }

        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Something went wrong");
        }
    },
);

// Register new user
export const registerUser = createAsyncThunk<string, RegisterUserRequest, { rejectValue: string }>(
    "user/registered/register",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await postData<SingleUserResponse>("/get/register/", userData);
            if (response?.data?.status === "Success") {
                return response.data.message;
            }
            throw new Error(response?.data?.message || "Failed to register user");
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Something went wrong");
        }
    },
);

// Update user
export const updateUser = createAsyncThunk<User, { id: number; userData: UpdateUserRequest }, { rejectValue: string }>(
    "user/registered/update",
    async ({ id, userData }, { rejectWithValue }) => {
        try {
            const response = await putData<SingleUserResponse>(`/get/update-user/${id}/`, userData);
            if (response?.data?.status === "Success") {
                return response.data.data;
            }
            throw new Error(response?.data?.message || "Failed to update user");
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Something went wrong");
        }
    },
);

// Delete user
export const deleteUser = createAsyncThunk<{ id: number, message: string }, number, { rejectValue: string }>(
    "user/registered/delete",
    async (id, { rejectWithValue }) => {
        try {
            const response = await deleteData<{ status: AppointmentStatus; message: string }>(`/get/delete-user/${id}/`);
            if (response?.data?.status === "Success") {
                return {
                    id,
                    message: response.data?.message
                };
            }
            throw new Error(response?.data?.message || "Failed to delete user");
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Something went wrong");
        }
    },
);

// Create the user slice
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ userType: string; userRoles: string[]; token: string, email: string }>) => {
            state.isAuthenticated = true;
            state.userType = action.payload.userType;
            state.userRoles = action.payload.userRoles;
            state.loading = false;
            state.error = null;
            state.token = action.payload.token;
            state.email = action.payload.email;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        logout: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // Appointment counts reducers
            .addCase(getAllAppointmentCounts.pending, (state) => {
                state.error = null;
                state.appointmentCounts.status = "Loading";
            })
            .addCase(getAllAppointmentCounts.fulfilled, (state, action) => {
                state.appointmentCounts.data = action.payload;
                state.appointmentCounts.status = "Success";
            })
            .addCase(getAllAppointmentCounts.rejected, (state, action) => {
                state.error = action.payload as string;
                state.appointmentCounts.status = "Error";
            })

            // Get all users reducers
            .addCase(getAllUsers.pending, (state) => {
                state.users.status = "Loading";
                state.error = null;
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.users.data = action.payload.data;
                state.users.status = "Success";
            })
            .addCase(getAllUsers.rejected, (state, action) => {
                state.users.status = "Error";
                state.error = action.payload as string;
            })

            // Register user reducers
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
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
                // Update the user in the users list if it exists
                if (state.users.data) {
                    state.users.data = state.users.data.map((user) => (user.id === action.payload.id ? action.payload : user));
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.currentUser.status = "Error";
            })

            // Delete user reducers
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                const { id = 0 } = action.payload;
                // Remove the user from the users list if it exists
                if (state.users.data) {
                    state.users.data = state.users.data.filter((user) => user.id !== id);
                }
                // Clear current user if it's the deleted one
                if (state.currentUser.data && state.currentUser.data.id === id) {
                    state.currentUser.data = null;
                }
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

// Export actions and reducer
export const { setUser, setLoading, setError, logout } = userSlice.actions;
export default userSlice.reducer;

