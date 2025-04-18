import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Define the state interface for the form
interface UserFormState {
    Fname: string
    Lname: string
    email: string
    password: string
    profile_type: "Analyst" | "Provider"
    isEditing: boolean
    editingId?: number
}

// Initial state
const initialState: UserFormState = {
    Fname: "",
    Lname: "",
    email: "",
    password: "",
    profile_type: "Analyst",
    isEditing: false,
    editingId: undefined,
};

// Create the slice
const userFormSlice = createSlice({
    name: "userForm",
    initialState,
    reducers: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateField: (state, action: PayloadAction<{ field: keyof UserFormState; value: any }>) => {
            const { field, value } = action.payload;
            if (field in state) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ; (state as any)[field] = value;
            }
        },

        // Set the entire form data (useful when editing a user)
        setFormData: (state, action: PayloadAction<Partial<UserFormState>>) => {
            return { ...state, ...action.payload };
        },

        // Reset the form to initial state
        resetForm: () => initialState,

        // Start editing a user
        startEditing: (
            state,
            action: PayloadAction<{ id: number; userData: Omit<UserFormState, "isEditing" | "editingId"> }>,
        ) => {
            const { id, userData } = action.payload;
            return {
                ...state,
                ...userData,
                isEditing: true,
                editingId: id,
            };
        },

        // Cancel editing
        cancelEditing: () => {
            return {
                ...initialState,
            };
        },
    },
});

// Export actions and reducer
export const { updateField, setFormData, resetForm, startEditing, cancelEditing } = userFormSlice.actions;
export default userFormSlice.reducer;

