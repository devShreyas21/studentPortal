import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axios";

// ✅ Fetch all users
export const fetchUsers = createAsyncThunk("admin/fetchUsers", async (_, thunkAPI) => {
  try {
    const res = await axios.get("/admin/users");
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch users");
  }
});

// ✅ Fetch activity logs
export const fetchLogs = createAsyncThunk("admin/fetchLogs", async (_, thunkAPI) => {
  try {
    const res = await axios.get("/admin/logs");
    return res.data.logs || [];
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch logs");
  }
});

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    users: [],
    logs: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logs
      .addCase(fetchLogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.logs = action.payload;
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default adminSlice.reducer;
