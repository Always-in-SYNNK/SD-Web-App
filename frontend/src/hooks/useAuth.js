// src/hooks/useAuth.js
import { useAuth as useAuthContext } from '../context/AuthContext';

// Re-export the useAuth hook from context
export const useAuth = useAuthContext;

// Also export as default if needed
export default useAuthContext;