
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8080/api`;

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(username, password) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(username, email, password) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  // Den endpoints
  async getDens() {
    return this.request('/dens');
  }

  async getDen(id) {
    return this.request(`/dens/${id}`);
  }

  async createDen(title, description, imageUrl) {
    return this.request('/dens', {
      method: 'POST',
      body: JSON.stringify({ title, description, imageUrl }),
    });
  }

  // Post endpoints
  async getPosts() {
    return this.request('/posts');
  }

  async getPost(id) {
    return this.request(`/posts/${id}`);
  }

  async getPostsByDen(denId) {
    return this.request(`/posts/den/${denId}`);
  }

  async createPost(title, content, denId, imageUrls) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content, denId, imageUrls }),
    });
  }

  async votePost(postId, upvote) {
    return this.request(`/posts/${postId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ upvote }),
    });
  }

  async deletePost(postId) {
    return this.request(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  // Comment endpoints
  async getComments(postId) {
    return this.request(`/comments/post/${postId}`);
  }

  async createComment(content, postId, parentCommentId) {
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify({ content, postId, parentCommentId }),
    });
  }

  async voteComment(commentId, upvote) {
    return this.request(`/comments/${commentId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ upvote }),
    });
  }

  async deleteComment(commentId) {
    return this.request(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // User endpoints
  async getUserProfile(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateProfile(bio, avatarUrl) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify({ bio, avatarUrl }),
    });
  }
}

export const apiService = new ApiService();
