import { AUTH_BASE_URL } from "./const";

// ============================================
// TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  status: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiError {
  statusCode: number;
  message: string;
}

// ============================================
// API CALL WRAPPER
// ============================================

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const response = await fetch(`${AUTH_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include", // cross-domain cookie support
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status === false) {
    const error: ApiError = {
      statusCode: data.statusCode || response.status,
      message: data.message || "Something went wrong",
    };
    throw error;
  }

  return data as ApiResponse<T>;
}

// ============================================
// AUTH API
// ============================================

/** POST /auth/register — sends OTP to email */
export async function registerApi(email: string) {
  return apiCall<{ email: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/** POST /auth/verify-otp */
export async function verifyOtpApi(email: string, otp: string) {
  return apiCall<{ tempToken: string }>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

/** POST /auth/complete-profile?tempToken=xxx */
export async function completeProfileApi(
  data: { name: string; password: string; confirmPassword: string },
  tempToken: string,
) {
  return apiCall<{ token: string }>(`/auth/complete-profile?tempToken=${encodeURIComponent(tempToken)}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** POST /auth/login */
export async function loginApi(email: string, password: string) {
  return apiCall<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/** POST /auth/request-set-password */
export async function requestSetPasswordApi(email: string) {
  return apiCall<{ email: string }>("/auth/request-set-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/** POST /auth/set-password?tempToken=xxx */
export async function setPasswordApi(
  data: { password: string; confirmPassword: string },
  tempToken: string,
) {
  return apiCall<{ token: string }>(
    `/auth/set-password?tempToken=${encodeURIComponent(tempToken)}`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

/** POST /auth/logout */
export async function logoutApi() {
  return apiCall<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}

/** Build OAuth redirect URL */
export function getOAuthUrl(provider: "google" | "github" | "microsoft") {
  return `${AUTH_BASE_URL}/auth/${provider}`;
}
