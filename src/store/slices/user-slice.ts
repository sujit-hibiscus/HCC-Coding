import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { UserTypes as User } from "@/lib/types/chartsTypes"

export interface AppointmentCounts {
    charts: {
        Pending?: number
        Assigned?: number
        Audit?: number
    }
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
        lastUpdated: number | null
    }
    currentUser: {
        data: User | null
        status: AppointmentStatus
    }
}

// Initial test users
const initialUsers: User[] = [
    {
        id: 1,
        Fname: "Sujit",
        Lname: "SuperAdmin",
        email: "super.admin.sujit@mailinator.com",
        profile_type: "Super Admin",
        password: "test@123",
    },
    {
        id: 2,
        Fname: "Sujit",
        Lname: "Admin",
        email: "admin.sujit@mailinator.com",
        profile_type: "Admin",
        password: "test@123",
    },
    {
        id: 3,
        Fname: "Sujit",
        Lname: "Auditor",
        email: "auditor.sujit@mailinator.com",
        profile_type: "Auditor",
        password: "test@123",
        target: { dailyChartTarget: 8, maxAssignments: 15 },
    },
    {
        id: 4,
        Fname: "Sujit",
        Lname: "Analyst",
        email: "analyst.sujit@mailinator.com",
        profile_type: "Analyst",
        password: "test@123",
        target: { dailyChartTarget: 10, maxAssignments: 20 },
    }
]

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
        data: {
            charts: {
                Pending: 3,
                Assigned: 2,
                Audit: 2
            }
        },
        status: "Success",
    },
    users: {
        data: initialUsers,
        status: "Success",
        lastUpdated: Date.now()
    },
    currentUser: {
        data: null,
        status: "Success",
    },
}

// Register user request interface
export interface RegisterUserRequest {
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
            case 1: return "Analyst"
            case 2: return "Auditor"
            case 3: return "Admin"
            case 4: return "Super Admin"
            default: return "Analyst"
        }
    }
    return profileType as string
}

// Check if email already exists
const emailExists = (users: User[], email: string, excludeId?: number): boolean => {
    return users.some(user => user.email.toLowerCase() === email.toLowerCase() && user.id !== excludeId)
}

// Mock async thunks that work with local state instead of API calls
export const getAllUsers = createAsyncThunk(
    "user/registered/getAll",
    async (_, { getState }) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        const state = getState() as { user: UserState }
        return {
            message: "Users fetched successfully",
            data: state.user.users.data || [],
        }
    }
)

export const registerUser = createAsyncThunk<string, RegisterUserRequest>(
    "user/registered/register",
    async (userData, { getState, dispatch, rejectWithValue }) => {
        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 800))

            const state = getState() as { user: UserState }
            const users = state.user.users.data || []

            // Check if email already exists
            if (emailExists(users, userData.email)) {
                return rejectWithValue("Email already exists. Please use a different email address.")
            }

            // Generate a new ID (max ID + 1)
            const newId = users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1

            // Create new user object
            const newUser: User = {
                id: newId,
                Fname: userData.Fname.trim(),
                Lname: userData.Lname.trim(),
                email: userData.email.toLowerCase().trim(),
                password: userData.password,
                profile_type: normalizeProfileType(userData.profile_type),
                target: userData.target,
            }

            // Add to state in the reducer
            dispatch(addUser(newUser))

            return "User registered successfully"
        } catch (error) {
            return rejectWithValue((error as Error).message || "Failed to register user")
        }
    }
)

export const updateUser = createAsyncThunk<User, { id: number; userData: UpdateUserRequest }>(
    "user/registered/update",
    async ({ id, userData }, { getState, dispatch, rejectWithValue }) => {
        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 800))

            const state = getState() as { user: UserState }
            const users = state.user.users.data || []

            // Find user to update
            const userToUpdate = users.find((user) => user.id === id)

            if (!userToUpdate) {
                return rejectWithValue("User not found")
            }

            // Check if email already exists (excluding the current user)
            if (emailExists(users, userData.email, id)) {
                return rejectWithValue("Email already exists. Please use a different email address.")
            }

            // Create updated user object
            const updatedUser: User = {
                ...userToUpdate,
                Fname: userData.Fname.trim(),
                Lname: userData.Lname.trim(),
                email: userData.email.toLowerCase().trim(),
                profile_type: normalizeProfileType(userData.profile_type),
                target: userData.target,
            }

            // Update in state in the reducer
            dispatch(updateUserInState(updatedUser))

            return updatedUser
        } catch (error) {
            return rejectWithValue((error as Error).message || "Failed to update user")
        }
    }
)

export const deleteUser = createAsyncThunk<{ id: number; message: string }, number>(
    "user/registered/delete",
    async (id, { dispatch, getState, rejectWithValue }) => {
        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 600))

            const state = getState() as { user: UserState }
            const users = state.user.users.data || []

            // Check if user exists
            const userExists = users.some(user => user.id === id)
            if (!userExists) {
                return rejectWithValue("User not found")
            }

            // Remove from state in the reducer
            dispatch(removeUser(id))

            return {
                id,
                message: "User deleted successfully",
            }
        } catch (error) {
            return rejectWithValue((error as Error).message || "Failed to delete user")
        }
    }
)

// Create the user slice
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (
            state,
            action: PayloadAction<{ userType: string; userRoles: string[]; token: string; email: string }>,
        ) => {
            state.isAuthenticated = true
            state.userType = action.payload.userType
            state.userRoles = action.payload.userRoles
            state.loading = false
            state.error = null
            state.token = action.payload.token
            state.email = action.payload.email
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload
            state.loading = false
        },
        clearError: (state) => {
            state.error = null
        },
        logout: () => initialState,
        // New reducers for local CRUD operations
        addUser: (state, action: PayloadAction<User>) => {
            if (state.users.data) {
                state.users.data.push(action.payload)
            } else {
                state.users.data = [action.payload]
            }
            state.users.lastUpdated = Date.now()
        },
        updateUserInState: (state, action: PayloadAction<User>) => {
            if (state.users.data) {
                state.users.data = state.users.data.map((user) => (user.id === action.payload.id ? action.payload : user))
                state.users.lastUpdated = Date.now()
            }
        },
        removeUser: (state, action: PayloadAction<number>) => {
            if (state.users.data) {
                state.users.data = state.users.data.filter((user) => user.id !== action.payload)
                state.users.lastUpdated = Date.now()
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Get all users reducers
            .addCase(getAllUsers.pending, (state) => {
                state.users.status = "Loading"
                state.error = null
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.users.data = action.payload.data
                state.users.status = "Success"
                state.users.lastUpdated = Date.now()
            })
            .addCase(getAllUsers.rejected, (state, action) => {
                state.users.status = "Error"
                state.error = action.error.message || "Failed to fetch users"
            })

            // Register user reducers
            .addCase(registerUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false
                state.error = null
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string || action.error.message || "Failed to register user"
                state.currentUser.status = "Error"
            })

            // Update user reducers
            .addCase(updateUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false
                state.currentUser.data = action.payload
                state.currentUser.status = "Success"
                state.error = null
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string || action.error.message || "Failed to update user"
                state.currentUser.status = "Error"
            })

            // Delete user reducers
            .addCase(deleteUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(deleteUser.fulfilled, (state) => {
                state.loading = false
                state.error = null
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string || action.error.message || "Failed to delete user"
            })
    },
})

// Export actions and reducer
export const {
    setUser,
    setLoading,
    setError,
    clearError,
    logout,
    addUser,
    updateUserInState,
    removeUser
} = userSlice.actions

export default userSlice.reducer
