import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postService, categoryService } from '../services/api';

const CreatePost = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, [user, navigate]);

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);
      await postService.createPost(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container">
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div className="card">
          <h2 style={{ marginBottom: '2rem' }}>Create New Post</h2>
          
          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                {...register('title', {
                  required: 'Title is required',
                  maxLength: {
                    value: 100,
                    message: 'Title cannot be more than 100 characters'
                  }
                })}
              />
              {errors.title && <div className="text-danger">{errors.title.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                {...register('category', {
                  required: 'Category is required'
                })}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && <div className="text-danger">{errors.category.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Excerpt</label>
              <textarea
                className="form-control"
                rows="3"
                {...register('excerpt', {
                  maxLength: {
                    value: 200,
                    message: 'Excerpt cannot be more than 200 characters'
                  }
                })}
              />
              {errors.excerpt && <div className="text-danger">{errors.excerpt.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea
                className="form-control"
                rows="10"
                {...register('content', {
                  required: 'Content is required'
                })}
              />
              {errors.content && <div className="text-danger">{errors.content.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma-separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="react, javascript, web-development"
                {...register('tags')}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Post'}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;