import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '@/services/api';
import { Facility, User } from '@/types';

interface AdminState {
  globalStats: {
    totalUsers: number;
    totalOwners: number;
    totalBookings: number;
    totalActiveCourts: number;
    totalEarnings: number;
    pendingFacilities: number;
  } | null;
  pendingFacilities: {
    facilities: Facility[];
    pagination: any;
    loading: boolean;
    error: string | null;
  };
  users: {
    users: User[];
    pagination: any;
    loading: boolean;
    error: string | null;
  };
  analytics: {
    bookingTrends: any[];
    sportAnalytics: any[];
    loading: boolean;
    error: string | null;
  };
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  globalStats: null,
  pendingFacilities: {
    facilities: [],
    pagination: null,
    loading: false,
    error: null
  },
  users: {
    users: [],
    pagination: null,
    loading: false,
    error: null
  },
  analytics: {
    bookingTrends: [],
    sportAnalytics: [],
    loading: false,
    error: null
  },
  loading: false,
  error: null
};

// Async thunks
export const fetchGlobalStats = createAsyncThunk(
  'admin/fetchGlobalStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getGlobalStats();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch global stats');
    }
  }
);

export const fetchPendingFacilities = createAsyncThunk(
  'admin/fetchPendingFacilities',
  async (params: { page?: number; limit?: number } | undefined, { rejectWithValue }) => {
    try {
      const response = await adminApi.getPendingFacilities(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch pending facilities');
    }
  }
);

export const updateFacilityApproval = createAsyncThunk(
  'admin/updateFacilityApproval',
  async ({ facilityId, data }: { facilityId: string; data: { status: 'approved' | 'rejected'; rejectionReason?: string } }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateFacilityApproval(facilityId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update facility approval');
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (params: { page?: number; limit?: number; role?: string; search?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAllUsers(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch users');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ userId, status }: { userId: string; status: 'active' | 'banned' }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateUserStatus(userId, status);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update user status');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await adminApi.deleteUser(userId);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ userId, data }: { userId: string; data: Partial<User> }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateUser(userId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update user');
    }
  }
);

export const verifyUser = createAsyncThunk(
  'admin/verifyUser',
  async ({ userId, data }: { userId: string; data: { isVerified: boolean; verificationReason?: string } }, { rejectWithValue }) => {
    try {
      const response = await adminApi.verifyUser(userId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to verify user');
    }
  }
);

export const getUserDetails = createAsyncThunk(
  'admin/getUserDetails',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await adminApi.getUserDetails(userId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get user details');
    }
  }
);

export const fetchBookingAnalytics = createAsyncThunk(
  'admin/fetchBookingAnalytics',
  async (period: 'week' | 'month' | 'year' | undefined, { rejectWithValue }) => {
    try {
      const response = await adminApi.getBookingAnalytics(period);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch booking analytics');
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
    clearPendingFacilitiesError: (state) => {
      state.pendingFacilities.error = null;
    },
    clearUsersError: (state) => {
      state.users.error = null;
    },
    clearAnalyticsError: (state) => {
      state.analytics.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Global Stats
      .addCase(fetchGlobalStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlobalStats.fulfilled, (state, action) => {
        state.loading = false;
        state.globalStats = action.payload.data.stats;
      })
      .addCase(fetchGlobalStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Pending Facilities
      .addCase(fetchPendingFacilities.pending, (state) => {
        state.pendingFacilities.loading = true;
        state.pendingFacilities.error = null;
      })
      .addCase(fetchPendingFacilities.fulfilled, (state, action) => {
        state.pendingFacilities.loading = false;
        state.pendingFacilities.facilities = action.payload.data || [];
        state.pendingFacilities.pagination = action.payload.pagination || null;
      })
      .addCase(fetchPendingFacilities.rejected, (state, action) => {
        state.pendingFacilities.loading = false;
        state.pendingFacilities.error = action.payload as string;
      })
      // Update Facility Approval
      .addCase(updateFacilityApproval.fulfilled, (state, action) => {
        // Remove the approved/rejected facility from pending list
        const facilityId = action.payload.data._id;
        state.pendingFacilities.facilities = state.pendingFacilities.facilities.filter(
          facility => facility._id !== facilityId
        );
        // Update global stats
        if (state.globalStats) {
          state.globalStats.pendingFacilities = Math.max(0, state.globalStats.pendingFacilities - 1);
        }
      })
      // All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.users.loading = true;
        state.users.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.users.loading = false;
        state.users.users = action.payload.data || [];
        state.users.pagination = action.payload.pagination || null;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.users.loading = false;
        state.users.error = action.payload as string;
      })
      // Update User Status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        // Update the user in the users list
        const updatedUser = action.payload.data;
        const userIndex = state.users.users.findIndex(user => user._id === updatedUser._id);
        if (userIndex !== -1) {
          state.users.users[userIndex] = updatedUser;
        }
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        // Remove the deleted user from the users list
        const deletedUserId = action.payload;
        state.users.users = state.users.users.filter(user => user._id !== deletedUserId);
      })
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        // Update the user in the users list
        const updatedUser = action.payload.data;
        const userIndex = state.users.users.findIndex(user => user._id === updatedUser._id);
        if (userIndex !== -1) {
          state.users.users[userIndex] = updatedUser;
        }
      })
      // Verify User
      .addCase(verifyUser.fulfilled, (state, action) => {
        // Update the user in the users list
        const updatedUser = action.payload.data;
        const userIndex = state.users.users.findIndex(user => user._id === updatedUser._id);
        if (userIndex !== -1) {
          state.users.users[userIndex] = updatedUser;
        }
      })
      // Booking Analytics
      .addCase(fetchBookingAnalytics.pending, (state) => {
        state.analytics.loading = true;
        state.analytics.error = null;
      })
      .addCase(fetchBookingAnalytics.fulfilled, (state, action) => {
        state.analytics.loading = false;
        state.analytics.bookingTrends = action.payload.data.bookingTrends || [];
        state.analytics.sportAnalytics = action.payload.data.sportAnalytics || [];
      })
      .addCase(fetchBookingAnalytics.rejected, (state, action) => {
        state.analytics.loading = false;
        state.analytics.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  clearPendingFacilitiesError, 
  clearUsersError, 
  clearAnalyticsError 
} = adminSlice.actions;

export default adminSlice.reducer;
