import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import adminReducer from "../features/admin/adminSlice";
import teacherReducer from "../features/teacher/teacherSlice";
import studentReducer from "../features/student/studentSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    teacher: teacherReducer,
    student: studentReducer,
  },
});
