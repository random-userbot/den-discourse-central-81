
import axios from "axios";

// Base API URL
const API_URL = "http://localhost:8080/api";

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
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

// Helper to get full image URL
export const getImageUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `http://localhost:8080${url}`;
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
};
