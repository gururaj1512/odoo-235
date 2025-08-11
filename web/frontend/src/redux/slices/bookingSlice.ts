import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Booking, CreateBookingData, ApiResponse } from '@/types';
import { bookingApi } from '@/services/api';

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  ownerBookings: {
    bookings: Booking[];
    pagination: any;
    summary: any;
    loading: boolean;
    error: string | null;
  };
  analytics: {
    bookingTrends: any[];
    facilityAnalytics: any[];
    sportAnalytics: any[];
    statusDistribution: any[];
    loading: boolean;
    error: string | null;
  };
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  currentBooking: null,
  ownerBookings: {
    bookings: [],
    pagination: null,
    summary: null,
    loading: false,
    error: null
  },
  analytics: {
    bookingTrends: [],
    facilityAnalytics: [],
    sportAnalytics: [],
    statusDistribution: [],
    loading: false,
    error: null
  },
  loading: false,
  error: null
};

// Async thunks
export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (facilityId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await bookingApi.getBookings(facilityId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch bookings');
    }
  }
);

export const fetchOwnerBookings = createAsyncThunk(
  'bookings/fetchOwnerBookings',
  async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    facilityId?: string;
    date?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await bookingApi.getOwnerBookings(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch owner bookings');
    }
  }
);

export const fetchOwnerAnalytics = createAsyncThunk(
  'bookings/fetchOwnerAnalytics',
  async (params?: {
    period?: 'week' | 'month' | 'year';
    facilityId?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await bookingApi.getOwnerBookingAnalytics(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch analytics');
    }
  }
);

export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (data: CreateBookingData, { rejectWithValue }) => {
    try {
      const response = await bookingApi.createBooking(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create booking');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await bookingApi.cancelBooking(bookingId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to cancel booking');
    }
  }
);

export const updateBookingStatusByOwner = createAsyncThunk(
  'bookings/updateBookingStatusByOwner',
  async ({ bookingId, data }: { bookingId: string; data: { status: string; reason?: string } }, { rejectWithValue }) => {
    try {
      const response = await bookingApi.updateBookingStatusByOwner(bookingId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update booking status');
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    clearOwnerBookingsError: (state) => {
      state.ownerBookings.error = null;
    },
    clearAnalyticsError: (state) => {
      state.analytics.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bookings
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.data || [];
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Owner Bookings
      .addCase(fetchOwnerBookings.pending, (state) => {
        state.ownerBookings.loading = true;
        state.ownerBookings.error = null;
      })
      .addCase(fetchOwnerBookings.fulfilled, (state, action) => {
        state.ownerBookings.loading = false;
        state.ownerBookings.bookings = action.payload.data || [];
        state.ownerBookings.pagination = action.payload.pagination || null;
        state.ownerBookings.summary = action.payload.summary || null;
      })
      .addCase(fetchOwnerBookings.rejected, (state, action) => {
        state.ownerBookings.loading = false;
        state.ownerBookings.error = action.payload as string;
      })
      // Fetch Owner Analytics
      .addCase(fetchOwnerAnalytics.pending, (state) => {
        state.analytics.loading = true;
        state.analytics.error = null;
      })
      .addCase(fetchOwnerAnalytics.fulfilled, (state, action) => {
        state.analytics.loading = false;
        state.analytics.bookingTrends = action.payload.data.bookingTrends || [];
        state.analytics.facilityAnalytics = action.payload.data.facilityAnalytics || [];
        state.analytics.sportAnalytics = action.payload.data.sportAnalytics || [];
        state.analytics.statusDistribution = action.payload.data.statusDistribution || [];
      })
      .addCase(fetchOwnerAnalytics.rejected, (state, action) => {
        state.analytics.loading = false;
        state.analytics.error = action.payload as string;
      })
      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.bookings.unshift(action.payload.data);
        }
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Cancel Booking
      .addCase(cancelBooking.fulfilled, (state, action) => {
        if (action.payload.data) {
          const index = state.bookings.findIndex(b => b._id === action.payload.data._id);
          if (index !== -1) {
            state.bookings[index] = action.payload.data;
          }
        }
      })
      // Update Booking Status by Owner
      .addCase(updateBookingStatusByOwner.fulfilled, (state, action) => {
        if (action.payload.data) {
          // Update in owner bookings
          const ownerIndex = state.ownerBookings.bookings.findIndex(b => b._id === action.payload.data._id);
          if (ownerIndex !== -1) {
            state.ownerBookings.bookings[ownerIndex] = action.payload.data;
          }
          // Update in regular bookings
          const regularIndex = state.bookings.findIndex(b => b._id === action.payload.data._id);
          if (regularIndex !== -1) {
            state.bookings[regularIndex] = action.payload.data;
          }
        }
      });
  },
});

export const { 
  clearError, 
  clearCurrentBooking, 
  clearOwnerBookingsError, 
  clearAnalyticsError 
} = bookingSlice.actions;

export default bookingSlice.reducer;
