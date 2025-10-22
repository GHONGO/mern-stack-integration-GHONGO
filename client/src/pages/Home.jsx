import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { postService, categoryService } from '../services/api';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';

const Home = () => {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const { data: postsData, loading: postsLoading, error: postsError } = useApi(
    () => postService.getAllPosts(page, 9, selectedCategory),
    [page, selectedCategory]
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoryService.getAllCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        const result = await postService.searchPosts(searchQuery);
        console.log('Search results:', result);
        // Implement search results display
      } catch (error) {
        console.error('Search error:', error);
      }
    }
  };

  if (postsLoading) {
    return <div className="loading">Loading posts...</div>;
  }

  if (postsError) {
    return <div className="error">Error: {postsError}</div>;
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Welcome to MERN Blog</h1>
          <p>Discover amazing stories, technical insights, and creative ideas from our community of writers.</p>
        </div>
      </section>

      <div className="container">
        <div className="main-layout">
          {/* Main Content */}
          <main>
            {/* Search and Filter Section */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr auto',
              gap: '1rem',
              marginBottom: '2rem',
              alignItems: 'center'
            }}>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary">Search</button>
              </form>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-control"
                style={{ width: '200px' }}
                disabled={categoriesLoading}
              >
                <option value="">All Categories</option>
                {categoriesLoading ? (
                  <option disabled>Loading categories...</option>
                ) : categories.length > 0 ? (
                  categories.map(category => (
                    <option key={category._id} value={category.slug}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No categories available</option>
                )}
              </select>
            </div>

            {/* Featured Posts */}
            {page === 1 && postsData?.data?.length > 0 && (
              <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.8rem', color: 'var(--text-dark)' }}>
                  Featured Posts
                </h2>
                <div className="posts-grid">
                  {postsData.data.slice(0, 3).map(post => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {/* All Posts */}
            <section>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.8rem', color: 'var(--text-dark)' }}>
                {selectedCategory ? `Category: ${selectedCategory}` : 'All Posts'}
              </h2>
              
              <div className="posts-grid">
                {postsData?.data?.map(post => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>

              {/* No Posts Message */}
              {postsData?.data?.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '3rem',
                  color: 'var(--text-light)'
                }}>
                  <h3>No posts found</h3>
                  <p>Be the first to write a post!</p>
                </div>
              )}
            </section>

            {/* Pagination */}
            {postsData?.pagination && postsData.pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="btn btn-outline"
                >
                  Previous
                </button>
                
                <span className="pagination-info">
                  Page {page} of {postsData.pagination.pages}
                </span>
                
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={page >= postsData.pagination.pages}
                  className="btn btn-outline"
                >
                  Next
                </button>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default Home;