import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <article className="post-card">
      {post.featuredImage && post.featuredImage !== 'default-post.jpg' && (
        <img 
          src={`http://localhost:5000/uploads/${post.featuredImage}`} 
          alt={post.title}
          className="post-image"
        />
      )}
      
      <div className="post-content">
        <div className="post-meta">
          <span>{formatDate(post.createdAt)}</span>
          {post.category && (
            <span className="post-category">{post.category.name}</span>
          )}
        </div>

        <h3 className="post-title">
          <Link to={`/posts/${post.slug || post._id}`}>
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p className="post-excerpt">
            {truncateText(post.excerpt, 120)}
          </p>
        )}

        <div className="post-stats">
          <span>👁️ {post.viewCount} views</span>
          <span>💬 {post.comments?.length || 0} comments</span>
          <span>✍️ {post.author?.username}</span>
        </div>
      </div>
    </article>
  );
};

export default PostCard;