import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
interface UserFormState {
    Fname: string
    Lname: string
    email: string
    password: string
    profile_type: "Analyst" | "Auditor" | "Admin" | "Super Admin"
    isEditing: boolean
    editingId?: number
    target?: {
        dailyChartTarget?: number
        maxAssignments?: number
    }
    formErrors: {
        [key: string]: string | undefined
    }
}

const initialState: UserFormState = {
    Fname: "",
    Lname: "",
    email: "",
    password: "",
    profile_type: "Analyst",
    isEditing: false,
    editingId: undefined,
    target: {
        dailyChartTarget: undefined,
        maxAssignments: undefined,
    },
    formErrors: {}
};

const userFormSlice = createSlice({
    name: "userForm",
    initialState,
    reducers: {
        updateField: (state, action: PayloadAction<{ field: keyof Omit<UserFormState, "formErrors" | "target">; value: string }>) => {
            const { field, value } = action.payload;
            if (field in state) {

                state.formErrors[field] = undefined
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ; (state as any)[field] = value;
            }
        },

        // Update target fields
        updateTargetField: (
            state,
            action: PayloadAction<{ field: "dailyChartTarget" | "maxAssignments"; value: number | undefined }>,
        ) => {
            const { field, value } = action.payload;
            if (!state.target) {
                state.target = {};
            }
            state.formErrors[`target.${field}`] = undefined;
            state.target[field] = value;
        },

        // Set form validation errors
        setFormError: (state, action: PayloadAction<{ field: string; message: string }>) => {
            const { field, message } = action.payload;
            state.formErrors[field] = message;
        },

        // Clear a specific form error
        clearFormError: (state, action: PayloadAction<string>) => {
            const field = action.payload;
            state.formErrors[field] = undefined;
        },

        // Clear all form errors
        clearAllFormErrors: (state) => {
            state.formErrors = {};
        },

        // Set the entire form data (useful when editing a user)
        setFormData: (state, action: PayloadAction<Partial<Omit<UserFormState, "formErrors">>>) => {
            return {
                ...state,
                ...action.payload,
                formErrors: {}
            };
        },

        // Reset the form to initial state
        resetForm: () => initialState,

        // Start editing a user
        startEditing: (
            state,
            action: PayloadAction<{ id: number; userData: Omit<UserFormState, "isEditing" | "editingId" | "formErrors"> }>,
        ) => {
            const { id, userData } = action.payload;
            return {
                ...state,
                ...userData,
                isEditing: true,
                editingId: id,
                formErrors: {} // Clear errors when starting to edit
            };
        },

        // Cancel editing
        cancelEditing: () => {
            return initialState;
        },
    },
});

// Export actions and reducer
export const {
    updateField,
    updateTargetField,
    setFormData,
    resetForm,
    startEditing,
    cancelEditing,
    setFormError,
    clearFormError,
    clearAllFormErrors
} = userFormSlice.actions;

export default userFormSlice.reducer;
