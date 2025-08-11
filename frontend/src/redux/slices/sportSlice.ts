import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Sport } from '@/types';
import { sportApi } from '@/services/api';

interface SportState {
  sports: Sport[];
  popularSports: Sport[];
  selectedSport: Sport | null;
  loading: boolean;
  error: string | null;
}

const initialState: SportState = {
  sports: [],
  popularSports: [],
  selectedSport: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchSports = createAsyncThunk(
  'sports/fetchSports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sportApi.getSports();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch sports');
    }
  }
);

export const fetchPopularSports = createAsyncThunk(
  'sports/fetchPopularSports',
  async (limit?: number, { rejectWithValue }) => {
    try {
      const response = await sportApi.getPopularSports(limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch popular sports');
    }
  }
);

export const fetchSport = createAsyncThunk(
  'sports/fetchSport',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await sportApi.getSport(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch sport');
    }
  }
);

export const createSport = createAsyncThunk(
  'sports/createSport',
  async (data: Partial<Sport>, { rejectWithValue }) => {
    try {
      const response = await sportApi.createSport(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create sport');
    }
  }
);

export const updateSport = createAsyncThunk(
  'sports/updateSport',
  async ({ id, data }: { id: string; data: Partial<Sport> }, { rejectWithValue }) => {
    try {
      const response = await sportApi.updateSport(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update sport');
    }
  }
);

export const deleteSport = createAsyncThunk(
  'sports/deleteSport',
  async (id: string, { rejectWithValue }) => {
    try {
      await sportApi.deleteSport(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete sport');
    }
  }
);

const sportSlice = createSlice({
  name: 'sports',
  initialState,
  reducers: {
    setSelectedSport: (state, action: PayloadAction<Sport | null>) => {
      state.selectedSport = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sports
      .addCase(fetchSports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSports.fulfilled, (state, action) => {
        state.loading = false;
        state.sports = action.payload || [];
      })
      .addCase(fetchSports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Popular Sports
      .addCase(fetchPopularSports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularSports.fulfilled, (state, action) => {
        state.loading = false;
        state.popularSports = action.payload || [];
      })
      .addCase(fetchPopularSports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Single Sport
      .addCase(fetchSport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSport.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSport = action.payload || null;
      })
      .addCase(fetchSport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Sport
      .addCase(createSport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSport.fulfilled, (state, action) => {
        state.loading = false;
        state.sports.push(action.payload);
      })
      .addCase(createSport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Sport
      .addCase(updateSport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSport.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sports.findIndex(sport => sport._id === action.payload._id);
        if (index !== -1) {
          state.sports[index] = action.payload;
        }
        if (state.selectedSport?._id === action.payload._id) {
          state.selectedSport = action.payload;
        }
      })
      .addCase(updateSport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Sport
      .addCase(deleteSport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSport.fulfilled, (state, action) => {
        state.loading = false;
        state.sports = state.sports.filter(sport => sport._id !== action.payload);
        if (state.selectedSport?._id === action.payload) {
          state.selectedSport = null;
        }
      })
      .addCase(deleteSport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedSport, clearError } = sportSlice.actions;
export default sportSlice.reducer;
