// utils/AuthContext.js

import React, { createContext, useReducer, useContext } from "react";
import { Profile } from "./api.types";

type stateType = {
  isAuthenticated: boolean;
  user: Profile | null;
}

// Define the initial state
const initialState: stateType = {
  isAuthenticated: false,
  user: null,
};

type Dispatch = { type: typeof LOGIN | typeof LOGOUT; payload?: stateType | any };

// Create a context
const AuthContext = createContext({
  state: initialState,
  dispatch: (data: Dispatch) => {},
});

// Define actions
export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";

// Reducer function
const authReducer = (state: typeof initialState, action: Dispatch) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
};

// Context provider
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the context
export const useAuth = () => {
  return useContext(AuthContext);
};
