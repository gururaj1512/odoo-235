import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ownerApi } from '@/services/api';

interface OwnerStats {
  totalBookings: number;
  activeCourts: number;
  totalEarnings: number;
  pendingBookings: number;
  totalFacilities: number;
}

interface BookingTrend {
  date: string;
  bookings: number;
  earnings: number;
}

interface PeakHour {
  hour: string;
  bookings: number;
}

interface OwnerState {
  stats: OwnerStats | null;
  bookingTrends: BookingTrend[];
  peakHours: PeakHour[];
  loading: boolean;
  error: string | null;
}

const initialState: OwnerState = {
  stats: null,
  bookingTrends: [],
  peakHours: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchOwnerStats = createAsyncThunk(
  'owner/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ownerApi.getStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch owner stats');
    }
  }
);

export const fetchOwnerBookingTrends = createAsyncThunk(
  'owner/fetchBookingTrends',
  async (period: string = 'week', { rejectWithValue }) => {
    try {
      const response = await ownerApi.getBookingTrends(period);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch booking trends');
    }
  }
);

export const fetchOwnerPeakHours = createAsyncThunk(
  'owner/fetchPeakHours',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ownerApi.getPeakHours();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch peak hours');
    }
  }
);

const ownerSlice = createSlice({
  name: 'owner',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearOwnerData: (state) => {
      state.stats = null;
      state.bookingTrends = [];
      state.peakHours = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Owner Stats
      .addCase(fetchOwnerStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchOwnerStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Booking Trends
      .addCase(fetchOwnerBookingTrends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerBookingTrends.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingTrends = action.payload;
      })
      .addCase(fetchOwnerBookingTrends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Peak Hours
      .addCase(fetchOwnerPeakHours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerPeakHours.fulfilled, (state, action) => {
        state.loading = false;
        state.peakHours = action.payload;
      })
      .addCase(fetchOwnerPeakHours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearOwnerData } = ownerSlice.actions;
export default ownerSlice.reducer;
