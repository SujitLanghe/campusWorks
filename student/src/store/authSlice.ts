import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  _id: string;
  name: { firstname: string; lastname: string };
  email: string;
  enrollmentno: string;
  department: string;
  skills?: string[];
  github?: string;
  linkedin?: string;
  phone?: string;
  year?: string;
  resumeUrl?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('student') || 'null') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('studentToken') : false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('studentToken', action.payload.token);
        localStorage.setItem('student', JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('studentToken');
        localStorage.removeItem('student');
      }
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
