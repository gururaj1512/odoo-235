import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ratingApi } from '@/services/api';
import { Rating } from '@/types';

interface RatingState {
  ratings: Rating[];
  averageRating: number;
  totalRatings: number;
  pagination: any;
  loading: boolean;
  error: string | null;
}

const initialState: RatingState = {
  ratings: [],
  averageRating: 0,
  totalRatings: 0,
  pagination: null,
  loading: false,
  error: null
};

// Async thunks
export const addRating = createAsyncThunk(
  'rating/addRating',
  async (data: { facilityId: string; rating: number; review: string }, { rejectWithValue }) => {
    try {
      const response = await ratingApi.addRating(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add rating');
    }
  }
);

export const getFacilityRatings = createAsyncThunk(
  'rating/getFacilityRatings',
  async ({ facilityId, params }: { facilityId: string; params?: { page?: number; limit?: number } }, { rejectWithValue }) => {
    try {
      const response = await ratingApi.getFacilityRatings(facilityId, params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch ratings');
    }
  }
);

export const deleteRating = createAsyncThunk(
  'rating/deleteRating',
  async (ratingId: string, { rejectWithValue }) => {
    try {
      const response = await ratingApi.deleteRating(ratingId);
      return { ratingId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete rating');
    }
  }
);

const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRatings: (state) => {
      state.ratings = [];
      state.averageRating = 0;
      state.totalRatings = 0;
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Rating
      .addCase(addRating.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addRating.fulfilled, (state, action) => {
        state.loading = false;
        // Update average rating and total ratings from response
        if (action.payload.data) {
          state.averageRating = action.payload.data.averageRating || 0;
          state.totalRatings = action.payload.data.totalRatings || 0;
        }
      })
      .addCase(addRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Facility Ratings
      .addCase(getFacilityRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFacilityRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.ratings = action.payload.data.ratings || [];
        state.averageRating = action.payload.data.averageRating || 0;
        state.totalRatings = action.payload.data.totalRatings || 0;
        state.pagination = action.payload.data.pagination || null;
      })
      .addCase(getFacilityRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Rating
      .addCase(deleteRating.fulfilled, (state, action) => {
        // Remove the deleted rating from the list
        const deletedRatingId = action.payload.ratingId;
        state.ratings = state.ratings.filter(rating => rating._id !== deletedRatingId);
        
        // Update average rating and total ratings from response
        if (action.payload.data) {
          state.averageRating = action.payload.data.averageRating || 0;
          state.totalRatings = action.payload.data.totalRatings || 0;
        } else {
          state.totalRatings = Math.max(0, state.totalRatings - 1);
        }
      });
  },
});

export const { clearError, clearRatings } = ratingSlice.actions;

export default ratingSlice.reducer;
