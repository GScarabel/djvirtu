import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { setUser, clearUser, setLoading } from '../store/authSlice';

// Custom hook to access auth state from Redux
export const useReduxAuth = () => {
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const setReduxUser = (userData: any) => {
    dispatch(setUser(userData));
  };

  const logout = () => {
    dispatch(clearUser());
  };

  const setAuthLoading = (isLoading: boolean) => {
    dispatch(setLoading(isLoading));
  };

  return {
    user,
    isAuthenticated,
    loading,
    setReduxUser,
    logout,
    setAuthLoading,
  };
};
