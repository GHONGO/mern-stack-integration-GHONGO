import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="navbar">
          <Link to="/" className="logo">
            📝 MERN Blog
          </Link>

          <ul className="nav-links">
            <li>
              <Link to="/" className={isActive('/')}>Home</Link>
            </li>
            
            {user ? (
              <>
                <li>
                  <Link to="/create-post" className={isActive('/create-post')}>Write Post</Link>
                </li>
                <li>
                  <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
                    👋 Hello, {user.username}
                  </span>
                </li>
                <li>
                  <button 
                    onClick={handleLogout}
                    className="btn btn-outline"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className={isActive('/login')}>Login</Link>
                </li>
                <li>
                  <Link to="/register" className="btn btn-primary">Get Started</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;