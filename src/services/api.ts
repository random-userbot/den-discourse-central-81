import axios from "axios";

// Base API URL - Update to use the current origin instead of hardcoded localhost
const API_URL = `${window.location.protocol}//${window.location.hostname}:8080/api`;

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 0, // Add timeout to prevent hanging requests
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with an error status code
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response was received
      console.error("API Error: No response received. Server may be down.", error.request);
    } else {
      // Something else caused the error
      console.error("API Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Helper to get full image URL
export const getImageUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${window.location.protocol}//${window.location.hostname}:8080${url}`;
  return url;
};

// Auth service
export const authService = {
  login: (username: string, password: string) => {
    return api.post("/auth/signin", { username, password });
  },
  register: (username: string, email: string, password: string) => {
    return api.post("/auth/signup", { username, email, password });
  },
  forgotPassword: (username: string, email: string) => {
    return api.post("/auth/forgot-password", { username, email });
  },
  resetPassword: (token: string, newPassword: string) => {
    return api.post("/auth/reset-password", { token, newPassword });
  },
};

// User service
export const userService = {
  getUserProfile: (userId: number) => {
    return api.get(`/users/${userId}`);
  },
  getUserHistory: (userId: number) => {
    return api.get(`/users/${userId}/history`);
  },
  updateProfile: (profileData: { bio?: string; avatarUrl?: string }) => {
    return api.put("/users/me", profileData);
  },
  uploadAvatar: (formData: FormData) => {
    return api.post("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// Den service
export const denService = {
  getAllDens: () => {
    return api.get("/dens");
  },
  getDenById: (denId: number) => {
    return api.get(`/dens/${denId}`);
  },
  createDen: (denData: { title: string; description: string; imageUrl?: string }) => {
    return api.post("/dens", denData);
  },
  searchDens: (query: string) => {
    return api.get(`/dens/search?q=${encodeURIComponent(query)}`);
  },
};

// Post service
export const postService = {
  getAllPosts: () => {
    return api.get("/posts");
  },
  getPostsByDen: (denId: number) => {
    return api.get(`/posts/den/${denId}`);
  },
  getPostById: (postId: number) => {
    return api.get(`/posts/${postId}`);
  },
  createPost: (postData: { title: string; content: string; denId: number; imageUrls?: string[] }) => {
    return api.post("/posts", postData);
  },
  uploadImages: (formData: FormData) => {
    return api.post("/posts/upload-images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  votePost: (postId: number, upvote: boolean) => {
    return api.post(`/posts/${postId}/vote`, { upvote });
  },
  deletePost: (postId: number) => {
    return api.delete(`/posts/${postId}`);
  },
  searchPosts: (query: string) => {
    return api.get(`/posts/search?q=${encodeURIComponent(query)}`);
  },
};

// Comment service
export const commentService = {
  getCommentsByPost: (postId: number) => {
    return api.get(`/comments/post/${postId}`);
  },
  getReplies: (commentId: number) => {
    return api.get(`/comments/${commentId}/replies`);
  },
  createComment: (commentData: { content: string; postId: number; parentCommentId?: number }) => {
    return api.post("/comments", commentData);
  },
  voteComment: (commentId: number, upvote: boolean) => {
    return api.post(`/comments/${commentId}/vote`, { upvote });
  },
  deleteComment: (commentId: number) => {
    return api.delete(`/comments/${commentId}`);
  },
  searchComments: (query: string) => {
    return api.get(`/comments/search?q=${encodeURIComponent(query)}`);
  },
};

// Search service
export const searchService = {
  globalSearch: (query: string) => {
    return api.get(`/search?q=${encodeURIComponent(query)}`);
  },
};
