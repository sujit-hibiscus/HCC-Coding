import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
    fetchData,
    postData,
    patchData,
    deleteData,
    uploadFile,
    postFormData
} from "@/lib/api/api-client";

// Common types
export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
}

// User types
export interface User {
    id: string
    name: string
    email: string
    avatar?: string
    role: string
    createdAt: string
    updatedAt: string
}

export interface CreateUserDto {
    name: string
    email: string
    password: string
    role?: string
}

export interface UpdateUserDto {
    name?: string
    email?: string
    role?: string
}

// Product types
export interface Product {
    id: string
    name: string
    description: string
    price: number
    imageUrl?: string
    category: string
    stock: number
    createdAt: string
    updatedAt: string
}

export interface CreateProductDto {
    name: string
    description: string
    price: number
    category: string
    stock: number
}

export interface UpdateProductDto {
    name?: string
    description?: string
    price?: number
    category?: string
    stock?: number
}

// Order types
export interface Order {
    id: string
    userId: string
    products: {
        productId: string
        quantity: number
        price: number
    }[]
    totalAmount: number
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
    shippingAddress: string
    createdAt: string
    updatedAt: string
}

export interface CreateOrderDto {
    products: {
        productId: string
        quantity: number
    }[]
    shippingAddress: string
}

export interface UpdateOrderDto {
    status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
    shippingAddress?: string
}

// File types
export interface FileUploadResponse {
    id: string
    url: string
    filename: string
    mimetype: string
    size: number
    createdAt: string
}

// API state interface
interface ApiState {
    users: {
        data: User[]
        selected: User | null
        loading: boolean
        error: string | null
        pagination: {
            total: number
            page: number
            limit: number
            totalPages: number
        }
    }
    products: {
        data: Product[]
        selected: Product | null
        loading: boolean
        error: string | null
        pagination: {
            total: number
            page: number
            limit: number
            totalPages: number
        }
    }
    orders: {
        data: Order[]
        selected: Order | null
        loading: boolean
        error: string | null
        pagination: {
            total: number
            page: number
            limit: number
            totalPages: number
        }
    }
    files: {
        uploadProgress: number
        loading: boolean
        error: string | null
    }
}

const initialState: ApiState = {
    users: {
        data: [],
        selected: null,
        loading: false,
        error: null,
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
        }
    },
    products: {
        data: [],
        selected: null,
        loading: false,
        error: null,
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
        }
    },
    orders: {
        data: [],
        selected: null,
        loading: false,
        error: null,
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
        }
    },
    files: {
        uploadProgress: 0,
        loading: false,
        error: null
    }
};

// User thunks
export const fetchUsers = createAsyncThunk(
    "api/fetchUsers",
    async (params: { page?: number; limit?: number; search?: string } = {}, { rejectWithValue }) => {
        try {
            const response = await fetchData<PaginatedResponse<User>>("/users", {
                params: params as Record<string, string>
            });
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

export const fetchUserById = createAsyncThunk(
    "api/fetchUserById",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await fetchData<User>(`/users/${id}`);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

export const createUser = createAsyncThunk(
    "api/createUser",
    async (userData: CreateUserDto, { rejectWithValue }) => {
        try {
            const response = await postData<User>("/users", userData);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

export const updateUser = createAsyncThunk(
    "api/updateUser",
    async ({ id, data }: { id: string; data: UpdateUserDto }, { rejectWithValue }) => {
        try {
            const response = await patchData<User>(`/users/${id}`, data);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

export const deleteUser = createAsyncThunk(
    "api/deleteUser",
    async (id: string, { rejectWithValue }) => {
        try {
            await deleteData(`/users/${id}`);
            return id;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

export const uploadUserAvatar = createAsyncThunk(
    "api/uploadUserAvatar",
    async ({ userId, file }: { userId: string; file: File }, { dispatch, rejectWithValue }) => {
        try {
            const response = await uploadFile<FileUploadResponse>(
                `/users/${userId}/avatar`,
                file,
                (progress) => {
                    dispatch(setFileUploadProgress(progress));
                }
            );

            // Update the user with the new avatar URL
            dispatch(updateUser({
                id: userId,
                data: {
                    // In a real app, you might need to update a specific avatar field
                    // This is just an example
                }
            }));

            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

// Product thunks
export const fetchProducts = createAsyncThunk(
    "api/fetchProducts",
    async (params: { page?: number; limit?: number; search?: string; category?: string } = {}, { rejectWithValue }) => {
        try {
            const response = await fetchData<PaginatedResponse<Product>>("/products", {
                params: params as Record<string, string>
            });
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

export const fetchProductById = createAsyncThunk(
    "api/fetchProductById",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await fetchData<Product>(`/products/${id}`);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

export const createProduct = createAsyncThunk(
    "api/createProduct",
    async (productData: CreateProductDto, { rejectWithValue }) => {
        try {
            const response = await postData<Product>("/products", productData);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

export const updateProduct = createAsyncThunk(
    "api/updateProduct",
    async ({ id, data }: { id: string; data: UpdateProductDto }, { rejectWithValue }) => {
        try {
            const response = await patchData<Product>(`/products/${id}`, data);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

export const deleteProduct = createAsyncThunk(
    "api/deleteProduct",
    async (id: string, { rejectWithValue }) => {
        try {
            await deleteData(`/products/${id}`);
            return id;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

export const uploadProductImage = createAsyncThunk(
    "api/uploadProductImage",
    async ({ productId, file }: { productId: string; file: File }, { dispatch, rejectWithValue }) => {
        try {
            const response = await uploadFile<FileUploadResponse>(
                `/products/${productId}/image`,
                file,
                (progress) => {
                    dispatch(setFileUploadProgress(progress));
                }
            );

            // Update the product with the new image URL
            dispatch(updateProduct({
                id: productId,
                data: {
                    // In a real app, you might need to update a specific image field
                    // This is just an example
                }
            }));

            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

// Order thunks
export const fetchOrders = createAsyncThunk(
    "api/fetchOrders",
    async (params: { page?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
        try {
            const response = await fetchData<PaginatedResponse<Order>>("/orders", {
                params: params as Record<string, string>
            });
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

export const fetchOrderById = createAsyncThunk(
    "api/fetchOrderById",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await fetchData<Order>(`/orders/${id}`);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

export const createOrder = createAsyncThunk(
    "api/createOrder",
    async (orderData: CreateOrderDto, { rejectWithValue }) => {
        try {
            const response = await postData<Order>("/orders", orderData);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

export const updateOrder = createAsyncThunk(
    "api/updateOrder",
    async ({ id, data }: { id: string; data: UpdateOrderDto }, { rejectWithValue }) => {
        try {
            const response = await patchData<Order>(`/orders/${id}`, data);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

export const cancelOrder = createAsyncThunk(
    "api/cancelOrder",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await patchData<Order>(`/orders/${id}`, { status: "cancelled" });
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

// File upload with form data example
export const uploadDocumentWithMetadata = createAsyncThunk(
    "api/uploadDocumentWithMetadata",
    async ({
        file,
        metadata
    }: {
        file: File;
        metadata: { title: string; description: string; tags: string[] }
    }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("title", metadata.title);
            formData.append("description", metadata.description);

            // For arrays, you need to handle them specially
            metadata.tags.forEach((tag, index) => {
                formData.append(`tags[${index}]`, tag);
            });

            const response = await postFormData<FileUploadResponse>(
                "/documents/upload",
                formData
            );

            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
        }
    }
);

// API slice
const apiSlice = createSlice({
    name: "api",
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.users.error = null;
            state.products.error = null;
            state.orders.error = null;
            state.files.error = null;
        },
        setFileUploadProgress: (state, action: PayloadAction<number>) => {
            state.files.uploadProgress = action.payload;
        },
        resetFileUploadProgress: (state) => {
            state.files.uploadProgress = 0;
        }
    },
    extraReducers: (builder) => {
        // Users reducers
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.users.loading = true;
                state.users.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.users.loading = false;
                state.users.data = action.payload.data;
                state.users.pagination = {
                    total: action.payload.total,
                    page: action.payload.page,
                    limit: action.payload.limit,
                    totalPages: action.payload.totalPages
                };
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.users.loading = false;
                state.users.error = action.payload as string;
            })

            .addCase(fetchUserById.pending, (state) => {
                state.users.loading = true;
                state.users.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.users.loading = false;
                state.users.selected = action.payload;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.users.loading = false;
                state.users.error = action.payload as string;
            })

            .addCase(createUser.pending, (state) => {
                state.users.loading = true;
                state.users.error = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.users.loading = false;
                state.users.data.push(action.payload);
            })
            .addCase(createUser.rejected, (state, action) => {
                state.users.loading = false;
                state.users.error = action.payload as string;
            })

            .addCase(updateUser.pending, (state) => {
                state.users.loading = true;
                state.users.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.users.loading = false;
                const index = state.users.data.findIndex(user => user.id === action.payload.id);
                if (index !== -1) {
                    state.users.data[index] = action.payload;
                }
                if (state.users.selected && state.users.selected.id === action.payload.id) {
                    state.users.selected = action.payload;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.users.loading = false;
                state.users.error = action.payload as string;
            })

            .addCase(deleteUser.pending, (state) => {
                state.users.loading = true;
                state.users.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users.loading = false;
                state.users.data = state.users.data.filter(user => user.id !== action.payload);
                if (state.users.selected && state.users.selected.id === action.payload) {
                    state.users.selected = null;
                }
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.users.loading = false;
                state.users.error = action.payload as string;
            });

        // Products reducers
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.products.loading = true;
                state.products.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.products.loading = false;
                state.products.data = action.payload.data;
                state.products.pagination = {
                    total: action.payload.total,
                    page: action.payload.page,
                    limit: action.payload.limit,
                    totalPages: action.payload.totalPages
                };
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.products.loading = false;
                state.products.error = action.payload as string;
            })

            .addCase(fetchProductById.pending, (state) => {
                state.products.loading = true;
                state.products.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.products.loading = false;
                state.products.selected = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.products.loading = false;
                state.products.error = action.payload as string;
            })

            .addCase(createProduct.pending, (state) => {
                state.products.loading = true;
                state.products.error = null;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.products.loading = false;
                state.products.data.push(action.payload);
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.products.loading = false;
                state.products.error = action.payload as string;
            })

            .addCase(updateProduct.pending, (state) => {
                state.products.loading = true;
                state.products.error = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.products.loading = false;
                const index = state.products.data.findIndex(product => product.id === action.payload.id);
                if (index !== -1) {
                    state.products.data[index] = action.payload;
                }
                if (state.products.selected && state.products.selected.id === action.payload.id) {
                    state.products.selected = action.payload;
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.products.loading = false;
                state.products.error = action.payload as string;
            })

            .addCase(deleteProduct.pending, (state) => {
                state.products.loading = true;
                state.products.error = null;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products.loading = false;
                state.products.data = state.products.data.filter(product => product.id !== action.payload);
                if (state.products.selected && state.products.selected.id === action.payload) {
                    state.products.selected = null;
                }
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.products.loading = false;
                state.products.error = action.payload as string;
            });

        // Orders reducers
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.orders.loading = true;
                state.orders.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.orders.loading = false;
                state.orders.data = action.payload.data;
                state.orders.pagination = {
                    total: action.payload.total,
                    page: action.payload.page,
                    limit: action.payload.limit,
                    totalPages: action.payload.totalPages
                };
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.orders.loading = false;
                state.orders.error = action.payload as string;
            })

            .addCase(fetchOrderById.pending, (state) => {
                state.orders.loading = true;
                state.orders.error = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.orders.loading = false;
                state.orders.selected = action.payload;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.orders.loading = false;
                state.orders.error = action.payload as string;
            })

            .addCase(createOrder.pending, (state) => {
                state.orders.loading = true;
                state.orders.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.orders.loading = false;
                state.orders.data.push(action.payload);
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.orders.loading = false;
                state.orders.error = action.payload as string;
            })

            .addCase(updateOrder.pending, (state) => {
                state.orders.loading = true;
                state.orders.error = null;
            })
            .addCase(updateOrder.fulfilled, (state, action) => {
                state.orders.loading = false;
                const index = state.orders.data.findIndex(order => order.id === action.payload.id);
                if (index !== -1) {
                    state.orders.data[index] = action.payload;
                }
                if (state.orders.selected && state.orders.selected.id === action.payload.id) {
                    state.orders.selected = action.payload;
                }
            })
            .addCase(updateOrder.rejected, (state, action) => {
                state.orders.loading = false;
                state.orders.error = action.payload as string;
            })

            .addCase(cancelOrder.pending, (state) => {
                state.orders.loading = true;
                state.orders.error = null;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.orders.loading = false;
                const index = state.orders.data.findIndex(order => order.id === action.payload.id);
                if (index !== -1) {
                    state.orders.data[index] = action.payload;
                }
                if (state.orders.selected && state.orders.selected.id === action.payload.id) {
                    state.orders.selected = action.payload;
                }
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.orders.loading = false;
                state.orders.error = action.payload as string;
            });

        // File upload reducers
        builder
            .addCase(uploadUserAvatar.pending, (state) => {
                state.files.loading = true;
                state.files.error = null;
            })
            .addCase(uploadUserAvatar.fulfilled, (state) => {
                state.files.loading = false;
                state.files.uploadProgress = 0;
            })
            .addCase(uploadUserAvatar.rejected, (state, action) => {
                state.files.loading = false;
                state.files.error = action.payload as string;
                state.files.uploadProgress = 0;
            })

            .addCase(uploadProductImage.pending, (state) => {
                state.files.loading = true;
                state.files.error = null;
            })
            .addCase(uploadProductImage.fulfilled, (state) => {
                state.files.loading = false;
                state.files.uploadProgress = 0;
            })
            .addCase(uploadProductImage.rejected, (state, action) => {
                state.files.loading = false;
                state.files.error = action.payload as string;
                state.files.uploadProgress = 0;
            })

            .addCase(uploadDocumentWithMetadata.pending, (state) => {
                state.files.loading = true;
                state.files.error = null;
            })
            .addCase(uploadDocumentWithMetadata.fulfilled, (state) => {
                state.files.loading = false;
            })
            .addCase(uploadDocumentWithMetadata.rejected, (state, action) => {
                state.files.loading = false;
                state.files.error = action.payload as string;
            });
    },
});

export const { clearErrors, setFileUploadProgress, resetFileUploadProgress } = apiSlice.actions;
export default apiSlice.reducer;
