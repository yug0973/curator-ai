import axios, { AxiosError } from "axios";
import {
  OnboardingAnswers,
  Profile,
  Recommendation,
  ReflectionResponse,
  ApiError,
  OnboardingResponse,
  AuthResponse,
  AdminStats,
  ChatMessage,
  OnboardingChatResponse,
  RoadmapStepCompletionResponse,
  HistoryResponse,
  InsightsResponse,
} from "../types/index.js";

// Determine base URL: try VITE_API_BASE_URL, default to '/api' for full-stack, fallback if needed
const envApiUrl = (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL;
const PRIMARY_BASE_URL = envApiUrl || "/api";
const SECONDARY_BASE_URL = "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: PRIMARY_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 12000,
});

// Helper to execute request with fallback endpoint if connection fails
async function requestWithFallback<T>(
  requestFn: (client: typeof apiClient) => Promise<T>
): Promise<T> {
  try {
    return await requestFn(apiClient);
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;
    
    // If primary failed due to network unreachable and we are not on localhost:5000, try secondary
    if (
      !axiosError.response &&
      apiClient.defaults.baseURL !== SECONDARY_BASE_URL
    ) {
      console.warn("Primary API endpoint unreachable, attempting secondary http://localhost:5000/api...");
      const fallbackClient = axios.create({
        baseURL: SECONDARY_BASE_URL,
        headers: { "Content-Type": "application/json" },
        timeout: 12000,
      });
      try {
        return await requestFn(fallbackClient);
      } catch (fallbackError) {
        throw extractApiError(fallbackError as AxiosError<ApiError>);
      }
    }
    throw extractApiError(axiosError);
  }
}

function extractApiError(error: AxiosError<ApiError>): Error {
  // Network error (server unreachable)
  if (!error.response && error.code === 'ECONNREFUSED') {
    return new Error("Cannot connect to server. Please check if the server is running.");
  }
  
  // Timeout error
  if (!error.response && error.code === 'ECONNABORTED') {
    return new Error("Request timed out. Please check your internet connection.");
  }
  
  // Generic network error
  if (!error.response) {
    return new Error("Network error. Please check your internet connection and try again.");
  }
  
  // API returned an error message
  if (error.response?.data?.message) {
    return new Error(error.response.data.message);
  }
  
  // HTTP error without message
  if (error.response?.status) {
    const statusMessages: Record<number, string> = {
      400: "Invalid request. Please check your input.",
      401: "You need to sign in to access this feature.",
      403: "You don't have permission to access this resource.",
      404: "The requested resource was not found.",
      429: "Too many requests. Please wait a moment and try again.",
      500: "Server error. Please try again later.",
      502: "Server is temporarily unavailable. Please try again.",
      503: "Service unavailable. Please try again later.",
    };
    return new Error(statusMessages[error.response.status] || `Server error (${error.response.status})`);
  }
  
  if (error.message) {
    return new Error(error.message);
  }
  
  return new Error("Something went wrong. Please try again.");
}

export function setSessionId(id: string) {
  apiClient.defaults.headers.common["x-session-id"] = id;
}

export function clearSession() {
  delete apiClient.defaults.headers.common["x-session-id"];
  delete apiClient.defaults.headers.common["Authorization"];
}

export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
}

/**
 * Auth actions
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  return requestWithFallback(async (client) => {
    const response = await client.post<AuthResponse>("/auth/login", { email, password });
    return response.data;
  });
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  return requestWithFallback(async (client) => {
    const response = await client.post<AuthResponse>("/auth/signup", { name, email, password });
    return response.data;
  });
}

/**
 * Sign in with a Google Identity Services ID token credential
 */
export async function googleLogin(credential: string): Promise<AuthResponse> {
  return requestWithFallback(async (client) => {
    const response = await client.post<AuthResponse>("/auth/google", { credential });
    return response.data;
  });
}

/**
 * Submit conversational onboarding answers to extract identity profile
 */
export async function submitOnboarding(
  answers: OnboardingAnswers
): Promise<OnboardingResponse> {
  return requestWithFallback(async (client) => {
    const response = await client.post<OnboardingResponse>("/onboarding", {
      answers,
    });
    return response.data;
  });
}

/**
 * Real-time agentic onboarding chat validation and progression
 */
export async function submitOnboardingChat(
  messages: ChatMessage[],
  currentTopic: "goal" | "goodHabit" | "badHabit" | "blocker",
  followUpCount: number = 0
): Promise<OnboardingChatResponse> {
  return requestWithFallback(async (client) => {
    const response = await client.post<OnboardingChatResponse>("/onboarding/chat", {
      messages,
      currentTopic,
      followUpCount,
    });
    return response.data;
  });
}

/**
 * Fetch top 3 curated recommendations matching gapTheme
 */
export async function getRecommendations(
  gapTheme: string
): Promise<Recommendation[]> {
  return requestWithFallback(async (client) => {
    const response = await client.get<Recommendation[]>("/recommendations", {
      params: { gapTheme },
    });
    return response.data;
  });
}

/**
 * Submit user reflection on a recommendation
 */
export async function submitReflection(
  recommendationId: string,
  liked: boolean,
  emotion: string
): Promise<ReflectionResponse> {
  return requestWithFallback(async (client) => {
    const response = await client.post<ReflectionResponse>("/reflection", {
      recommendationId,
      liked,
      emotion,
    });
    return response.data;
  });
}

/**
 * Admin actions
 */
export async function getAdminStats(): Promise<AdminStats> {
  return requestWithFallback(async (client) => {
    const response = await client.get<AdminStats>("/admin/stats");
    return response.data;
  });
}

export async function addCuratedResource(resource: {
  title: string;
  description: string;
  type: string;
  url: string;
  tags: string[];
}): Promise<{ success: boolean }> {
  return requestWithFallback(async (client) => {
    const response = await client.post<{ success: boolean }>("/admin/resources", resource);
    return response.data;
  });
}

/**
 * Fetch the signed-in user's reflection log and roadmap milestone timeline
 */
export async function getHistory(): Promise<HistoryResponse> {
  return requestWithFallback(async (client) => {
    const response = await client.get<HistoryResponse>("/history");
    return response.data;
  });
}

/**
 * Fetch derived analytics and an AI-generated narrative on the user's trajectory
 */
export async function getInsights(): Promise<InsightsResponse> {
  return requestWithFallback(async (client) => {
    const response = await client.get<InsightsResponse>("/insights");
    return response.data;
  });
}

/**
 * Submit roadmap step completion
 */
export async function submitRoadmapStepCompletion(
  stepPhase: number,
  reflectionText: string
): Promise<RoadmapStepCompletionResponse> {
  return requestWithFallback(async (client) => {
    const response = await client.post<RoadmapStepCompletionResponse>("/roadmap/step", {
      stepPhase,
      reflectionText,
    });
    return response.data;
  });
}
