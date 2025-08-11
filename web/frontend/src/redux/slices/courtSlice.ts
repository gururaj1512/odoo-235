import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Court, CreateCourtData } from '@/types';
import { courtApi } from '@/services/api';

interface CourtState {
  courts: Court[];
  currentCourt: Court | null;
  loading: boolean;
  error: string | null;
}

const initialState: CourtState = {
  courts: [],
  currentCourt: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCourts = createAsyncThunk(
  'courts/fetchCourts',
  async (facilityId: string, { rejectWithValue }) => {
    try {
      const response = await courtApi.getCourts(facilityId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch courts');
    }
  }
);

export const fetchCourt = createAsyncThunk(
  'courts/fetchCourt',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await courtApi.getCourt(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch court');
    }
  }
);

export const createCourt = createAsyncThunk(
  'courts/createCourt',
  async ({ facilityId, data }: { facilityId: string; data: CreateCourtData }, { rejectWithValue }) => {
    try {
      const response = await courtApi.createCourt(facilityId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create court');
    }
  }
);

export const updateCourt = createAsyncThunk(
  'courts/updateCourt',
  async ({ id, data }: { id: string; data: Partial<CreateCourtData> }, { rejectWithValue }) => {
    try {
      const response = await courtApi.updateCourt(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update court');
    }
  }
);

export const deleteCourt = createAsyncThunk(
  'courts/deleteCourt',
  async (id: string, { rejectWithValue }) => {
    try {
      await courtApi.deleteCourt(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete court');
    }
  }
);

const courtSlice = createSlice({
  name: 'courts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCourt: (state) => {
      state.currentCourt = null;
    },
    clearCourts: (state) => {
      state.courts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courts
      .addCase(fetchCourts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourts.fulfilled, (state, action) => {
        state.loading = false;
        state.courts = action.payload.data || [];
      })
      .addCase(fetchCourts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Court
      .addCase(fetchCourt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourt.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourt = action.payload.data;
      })
      .addCase(fetchCourt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Court
      .addCase(createCourt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourt.fulfilled, (state, action) => {
        state.loading = false;
        state.courts.push(action.payload.data);
      })
      .addCase(createCourt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Court
      .addCase(updateCourt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourt.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.courts.findIndex(c => c._id === action.payload.data._id);
        if (index !== -1) {
          state.courts[index] = action.payload.data;
        }
        if (state.currentCourt?._id === action.payload.data._id) {
          state.currentCourt = action.payload.data;
        }
      })
      .addCase(updateCourt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Court
      .addCase(deleteCourt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourt.fulfilled, (state, action) => {
        state.loading = false;
        state.courts = state.courts.filter(c => c._id !== action.payload);
        if (state.currentCourt?._id === action.payload) {
          state.currentCourt = null;
        }
      })
      .addCase(deleteCourt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentCourt, clearCourts } = courtSlice.actions;
export default courtSlice.reducer;
