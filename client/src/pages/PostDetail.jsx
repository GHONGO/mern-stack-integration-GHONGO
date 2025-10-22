import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { postService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: postData, loading, error, setData } = useApi(
    () => postService.getPost(id),
    [id]
  );

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;

    try {
      setSubmitting(true);
      const response = await postService.addComment(postData.data._id, { content: comment });
      setData(response.data);
      setComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await postService.deletePost(postData.data._id);
      navigate('/');
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!postData?.data) {
    return <div className="error">Post not found</div>;
  }

  const post = postData.data;
  const canEdit = user && (user.id === post.author._id || user.role === 'admin');

  return (
    <div className="container">
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <article className="card">
          {/* Post Header */}
          <header style={{ marginBottom: '2rem' }}>
            {canEdit && (
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                marginBottom: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => navigate(`/edit-post/${post._id}`)}
                  className="btn btn-primary"
                >
                  Edit
                </button>
                <button
                  onClick={handleDeletePost}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            )}

            <h1 style={{ marginBottom: '1rem' }}>{post.title}</h1>
            
            <div style={{ 
              color: '#666', 
              fontSize: '14px',
              borderBottom: '1px solid #eee',
              paddingBottom: '1rem'
            }}>
              By {post.author?.username} • {new Date(post.createdAt).toLocaleDateString()} • 
              {post.category?.name} • {post.viewCount} views
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && post.featuredImage !== 'default-post.jpg' && (
            <img 
              src={`http://localhost:5000/uploads/${post.featuredImage}`} 
              alt={post.title}
              style={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '2rem'
              }}
            />
          )}

          {/* Post Content */}
          <div 
            style={{ 
              lineHeight: '1.8',
              fontSize: '16px',
              marginBottom: '2rem'
            }}
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <strong>Tags: </strong>
              {post.tags.map(tag => (
                <span 
                  key={tag}
                  style={{
                    background: '#f1f1f1',
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: '12px',
                    margin: '0 5px'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Comments Section */}
        <section className="card" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>
            Comments ({post.comments?.length || 0})
          </h3>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleAddComment} style={{ marginBottom: '2rem' }}>
              <div className="form-group">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="form-control"
                  rows="3"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !comment.trim()}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              Please <a href="/login">login</a> to add a comment.
            </p>
          )}

          {/* Comments List */}
          <div>
            {post.comments?.length > 0 ? (
              post.comments.map(comment => (
                <div 
                  key={comment._id || comment.createdAt}
                  style={{
                    borderBottom: '1px solid #eee',
                    padding: '1rem 0'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <strong>{comment.user?.username || 'Anonymous'}</strong>
                    <span style={{ color: '#666', fontSize: '12px' }}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, lineHeight: '1.5' }}>{comment.content}</p>
                </div>
              ))
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PostDetail;