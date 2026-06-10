// TopBar.js - Updated with real user data from localStorage
import React, { useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaBell,
  FaBars,
  FaUser,
  FaKey,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TopBar = ({ toggleSidebar }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    displayRole: "",
  });
  const [pageInfo, setPageInfo] = useState({
    title: "Dashboard",
    description: "Overview of your business performance",
  });

  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Complete route mapping for both Super Admin and Tenant
  const getPageInfo = (pathname) => {
    const routes = {
      "/dashboard": {
        title: "Dashboard",
        description: "Overview of your business performance",
      },
      "/profile": {
        title: "My Profile",
        description: "View and manage your profile information",
      },
      "/change-password": {
        title: "Change Password",
        description: "Update your account password for security",
      },
      "/customers": {
        title: "Customers",
        description:
          "Manage your customer database, view purchase history and documents",
      },
      "/customers/add": {
        title: "Add Customer",
        description: "Add a new customer to your database",
      },
      "/dealers": {
        title: "Dealers",
        description: "Manage your dealer network and partnerships",
      },
      "/dealers/add": {
        title: "Add Dealer",
        description: "Register a new dealer in the system",
      },
      "/staffs": {
        title: "Staff Management",
        description: "Manage your team members and their roles",
      },
      "/staffs/add": {
        title: "Add Staff",
        description: "Add a new staff member to your organization",
      },
      "/staffs/roles": {
        title: "Role Permissions",
        description: "Configure staff roles and access permissions",
      },

      // ============ PAYROLL ROUTES ============

      "/staff/payroll": {
        title: "Payroll List",
        description: "View and manage all payroll records",
      },
      "/staff/payroll/generate": {
        title: "Generate Payroll",
        description: "Generate payroll for staff members",
      },

      "/payslip": {
        title: "Download Payslip",
        description: "Download salary payslip for staff members",
      },
      "/staff/payroll/:id": {
        title: "Payroll Details",
        description:
          "View complete payroll information, salary breakdown, and payment details",
      },

      // ============ SALARY STRUCTURE ROUTES ============
      "/staff/salary-structure": {
        title: "Salary Structure",
        description: "Manage staff salary structures and components",
      },
      "/salary-structure/add": {
        title: "Create Salary Structure",
        description: "Create new salary structure for staff",
      },

      // ============ BONUS ROUTES ============
      "/bonus/list": {
        title: "Bonuses",
        description: "Manage staff bonuses and incentives",
      },
      "/bonus/create": {
        title: "Create Bonus",
        description: "Create new bonus for staff members",
      },
      "/bonus/approve": {
        title: "Approve Bonuses",
        description: "Review and approve pending bonuses",
      },
      "/bonus/incentive": {
        title: "Incentives",
        description: "Manage performance incentives",
      },

      // ============ TARGET ROUTES ============
      "/targets/list": {
        title: "Targets",
        description: "Manage staff performance targets",
      },
      "/targets/create": {
        title: "Set Target",
        description: "Set new performance targets for staff",
      },
      "/targets/achievement": {
        title: "Update Achievement",
        description: "Update target achievement status",
      },
      "/targets/reports": {
        title: "Target Reports",
        description: "View target achievement reports",
      },

      // ============ OVERTIME ROUTES ============
      "/overtime/list": {
        title: "Overtime Requests",
        description: "Manage staff overtime requests",
      },
      "/overtime/create": {
        title: "Create Overtime",
        description: "Create overtime request for staff",
      },
      "/overtime/approve": {
        title: "Approve Overtime",
        description: "Review and approve overtime requests",
      },

      // ============ LEAVE MANAGEMENT ROUTES ============
      "/leave/dashboard": {
        title: "Leave Dashboard",
        description: "Overview of leave statistics and requests",
      },
      "/staff/mark-leave": {
        title: "Mark Leave",
        description: "Mark leave for staff members",
      },
      "/staff/leave-history/": {
        title: "Leave History",
        description: "View staff leave history",
      },
      "/leave/summary": {
        title: "Leave Summary",
        description: "View leave summary reports",
      },
      "/leave/calendar": {
        title: "Leave Calendar",
        description: "View leave calendar for all staff",
      },
      "/leave/reports": {
        title: "Leave Reports",
        description: "Generate leave reports",
      },
      "/products": {
        title: "Products",
        description: "Manage your product inventory and pricing",
      },
      "/products/cylinder-types": {
        title: "Cylinder Types",
        description: "Manage different types of LPG cylinders",
      },
      "/products/cylinder-stock": {
        title: "Cylinder Stock",
        description: "Track and manage cylinder inventory levels",
      },
      "/products/stock-transactions": {
        title: "Stock Transactions",
        description: "View all stock movements and transaction history",
      },
      "/products/low-stock-alerts": {
        title: "Low Stock Alerts",
        description: "Monitor products that are running low on stock",
      },
      "/orders": {
        title: "Orders",
        description: "Track and manage customer orders",
      },
      "/orders/add": {
        title: "Create Order",
        description: "Create a new customer order",
      },
      "/expenses": {
        title: "Expenses",
        description: "Track and manage business expenses",
      },
      "/expenses/add": {
        title: "Add Expense",
        description: "Record a new business expense",
      },
      "/expenses/view/:id": {
        title: "View Expense",
        description: "View complete expense details and information",
      },
      "/inventory": {
        title: "Inventory",
        description: "Manage your product inventory across warehouses",
      },
      "/inventory/add": {
        title: "Add Inventory",
        description: "Add new products to your inventory",
      },
      "/invoices": {
        title: "Invoices",
        description: "Manage and track all your invoices",
      },
      "/invoices/create": {
        title: "Create Invoice",
        description: "Generate a new invoice for customers",
      },

      "/invoices/:id": {
        title: "Edit Invoice",
        description: "Modify existing invoice details",
      },
      "/reports": {
        title: "Reports Dashboard",
        description: "View comprehensive business analytics and reports",
      },
      "/reports/sales": {
        title: "Sales Report",
        description: "Analyze sales performance and trends",
      },
      "/reports/stock": {
        title: "Stock Report",
        description: "Monitor inventory levels and stock movements",
      },
      "/reports/financial": {
        title: "Financial Report",
        description: "View financial statements and summaries",
      },
      "/reports/customer": {
        title: "Customer Report",
        description: "Analyze customer data and purchasing patterns",
      },
      "/reports/dealer": {
        title: "Dealer Report",
        description: "Track dealer performance and metrics",
      },
      // Add this to your routes object in TopBar.js

      "/company-setting": {
        title: "Company Settings",
        description:
          "Manage your company configuration, branding, and tax information",
      },
      "/documents": {
        title: "Document Management",
        description: "Manage all business documents and files",
      },
      "/documents/customers": {
        title: "Customer Documents",
        description: "Manage customer-related documents",
      },
      "/documents/dealers": {
        title: "Dealer Documents",
        description: "Manage dealer-related documents",
      },
      "/documents/company": {
        title: "Company Documents",
        description: "Manage company policies and internal documents",
      },
      "/subscription": {
        title: "Subscription",
        description: "Manage your subscription plan and billing",
      },
      "/subscription/details": {
        title: "Subscription Details",
        description: "View your subscription plan details",
      },
      "/subscription/upgrade": {
        title: "Upgrade Subscription",
        description: "Upgrade to a higher subscription plan",
      },
      "/superadmin/User": {
        title: "User Management",
        description: "Manage system users and their access",
      },
      "/superadmin/user-roles": {
        title: "User Roles",
        description: "Define and manage user roles and permissions",
      },
      "/superadmin/countries": {
        title: "Countries",
        description: "Manage country master data",
      },
      "/superadmin/states": {
        title: "States",
        description: "Manage state master data",
      },
      "/superadmin/cities": {
        title: "Cities",
        description: "Manage city master data",
      },
      "/superadmin/pincodes": {
        title: "Pincodes",
        description: "Manage pincode master data",
      },
      "/superadmin/lpg-brands": {
        title: "LPG Brands",
        description: "Manage LPG cylinder brands",
      },
      "/superadmin/cylinder-types": {
        title: "Cylinder Types",
        description: "Manage cylinder type master data",
      },
      "/superadmin/cylinder-rates": {
        title: "Cylinder Rates",
        description: "Configure cylinder pricing and rates",
      },
      "/superadmin/subscription-plans": {
        title: "Subscription Plans",
        description: "Manage subscription plans for tenants",
      },
      "/superadmin/plan-features": {
        title: "Plan Features",
        description: "Configure features for each subscription plan",
      },
      "/superadmin/revenue-reports": {
        title: "Revenue Reports",
        description: "View platform revenue analytics",
      },
      "/superadmin/payment-history": {
        title: "Payment History",
        description: "Track all tenant payment transactions",
      },
      "/superadmin/invoice-overview": {
        title: "Invoice Overview",
        description: "View and manage all system invoices",
      },
      "/superadmin/tenant-growth": {
        title: "Tenant Growth",
        description: "Monitor tenant acquisition and growth metrics",
      },
      "/superadmin/revenue-analytics": {
        title: "Revenue Analytics",
        description: "Analyze revenue streams and trends",
      },
      "/superadmin/user-activity": {
        title: "User Activity",
        description: "Track user actions and system usage",
      },
      "/superadmin/system-health": {
        title: "System Health",
        description: "Monitor system performance and health metrics",
      },
      "/superadmin/general-settings": {
        title: "General Settings",
        description: "Configure system-wide general settings",
      },
      "/superadmin/email-configuration": {
        title: "Email Configuration",
        description: "Set up email servers and templates",
      },
      "/superadmin/backup-settings": {
        title: "Backup Settings",
        description: "Configure automated backup schedules",
      },
      "/superadmin/api-settings": {
        title: "API Settings",
        description: "Manage API keys and integrations",
      },
      "/superadmin/audit-logs": {
        title: "Audit Logs",
        description: "View system audit trail and security logs",
      },
      "/superadmin/login-history": {
        title: "Login History",
        description: "Track user login attempts and history",
      },
      "/superadmin/permission-management": {
        title: "Permission Management",
        description: "Configure granular access permissions",
      },
      "/superadmin/database-backup": {
        title: "Database Backup",
        description: "Manage database backup operations",
      },
      "/superadmin/restore-backup": {
        title: "Restore Backup",
        description: "Restore system from backup",
      },
      "/superadmin/system-maintenance": {
        title: "System Maintenance",
        description: "Perform system maintenance tasks",
      },
      "/superadmin/tenants": {
        title: "Tenant Management",
        description: "Manage all tenant organizations",
      },
      "/superadmin/tenants/create": {
        title: "Create Tenant",
        description: "Register a new tenant organization",
      },
      "/superadmin/tenant-subscriptions": {
        title: "Tenant Subscriptions",
        description: "Manage tenant subscription plans",
      },
    };

    if (routes[pathname]) return routes[pathname];

    // Handle dynamic routes
    if (pathname.match(/\/customers\/\d+$/)) {
      const id = pathname.split("/").pop();
      return {
        title: "Customer Details",
        description: `Viewing details for customer #${id}`,
      };
    }
    if (pathname.match(/\/customers\/edit\/\d+$/)) {
      const id = pathname.split("/").pop();
      return { title: "Edit Customer", description: `Editing customer #${id}` };
    }
    if (pathname.match(/\/dealers\/\d+$/)) {
      const id = pathname.split("/").pop();
      return {
        title: "Dealer Details",
        description: `Viewing details for dealer #${id}`,
      };
    }
    if (pathname.match(/\/dealers\/edit\/\d+$/)) {
      const id = pathname.split("/").pop();
      return { title: "Edit Dealer", description: `Editing dealer #${id}` };
    }
    if (pathname.match(/\/staffs\/edit\/\d+$/)) {
      const id = pathname.split("/").pop();
      return {
        title: "Edit Staff",
        description: `Editing staff member #${id}`,
      };
    }
    if (pathname.match(/\/staffs\/view\/\d+$/)) {
      const id = pathname.split("/").pop();
      return {
        title: "View Staff",
        description: `Viewing details for staff member #${id}`,
      };
    }
    if (pathname.match(/\/orders\/edit\/\d+$/)) {
      const id = pathname.split("/").pop();
      return { title: "Edit Order", description: `Editing order #${id}` };
    }
    if (pathname.match(/\/expenses\/edit\/\d+$/)) {
      const id = pathname.split("/").pop();
      return { title: "Edit Expense", description: `Editing expense #${id}` };
    }
    if (pathname.match(/\/inventory\/edit\/\d+$/)) {
      const id = pathname.split("/").pop();
      return {
        title: "Edit Inventory",
        description: `Editing inventory item #${id}`,
      };
    }
    if (pathname.match(/\/invoices\/edit\/\d+$/)) {
      const id = pathname.split("/").pop();
      return { title: "Edit Invoice", description: `Editing invoice #${id}` };
    }
    if (pathname.match(/\/superadmin\/tenants\/edit\/\d+$/)) {
      const id = pathname.split("/").pop();
      return { title: "Edit Tenant", description: `Editing tenant #${id}` };
    }

    return {
      title: "Dashboard",
      description: "Overview of your business performance",
    };
  };

  // Load user data from localStorage
  const loadUserData = () => {
    try {
      const role = localStorage.getItem("role");
      const userName = localStorage.getItem("userName");
      const userEmail = localStorage.getItem("userEmail");
      const userData = localStorage.getItem("user");

      let userNameDisplay = "User";
      let userEmailDisplay = "";
      let userRole = role || "user";

      // Try to get from user object first
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          userNameDisplay =
            parsedUser.name ||
            parsedUser.full_name ||
            parsedUser.username ||
            userName ||
            "User";
          userEmailDisplay = parsedUser.email || userEmail || "";
          userRole = parsedUser.role || parsedUser.user_type || role || "user";
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }

      // Fallback to individual localStorage items
      if (!userNameDisplay || userNameDisplay === "User") {
        userNameDisplay = userName || "User";
      }

      if (!userEmailDisplay) {
        userEmailDisplay = userEmail || "";
      }

      // Format role for display
      let displayRole = "";
      if (userRole === "superadmin" || userRole === "super_admin") {
        displayRole = "Super Administrator";
      } else if (userRole === "admin") {
        displayRole = "Administrator";
      } else if (userRole === "staff") {
        displayRole = "Staff Member";
      } else if (userRole === "dealer") {
        displayRole = "Dealer";
      } else {
        displayRole = userRole || "User";
      }

      setUser({
        name: userNameDisplay,
        email: userEmailDisplay,
        role: userRole,
        displayRole: displayRole,
      });

      console.log("User loaded:", { name: userNameDisplay, role: displayRole });
    } catch (error) {
      console.error("Error loading user data:", error);
      setUser({
        name: "User",
        email: "",
        role: "user",
        displayRole: "User",
      });
    }
  };

  useEffect(() => {
    loadUserData();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === "user" || e.key === "userName" || e.key === "role") {
        loadUserData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Update page info when route changes
  useEffect(() => {
    const info = getPageInfo(location.pathname);
    setPageInfo(info);
    document.title = `${info.title} - GST Billing System`;
  }, [location.pathname]);

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
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userType");
    localStorage.removeItem("subdomain");
    localStorage.removeItem("tenant");
    localStorage.removeItem("businessId");
    localStorage.removeItem("businessName");

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

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      console.log("Searching for:", searchTerm);
    }
  };

  const getInitial = () => {
    if (user.name && user.name.length > 0) {
      return user.name.charAt(0).toUpperCase();
    }
    return "U";
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
            style={{ color: "#1e293b" }}
          >
            <FaBars size={20} />
          </button>

          <div className="navbar-title">
            <h4>{pageInfo.title}</h4>
            <p>{pageInfo.description}</p>
          </div>

          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search invoices, customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearch}
            />
          </div>
        </div>

        <div className="navbar-right">
          <div className="notification-icon">
            <FaBell size={20} />
            <span className="notification-badge">3</span>
          </div>

          <div className="user-profile" ref={userMenuRef}>
            <div
              className="user-profile-clickable"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar-nav">{getInitial()}</div>
              <div className="user-info-nav">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.displayRole}</div>
              </div>
            </div>

            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="dropdown-user-info">
                  <div className="dropdown-user-avatar">{getInitial()}</div>
                  <div className="dropdown-user-details">
                    <div className="dropdown-user-name">{user.name}</div>
                    <div className="dropdown-user-role">{user.displayRole}</div>
                    {user.email && (
                      <div className="dropdown-user-email">{user.email}</div>
                    )}
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                <div className="dropdown-item" onClick={handleMyProfile}>
                  <FaUser className="dropdown-icon" />
                  <span>My Profile</span>
                </div>

                <div className="dropdown-item" onClick={handleChangePassword}>
                  <FaKey className="dropdown-icon" />
                  <span>Change Password</span>
                </div>

                <div className="dropdown-divider"></div>

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
        .main-navbar {
          background: white;
          padding: 0px 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .navbar-left {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
        }
        
        .navbar-title h4 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }
        
        .navbar-title p {
          margin: 0;
          font-size: 0.75rem;
          color: #64748b;
        }
        
        .search-wrapper {
          position: relative;
          margin-left: auto;
        }
        
        .search-wrapper input {
          padding-left: 35px;
          padding-right: 10px;
          height: 40px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          width: 300px;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .search-wrapper input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        
        .search-wrapper .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .notification-icon {
          position: relative;
          cursor: pointer;
          padding: 8px;
          color: #64748b;
          transition: color 0.2s;
        }
        
        .notification-icon:hover {
          color: #3b82f6;
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
          background-color: #f8fafc;
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
        
        .user-menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 10px;
          min-width: 280px;
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
        
        .dropdown-user-email {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 4px;
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
        
        @media (max-width: 768px) {
          .main-navbar {
            padding: 12px 16px;
          }
          
          .user-info-nav {
            display: none;
          }
          
          .user-profile-clickable {
            padding: 5px;
          }
          
          .search-wrapper input {
            width: 150px;
          }
          
          .navbar-title h4 {
            font-size: 1rem;
          }
          
          .navbar-title p {
            display: none;
          }
          
          .user-menu-dropdown {
            min-width: 260px;
            right: -10px;
          }
        }
      `}</style>
    </nav>
  );
};

export default TopBar;
