import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getSessionId, setSessionId } from "@/lib/session";
import { fetchData, postData } from "@/lib/api/api-client";
import toast from "react-hot-toast";

export interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: number
    status?: "sent" | "loading" | "delivered" | "failed"
}

export interface HistoryMessage {
    id: number
    session_id: string
    input_text: string
    output_text: string
    interaction_time: string
    user: number
}


interface ChatState {
    messages: Message[]
    isLoading: boolean
    error: string | null
    editingMessageId: string | null
    history: HistoryMessage[]
    historyLoading: boolean
    historyError: string | null
}

const initialState: ChatState = {
    messages: [],
    isLoading: false,
    error: null,
    editingMessageId: null,
    history: [],
    historyLoading: false,
    historyError: null,
};

const generateId = () => Math.random().toString(36).substring(2, 15);

export const sendMessage = createAsyncThunk(
    "chat/sendMessage",
    async ({ content, user_id }: { content: string; user_id: string }, { dispatch }) => {
        const userMessage: Message = {
            id: generateId(),
            role: "user",
            content,
            timestamp: Date.now(),
            status: "sent",
        };

        dispatch(addMessage(userMessage));
        dispatch(updateMessageStatus({ id: userMessage.id, status: "loading" }));

        try {
            const sessionId = getSessionId();
            const response = (await postData("/get/chat-response/", {
                input: content,
                session_id: sessionId,
                user_id: user_id,
            })) as {
                data: {
                    status: "Success" | "Not Found" | "Error"
                    message: string
                    data: string
                }
            };

            if (response.data.status === "Success") {
                dispatch(updateMessageStatus({ id: userMessage.id, status: "delivered" }));
            } else {
                dispatch(updateMessageStatus({ id: userMessage.id, status: "failed" }));
                toast.error(`${response?.data.message}`);
            }

            const assistantMessage: Message = {
                id: generateId(),
                role: "assistant",
                content: response.data.data,
                timestamp: Date.now(),
            };
            return assistantMessage;
        } catch (error) {
            dispatch(updateMessageStatus({ id: userMessage.id, status: "failed" }));
            console.error("Error sending message:", error);
            throw error;
        }
    },
);

export const editMessage = createAsyncThunk(
    "chat/editMessage",
    async ({ id, content, user_id }: { id: string; content: string; user_id: string }, { getState, dispatch }) => {
        const state = getState() as { chat: ChatState };
        const messageIndex = state.chat.messages.findIndex((msg) => msg.id === id);
        if (messageIndex === -1) {
            throw new Error("Message not found");
        }
        const nextMessageIndex = messageIndex + 1;
        const hasAssistantResponse =
            nextMessageIndex < state.chat.messages.length && state.chat.messages[nextMessageIndex].role === "assistant";
        const editedMessage: Message = {
            id: generateId(),
            role: "user",
            content,
            timestamp: Date.now(),
            status: "sent",
        };
        if (hasAssistantResponse) {
            dispatch(removeMessages([id, state.chat.messages[nextMessageIndex].id]));
        } else {
            dispatch(removeMessages([id]));
        }

        dispatch(addMessage(editedMessage));
        dispatch(cancelEditingMessage());

        dispatch(updateMessageStatus({ id: editedMessage.id, status: "loading" }));

        try {
            const sessionId = getSessionId();

            const response = (await postData("/get/chat-response/", {
                input: content,
                session_id: sessionId,
                user_id: user_id,
            })) as {
                data: {
                    status: "Success" | "Not Found" | "Error"
                    message: string
                    data: string
                }
            };

            if (response.data.status === "Success") {
                dispatch(updateMessageStatus({ id: editedMessage.id, status: "delivered" }));
            } else {
                dispatch(updateMessageStatus({ id: editedMessage.id, status: "failed" }));
                toast.error(`${response?.data.message}`);
            }

            const assistantMessage: Message = {
                id: generateId(),
                role: "assistant",
                content: response.data.data,
                timestamp: Date.now(),
            };

            return assistantMessage;
        } catch (error) {
            dispatch(updateMessageStatus({ id: editedMessage.id, status: "failed" }));
            console.error("Error editing message:", error);
            throw error;
        }
    },
);


interface ApiResponse {
    data: HistoryMessage[],
    status: "Success" | "Not Found" | "Error";
    message: string;
}

export const fetchChatHistory = createAsyncThunk("chat/fetchChatHistory", async (user_id: string, { rejectWithValue }) => {
    try {
        const response = await fetchData<ApiResponse>(`/get/chat-history/?user_id=${user_id}`);
        if (response.data.status === "Success") {
            // toast.success(`${response?.data.message}`)
            const testResponse = {
                "status": "Success",
                "message": "Chat History fetched successfully",
                "data": response.data.data
            };
            return testResponse.data;
        } else {
            toast.error(`${response?.data.message}`);
            const testResponse = {
                "status": "Success",
                "message": "Chat History fetched successfully",
                "data": []
            };
            return testResponse.data;
        }

    } catch (error) {
        console.error("Error fetching chat history:", error);
        return rejectWithValue("Failed to fetch chat history");
    }
});

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<Message>) => {
            state.messages.push(action.payload);
        },
        clearChat: (state) => {
            state.messages = [];
            state.editingMessageId = null;
        },
        startEditingMessage: (state, action: PayloadAction<string>) => {
            state.editingMessageId = action.payload;
        },
        cancelEditingMessage: (state) => {
            state.editingMessageId = null;
        },
        removeMessages: (state, action: PayloadAction<string[]>) => {
            state.messages = state.messages.filter((msg) => !action.payload.includes(msg.id));
        },
        updateMessageStatus: (state, action: PayloadAction<{ id: string; status: Message["status"] }>) => {
            const { id, status } = action.payload;
            const message = state.messages.find((msg) => msg.id === id);
            if (message) {
                message.status = status;
            }
        },
        loadHistorySession: (
            state,
            action: PayloadAction<{
                messages: HistoryMessage[]
                sessionId: string
            }>,
        ) => {
            state.messages = [];

            setSessionId(action.payload.sessionId);
            action.payload.messages.forEach((historyMsg) => {
                state.messages.push({
                    id: generateId(),
                    role: "user",
                    content: historyMsg.input_text,
                    timestamp: new Date(historyMsg.interaction_time).getTime(),
                    status: "delivered",
                });

                state.messages.push({
                    id: generateId(),
                    role: "assistant",
                    content: historyMsg.output_text,
                    timestamp: new Date(historyMsg.interaction_time).getTime() + 1000, // Add 1 second to ensure correct order
                });
            });
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendMessage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.messages.push(action.payload);
                state.isLoading = false;
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Something went wrong";
            })
            .addCase(editMessage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(editMessage.fulfilled, (state, action) => {
                state.messages.push(action.payload);
                state.isLoading = false;
            })
            .addCase(editMessage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Something went wrong";
            })
            .addCase(fetchChatHistory.pending, (state) => {
                state.historyLoading = true;
                state.historyError = null;
            })
            .addCase(fetchChatHistory.fulfilled, (state, action) => {
                state.history = action.payload;
                state.historyLoading = false;
            })
            .addCase(fetchChatHistory.rejected, (state, action) => {
                state.historyLoading = false;
                state.historyError = action.payload as string;
            });
    },
});

export const {
    addMessage,
    clearChat,
    startEditingMessage,
    cancelEditingMessage,
    removeMessages,
    updateMessageStatus,
    loadHistorySession,
} = chatSlice.actions;

export default chatSlice.reducer;
