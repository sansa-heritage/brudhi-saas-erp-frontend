import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaBell, FaUserCircle, FaBars, FaUser, FaKey, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TopBar = ({ toggleSidebar }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState({
    name: "Admin User",
    role: "Administrator"
  });
  
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    const userName = localStorage.getItem("userName") || "Admin User";

    if (role === "superadmin") {
      setUser({
        name: userName || "Super Admin",
        role: "Super Administrator"
      });
    } else {
      setUser({
        name: userName || "Admin User",
        role: "Administrator"
      });
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMyProfile = () => {
    setShowUserMenu(false);
    navigate("/profile");
  };

  const handleChangePassword = () => {
    setShowUserMenu(false);
    navigate("/change-password");
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    localStorage.removeItem("userType");
    localStorage.removeItem("subdomain");
    localStorage.removeItem("tenant");
    
    toast.success("Logged out successfully!", {
      position: "top-right",
      autoClose: 2000,
      theme: "colored",
      transition: Bounce,
    });
    
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <nav className="main-navbar">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />

      <div className="navbar-container">
        <div className="navbar-left">
          <button 
            className="btn btn-link d-md-none p-0 me-2" 
            onClick={toggleSidebar}
            style={{ color: '#1e293b' }}
          >
            <FaBars size={20} />
          </button>

          <div className="navbar-title">
            <h4>Dashboard</h4>
            <p>Overview of your business performance</p>
          </div>
          
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search invoices, customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="navbar-right">
          <div className="notification-icon">
            <FaBell size={20} />
            <span className="notification-badge">3</span>
          </div>
          
          {/* User Profile with Dropdown */}
          <div className="user-profile" ref={userMenuRef}>
            <div 
              className="user-profile-clickable"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar-nav">
                {user.name.charAt(0)}
              </div>
              <div className="user-info-nav">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}</div>
              </div>
            </div>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="dropdown-user-info">
                  <div className="dropdown-user-avatar">
                    {user.name.charAt(0)}
                  </div>
                  <div className="dropdown-user-details">
                    <div className="dropdown-user-name">{user.name}</div>
                    <div className="dropdown-user-role">{user.role}</div>
                  </div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                {/* My Profile Link */}
                <div className="dropdown-item" onClick={handleMyProfile}>
                  <FaUser className="dropdown-icon" />
                  <span>My Profile</span>
                </div>
                
                {/* Change Password Link */}
                <div className="dropdown-item" onClick={handleChangePassword}>
                  <FaKey className="dropdown-icon" />
                  <span>Change Password</span>
                </div>
                
                <div className="dropdown-divider"></div>
                
                {/* Logout Button */}
                <div className="dropdown-item logout" onClick={handleLogout}>
                  <FaSignOutAlt className="dropdown-icon" />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        /* User Profile Dropdown Styles */
        .user-profile {
          position: relative;
        }

        .user-profile-clickable {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 5px 10px;
          border-radius: 8px;
          transition: background-color 0.2s;
        }

        .user-profile-clickable:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .user-avatar-nav {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
        }

        .user-info-nav {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          font-size: 14px;
          color: #1e293b;
        }

        .user-role {
          font-size: 12px;
          color: #64748b;
        }

        /* Dropdown Menu */
        .user-menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 10px;
          min-width: 260px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          overflow: hidden;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
        }

        .dropdown-user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
        }

        .dropdown-user-details {
          flex: 1;
        }

        .dropdown-user-name {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .dropdown-user-role {
          font-size: 12px;
          color: #64748b;
        }

        .dropdown-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 8px 0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: background-color 0.2s;
          color: #1e293b;
          font-size: 14px;
        }

        .dropdown-item:hover {
          background-color: #f8fafc;
        }

        .dropdown-item.logout {
          color: #ef4444;
        }

        .dropdown-item.logout:hover {
          background-color: #fef2f2;
        }

        .dropdown-icon {
          font-size: 16px;
          width: 20px;
        }

        .notification-icon {
          position: relative;
          cursor: pointer;
          padding: 8px;
        }

        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .search-wrapper {
          position: relative;
        }

        .search-wrapper input {
          padding-left: 35px;
          padding-right: 10px;
          height: 40px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          width: 250px;
          font-size: 14px;
        }

        .search-wrapper .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .user-info-nav {
            display: none;
          }
          
          .user-profile-clickable {
            padding: 5px;
          }
          
          .search-wrapper input {
            width: 150px;
          }
        }
      `}</style>
    </nav>
  );
};

export default TopBar;