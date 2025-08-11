import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '@/services/api';

interface AdminStats {
  totalUsers: number;
  totalOwners: number;
  totalBookings: number;
  totalActiveCourts: number;
  pendingApprovals: number;
}

interface UserTrend {
  period: string;
  users: number;
  owners: number;
}

interface BookingTrend {
  date: string;
  bookings: number;
  revenue: number;
}

interface ActiveSport {
  sport: string;
  bookings: number;
  revenue: number;
}

interface AdminState {
  stats: AdminStats | null;
  userTrends: UserTrend[];
  bookingTrends: BookingTrend[];
  activeSports: ActiveSport[];
  recentUsers: any[];
  pendingFacilities: any[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  stats: null,
  userTrends: [],
  bookingTrends: [],
  activeSports: [],
  recentUsers: [],
  pendingFacilities: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch admin stats');
    }
  }
);

export const fetchUserTrends = createAsyncThunk(
  'admin/fetchUserTrends',
  async (period: string = 'month', { rejectWithValue }) => {
    try {
      const response = await adminApi.getUserTrends(period);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user trends');
    }
  }
);

export const fetchBookingTrends = createAsyncThunk(
  'admin/fetchBookingTrends',
  async (period: string = 'week', { rejectWithValue }) => {
    try {
      const response = await adminApi.getBookingTrends(period);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch booking trends');
    }
  }
);

export const fetchActiveSports = createAsyncThunk(
  'admin/fetchActiveSports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getActiveSports();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch active sports');
    }
  }
);

export const fetchRecentUsers = createAsyncThunk(
  'admin/fetchRecentUsers',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await adminApi.getRecentUsers(limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch recent users');
    }
  }
);

export const fetchPendingFacilities = createAsyncThunk(
  'admin/fetchPendingFacilities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getPendingFacilities();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch pending facilities');
    }
  }
);

export const banUser = createAsyncThunk(
  'admin/banUser',
  async ({ userId, action }: { userId: string; action: 'ban' | 'unban' }, { rejectWithValue }) => {
    try {
      const response = await adminApi.banUser(userId, action);
      return { userId, action, response: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to ban/unban user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await adminApi.deleteUser(userId);
      return { userId, response: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete user');
    }
  }
);

export const approveFacility = createAsyncThunk(
  'admin/approveFacility',
  async ({ facilityId, action }: { facilityId: string; action: 'approve' | 'reject' }, { rejectWithValue }) => {
    try {
      const response = await adminApi.approveFacility(facilityId, action);
      return { facilityId, action, response: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to approve/reject facility');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAdminData: (state) => {
      state.stats = null;
      state.userTrends = [];
      state.bookingTrends = [];
      state.activeSports = [];
      state.recentUsers = [];
      state.pendingFacilities = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Admin Stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch User Trends
      .addCase(fetchUserTrends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTrends.fulfilled, (state, action) => {
        state.loading = false;
        state.userTrends = action.payload;
      })
      .addCase(fetchUserTrends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Booking Trends
      .addCase(fetchBookingTrends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingTrends.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingTrends = action.payload;
      })
      .addCase(fetchBookingTrends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Active Sports
      .addCase(fetchActiveSports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveSports.fulfilled, (state, action) => {
        state.loading = false;
        state.activeSports = action.payload;
      })
      .addCase(fetchActiveSports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Recent Users
      .addCase(fetchRecentUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.recentUsers = action.payload;
      })
      .addCase(fetchRecentUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Pending Facilities
      .addCase(fetchPendingFacilities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingFacilities.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingFacilities = action.payload;
      })
      .addCase(fetchPendingFacilities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Ban User
      .addCase(banUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(banUser.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, action: banAction } = action.payload;
        // Update user status in recentUsers array
        const userIndex = state.recentUsers.findIndex(user => user._id === userId);
        if (userIndex !== -1) {
          state.recentUsers[userIndex].isActive = banAction === 'unban';
        }
      })
      .addCase(banUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        const { userId } = action.payload;
        // Remove user from recentUsers array
        state.recentUsers = state.recentUsers.filter(user => user._id !== userId);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Approve Facility
      .addCase(approveFacility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveFacility.fulfilled, (state, action) => {
        state.loading = false;
        const { facilityId, action: approvalAction } = action.payload;
        // Remove facility from pending facilities array
        state.pendingFacilities = state.pendingFacilities.filter(facility => facility._id !== facilityId);
      })
      .addCase(approveFacility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearAdminData } = adminSlice.actions;
export default adminSlice.reducer;
