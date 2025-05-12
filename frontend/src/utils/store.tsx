// src/store.ts
import { configureStore } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  isLoggedIn: false,
};

// Reducer function
const loginReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case 'SET_LOGIN_STATUS':
      return {
        ...state,
        isLoggedIn: action.payload,
      };
    default:
      return state;
  }
};

// Store configure karna
const store = configureStore({
  reducer: {
    login: loginReducer,
  },
});

// RootState type define karna
export type RootState = ReturnType<typeof store.getState>;

export default store;
