
import axios from "axios";

const API_URL = "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (username: string, password: string) => 
    api.post("/auth/signin", { username, password }),
  
  register: (username: string, email: string, password: string) =>
    api.post("/auth/signup", { username, email, password }),
};

// Den services
export const denService = {
  getAllDens: () => api.get("/dens"),
  
  getDenById: (id: number) => api.get(`/dens/${id}`),
  
  createDen: (denData: { title: string; description: string; imageUrl?: string }) =>
    api.post("/dens", denData),
};

// Post services
export const postService = {
  getPostsByDen: (denId: number) => api.get(`/posts/den/${denId}`),
  
  getPostById: (id: number) => api.get(`/posts/${id}`),
  
  createPost: (postData: { title: string; content: string; denId: number; imageUrls?: string[] }) =>
    api.post("/posts", postData),
  
  uploadImages: (postId: number, formData: FormData) =>
    api.post(`/posts/${postId}/upload-images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  
  votePost: (postId: number, upvote: boolean) =>
    api.post(`/posts/${postId}/vote`, { upvote }),
  
  deletePost: (postId: number) => api.delete(`/posts/${postId}`),
};

// Comment services
export const commentService = {
  getCommentsByPost: (postId: number) => api.get(`/comments/post/${postId}`),
  
  getReplies: (commentId: number) => api.get(`/comments/${commentId}/replies`),
  
  createComment: (commentData: { content: string; postId: number; parentCommentId?: number }) =>
    api.post("/comments", commentData),
  
  voteComment: (commentId: number, upvote: boolean) =>
    api.post(`/comments/${commentId}/vote`, { upvote }),
  
  deleteComment: (commentId: number) => api.delete(`/comments/${commentId}`),
};

// User services
export const userService = {
  getUserProfile: (userId: number) => api.get(`/users/${userId}`),
  
  getCurrentUserProfile: () => api.get("/users/me"),
  
  getUserHistory: (userId: number) => api.get(`/users/${userId}/history`),
};
