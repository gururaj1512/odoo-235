import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Facility, CreateFacilityData, ApiResponse } from '@/types';
import { facilityApi } from '@/services/api';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  totalCount: number;
}

interface FacilityState {
  facilities: Facility[];
  currentFacility: Facility | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  filters: {
    sport?: string;
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
    radius?: number;
    timeSlot?: string;
  };
}

const initialState: FacilityState = {
  facilities: [],
  currentFacility: null,
  loading: false,
  error: null,
  pagination: null,
  filters: {}
};

// Async thunks
export const fetchFacilities = createAsyncThunk(
  'facilities/fetchFacilities',
  async (params?: {
    sport?: string;
    category?: string;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
    radius?: number;
    timeSlot?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await facilityApi.getFacilities(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch facilities');
    }
  }
);

export const fetchFacility = createAsyncThunk(
  'facilities/fetchFacility',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await facilityApi.getFacility(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch facility');
    }
  }
);

export const createFacility = createAsyncThunk(
  'facilities/createFacility',
  async (data: CreateFacilityData, { rejectWithValue }) => {
    try {
      const response = await facilityApi.createFacility(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create facility');
    }
  }
);

export const updateFacility = createAsyncThunk(
  'facilities/updateFacility',
  async ({ id, data }: { id: string; data: Partial<CreateFacilityData> }, { rejectWithValue }) => {
    try {
      const response = await facilityApi.updateFacility(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update facility');
    }
  }
);

export const deleteFacility = createAsyncThunk(
  'facilities/deleteFacility',
  async (id: string, { rejectWithValue }) => {
    try {
      await facilityApi.deleteFacility(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete facility');
    }
  }
);

const facilitySlice = createSlice({
  name: 'facilities',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentFacility: (state) => {
      state.currentFacility = null;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Facilities
      .addCase(fetchFacilities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFacilities.fulfilled, (state, action) => {
        state.loading = false;
        state.facilities = action.payload.data || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchFacilities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Facility
      .addCase(fetchFacility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFacility.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFacility = action.payload.data || null;
      })
      .addCase(fetchFacility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Facility
      .addCase(createFacility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFacility.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.facilities.push(action.payload.data);
        }
      })
      .addCase(createFacility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Facility
      .addCase(updateFacility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFacility.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.facilities.findIndex(f => f._id === action.payload.data._id);
          if (index !== -1) {
            state.facilities[index] = action.payload.data;
          }
          if (state.currentFacility?._id === action.payload.data._id) {
            state.currentFacility = action.payload.data;
          }
        }
      })
      .addCase(updateFacility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Facility
      .addCase(deleteFacility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFacility.fulfilled, (state, action) => {
        state.loading = false;
        state.facilities = state.facilities.filter(f => f._id !== action.payload);
        if (state.currentFacility?._id === action.payload) {
          state.currentFacility = null;
        }
      })
      .addCase(deleteFacility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentFacility, updateFilters, clearFilters } = facilitySlice.actions;
export default facilitySlice.reducer;
