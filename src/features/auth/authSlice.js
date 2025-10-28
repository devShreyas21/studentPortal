import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axios";

// ✅ Login user
export const loginUser = createAsyncThunk("auth/loginUser", async (credentials, thunkAPI) => {
  try {
    const res = await axios.post("/auth/login", credentials);
    return res.data; // backend returns { token, user }
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

// ✅ Register user (if your assignment allows registration)
export const registerUser = createAsyncThunk("auth/registerUser", async (formData, thunkAPI) => {
  try {
    const res = await axios.post("/auth/register", formData);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Registration failed");
  }
});

// ✅ Load stored session from localStorage on startup
const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
