import { createContext } from "react";
import type { UserResponse } from "../types/api";

export interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
