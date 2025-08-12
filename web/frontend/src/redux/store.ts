import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import facilityReducer from './slices/facilitySlice';
import courtReducer from './slices/courtSlice';
import bookingReducer from './slices/bookingSlice';
import sportReducer from './slices/sportSlice';
import adminReducer from './slices/adminSlice';
import ratingReducer from './slices/ratingSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'] // Only persist auth state
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    facilities: facilityReducer,
    courts: courtReducer,
    bookings: bookingReducer,
    sports: sportReducer,
    admin: adminReducer,
    ratings: ratingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
