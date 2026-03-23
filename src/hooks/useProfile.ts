import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import type { Profile } from "@/types/profile";
import {
  fetchProfile,
  updateProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "@/lib/profile-api";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Dummy profile for demo mode
const DUMMY_PROFILE: Profile = {
  id: "demo-profile-id",
  user_id: "demo-user-id",
  fullname: "Demo User",
  photo_url: "",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function useProfile() {
  const { token, refreshCachedProfile } = useAuth();
  const { isDemo } = useDemo();
  const [state, setState] = useState<AsyncState<Profile>>({
    data: null,
    loading: true,
    error: null,
  });

  const refetch = useCallback(() => {
    if (isDemo) {
      setState({ data: DUMMY_PROFILE, loading: false, error: null });
      return;
    }
    if (!token) return;

    setState((s) => ({ ...s, loading: true, error: null }));

    fetchProfile(token)
      .then((res) => {
        setState({ data: res.data, loading: false, error: null });
      })
      .catch((err) => {
        setState({ data: null, loading: false, error: err.message });
      });
  }, [token, isDemo]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const update = useCallback(
    async (fullname: string) => {
      if (isDemo) {
        setState((s) => ({
          ...s,
          data: s.data ? { ...s.data, fullname } : null,
        }));
        return;
      }
      if (!token) return;

      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        const res = await updateProfile(token, { fullname });
        setState({ data: res.data, loading: false, error: null });
        // Update cached profile in AuthContext
        refreshCachedProfile();
        return res.data;
      } catch (err: unknown) {
        const error = err as { message: string };
        setState((s) => ({ ...s, loading: false, error: error.message }));
        throw err;
      }
    },
    [token, isDemo, refreshCachedProfile],
  );

  const uploadPhoto = useCallback(
    async (base64Image: string) => {
      if (isDemo) {
        // In demo mode, just update the photo URL with a placeholder
        setState((s) => ({
          ...s,
          data: s.data
            ? {
                ...s.data,
                photo_url: "data:image/png;base64," + base64Image.slice(0, 100),
              }
            : null,
        }));
        return {
          success: true,
          photo_url: "",
          message: "Demo mode - photo not uploaded",
        };
      }
      if (!token) return;

      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        const res = await uploadProfilePhoto(token, {
          base64_image: base64Image,
        });
        if (res.data.success) {
          // Refetch to get updated profile
          refetch();
          // Update cached profile in AuthContext
          refreshCachedProfile();
        }
        return res.data;
      } catch (err: unknown) {
        const error = err as { message: string };
        setState((s) => ({ ...s, loading: false, error: error.message }));
        throw err;
      }
    },
    [token, isDemo, refetch, refreshCachedProfile],
  );

  const removePhoto = useCallback(async () => {
    if (isDemo) {
      setState((s) => ({
        ...s,
        data: s.data ? { ...s.data, photo_url: "" } : null,
      }));
      return;
    }
    if (!token) return;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      await deleteProfilePhoto(token);
      // Refetch to get updated profile
      refetch();
      // Update cached profile in AuthContext
      refreshCachedProfile();
    } catch (err: unknown) {
      const error = err as { message: string };
      setState((s) => ({ ...s, loading: false, error: error.message }));
      throw err;
    }
  }, [token, isDemo, refetch, refreshCachedProfile]);

  return { ...state, refetch, update, uploadPhoto, removePhoto };
}
