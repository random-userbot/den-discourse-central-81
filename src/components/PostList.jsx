
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export default function PostList({ denId, user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [denId]);

  const loadPosts = async () => {
    try {
      const data = denId 
        ? await apiService.getPostsByDen(denId)
        : await apiService.getPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId, upvote) => {
    if (!user) {
      alert('Please login to vote');
      return;
    }

    try {
      await apiService.votePost(postId, upvote);
      loadPosts(); // Reload to get updated vote counts
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await apiService.deletePost(postId);
      loadPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  if (posts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        No posts found.
      </div>
    );
  }

  return (
    <div>
      {posts.map(post => (
        <article key={post.id} className="post">
          <h2 className="post-title">
            <a href={`/post/${post.id}`}>{post.title}</a>
          </h2>
          
          <div className="post-meta">
            Posted by <strong>{post.creatorUsername}</strong> in{' '}
            <a href={`/den/${post.denId}`}>d/{post.denTitle}</a> •{' '}
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
          
          {post.content && (
            <div className="post-content">
              {post.content.substring(0, 300)}
              {post.content.length > 300 && '...'}
            </div>
          )}

          {post.images && post.images.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <img 
                src={post.images[0]} 
                alt="Post image"
                style={{ 
                  maxWidth: '100%', 
                  height: '200px', 
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
              />
            </div>
          )}
          
          <div className="post-actions">
            <div className="vote-buttons">
              <button 
                className="vote-btn"
                onClick={() => handleVote(post.id, true)}
              >
                ▲ {post.upvotes}
              </button>
              <button 
                className="vote-btn"
                onClick={() => handleVote(post.id, false)}
              >
                ▼ {post.downvotes}
              </button>
            </div>
            
            <a href={`/post/${post.id}`}>
              💬 {post.commentCount} comments
            </a>
            
            {user && (user.username === post.creatorUsername) && (
              <button 
                onClick={() => handleDelete(post.id)}
                style={{ color: '#c33', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Delete
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
