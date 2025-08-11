import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Booking, CreateBookingData } from '@/types';
import { bookingApi } from '@/services/api';

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
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

export const fetchBooking = createAsyncThunk(
  'bookings/fetchBooking',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await bookingApi.getBooking(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch booking');
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

export const updateBookingStatus = createAsyncThunk(
  'bookings/updateBookingStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await bookingApi.updateBookingStatus(id, status);
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
    clearBookings: (state) => {
      state.bookings = [];
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
      // Fetch Booking
      .addCase(fetchBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload.data || null;
      })
      .addCase(fetchBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
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
      // Update Booking Status
      .addCase(updateBookingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.bookings.findIndex(b => b._id === action.payload.data._id);
          if (index !== -1) {
            state.bookings[index] = action.payload.data;
          }
          if (state.currentBooking?._id === action.payload.data._id) {
            state.currentBooking = action.payload.data;
          }
        }
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Cancel Booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.bookings.findIndex(b => b._id === action.payload.data._id);
          if (index !== -1) {
            state.bookings[index] = action.payload.data;
          }
          if (state.currentBooking?._id === action.payload.data._id) {
            state.currentBooking = action.payload.data;
          }
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentBooking, clearBookings } = bookingSlice.actions;
export default bookingSlice.reducer;
