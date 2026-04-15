import { useContext } from "react";
import AuthContext from "./authContextValue";

//custom hook to access auth context values and functions across the app
export function useAuth() {
  return useContext(AuthContext);
}
