import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axios";

// ✅ Fetch teacher's projects
export const fetchProjects = createAsyncThunk("teacher/fetchProjects", async (_, thunkAPI) => {
  try {
    const res = await axios.get("/teacher/projects");
    return res.data.projects || res.data; // handle both formats
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch projects");
  }
});

// ✅ Create new project
export const createProject = createAsyncThunk("teacher/createProject", async (data, thunkAPI) => {
  try {
    const res = await axios.post("/teacher/project", data);
    return res.data.project;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to create project");
  }
});

// ✅ Add new task
export const addTask = createAsyncThunk("teacher/addTask", async (data, thunkAPI) => {
  try {
    const res = await axios.post("/teacher/task", data);
    return res.data.task;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to add task");
  }
});

// ✅ Grade student submission
export const gradeSubmission = createAsyncThunk("teacher/gradeSubmission", async (data, thunkAPI) => {
  try {
    const res = await axios.put("/teacher/grade", data);
    return res.data.task;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to grade submission");
  }
});

const teacherSlice = createSlice({
  name: "teacher",
  initialState: {
    projects: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
      })
      .addCase(addTask.fulfilled, (state, action) => {
        // Optionally update local state
      });
  },
});

export default teacherSlice.reducer;
