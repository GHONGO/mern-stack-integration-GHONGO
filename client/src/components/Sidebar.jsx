import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../services/api';

const Sidebar = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <aside className="sidebar">
      {/* Search Widget */}
      <div className="sidebar-section">
        <h3>Search</h3>
        <form>
          <input
            type="text"
            placeholder="Search posts..."
            className="form-control"
          />
        </form>
      </div>

      {/* Categories Widget */}
      <div className="sidebar-section">
        <h3>Categories</h3>
        <ul className="category-list">
          {categories.length > 0 ? (
            categories.map(category => (
              <li key={category._id}>
                <Link to={`/?category=${category.slug}`}>
                  {category.name}
                  <span className="category-count">12</span>
                </Link>
              </li>
            ))
          ) : (
            <li>No categories yet</li>
          )}
        </ul>
      </div>

      {/* About Widget */}
      <div className="sidebar-section">
        <h3>About</h3>
        <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-light)' }}>
          Welcome to MERN Blog! A modern blogging platform built with the MERN stack. 
          Share your thoughts, stories, and ideas with the world.
        </p>
      </div>

      {/* Newsletter Widget */}
      <div className="sidebar-section">
        <h3>Newsletter</h3>
        <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-light)' }}>
          Subscribe to get the latest posts delivered to your inbox.
        </p>
        <form>
          <input
            type="email"
            placeholder="Your email address"
            className="form-control"
            style={{ marginBottom: '0.5rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Subscribe
          </button>
        </form>
      </div>
    </aside>
  );
};

export default Sidebar;