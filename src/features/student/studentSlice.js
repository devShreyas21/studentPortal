import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axios";

// ✅ Fetch projects assigned to the student
export const fetchStudentProjects = createAsyncThunk(
  "student/fetchStudentProjects",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/student/projects");
      return res.data.projects || res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch student projects"
      );
    }
  }
);

// ✅ Submit or update a task
export const submitTask = createAsyncThunk(
  "student/submitTask",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/student/submit", formData);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Task submission failed"
      );
    }
  }
);

const studentSlice = createSlice({
  name: "student",
  initialState: {
    projects: [],
    isLoading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentProjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStudentProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
        state.error = null;
      })
      .addCase(fetchStudentProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(submitTask.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message || "Submission successful";
        state.error = null;
      })
      .addCase(submitTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessage } = studentSlice.actions;
export default studentSlice.reducer;
