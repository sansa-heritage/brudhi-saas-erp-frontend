import React, { useState, useEffect } from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import {
  FaTachometerAlt,
  FaUsers,
  FaUserCog,
  FaUserTie,
  FaBoxes,
  FaFileInvoice,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaUserCircle,
  FaBuilding,
  FaUserShield,
  FaList,
  FaFileContract,
  FaDatabase,
  FaMapMarkerAlt,
  FaGasPump,
  FaTags,
  FaWallet,
  FaChartLine,
  FaHistory,
  FaFileInvoiceDollar,
  FaChartBar,
  FaUserClock,
  FaHeartbeat,
  FaCogs,
  FaSlidersH,
  FaEnvelope,
  FaPlug,
  FaShieldAlt,
  FaClipboardList,
  FaUserLock,
  FaTools,
  FaRedoAlt,
  FaWrench,
  FaGlobe,
  FaCity,
  FaMailBulk,
  FaTrademark,
  FaCubes,
  FaMoneyCheckAlt,
  FaStar,
  FaUserFriends,
  FaCreditCard,
  FaFileAlt,
  FaFolderOpen,
  FaCrown,
  FaLayerGroup,
  FaShoppingCart,
  FaReceipt,
  FaFilePdf,
  FaDownload,
  FaPlusCircle,
  FaEdit,
  FaEye,
  FaGift,
  FaCheckCircle,
  FaAward,
  FaTrophy,
  FaUser,
} from "react-icons/fa";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState({});

  const toggleMenu = (key) => {
    setOpenMenu((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ✅ Get role
  const role = localStorage.getItem("role");

  // ✅ Check if any child path is active (recursive)
  const isChildActive = (children) => {
    if (!children) return false;

    for (let child of children) {
      if (child.path && location.pathname === child.path) {
        return true;
      }
      if (child.children && isChildActive(child.children)) {
        return true;
      }
    }
    return false;
  };

  // ✅ Auto open dropdowns when inside any child route
  useEffect(() => {
    if (role === "superadmin") {
      const newOpenState = {};

      const checkAndOpen = (items, parentKey = "") => {
        items.forEach((item, index) => {
          const key = parentKey ? `${parentKey}-${index}` : `${index}`;

          if (item.children && isChildActive(item.children)) {
            newOpenState[key] = true;
            checkAndOpen(item.children, key);
          }
        });
      };

      checkAndOpen(superAdminMenu);
      setOpenMenu((prev) => ({ ...prev, ...newOpenState }));
    }
  }, [location.pathname, role]);

  // ✅ Recursive component to render menu items with any level of nesting
  const renderMenuItem = (item, index, parentKey = "") => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.path ? location.pathname === item.path : false;
    const isParentActive = hasChildren && isChildActive(item.children);

    const menuKey = parentKey ? `${parentKey}-${index}` : `${index}`;
    const isOpen = openMenu[menuKey] || false;

    // For leaf nodes (no children)
    if (!hasChildren) {
      return (
        <Nav.Link
          key={menuKey}
          as={Link}
          to={item.path}
          className={`d-flex align-items-center gap-2 ${
            location.pathname === item.path ? "active" : ""
          }`}
          style={{
            padding:
              parentKey.split("-").length === 2 ? "6px 10px" : "8px 12px",
            fontSize: parentKey.split("-").length === 2 ? "0.85rem" : "0.9rem",
            marginLeft: parentKey.split("-").length === 2 ? "0" : "0",
          }}
        >
          {item.icon && <span style={{ minWidth: "1.2rem" }}>{item.icon}</span>}
          <span>{item.name}</span>
        </Nav.Link>
      );
    }

    // For parent nodes (with children)
    return (
      <div key={menuKey}>
        <div
          className={`d-flex justify-content-between align-items-center sidebar-item ${
            isParentActive ? "parent-active" : ""
          }`}
          onClick={() => toggleMenu(menuKey)}
          style={{
            cursor: "pointer",
            padding: parentKey.split("-").length === 2 ? "8px 12px" : "10px",
            fontSize: parentKey.split("-").length === 2 ? "0.85rem" : "0.9rem",
          }}
        >
          <div className="d-flex align-items-center gap-2">
            {item.icon && (
              <span style={{ minWidth: "1.2rem" }}>{item.icon}</span>
            )}
            <span>{item.name}</span>
          </div>
          <span style={{ fontSize: "0.7rem" }}>{isOpen ? "▲" : "▼"}</span>
        </div>

        {isOpen && (
          <div className={parentKey.split("-").length === 2 ? "ms-4" : "ms-3"}>
            {item.children.map((child, childIndex) =>
              renderMenuItem(child, childIndex, menuKey),
            )}
          </div>
        )}
      </div>
    );
  };

  // ✅ Admin Menu with Masters, Transactions, and Documents submenus
  const adminMenu = [
    // Dashboard
    { path: "/dashboard", name: "Dashboard", icon: <FaTachometerAlt /> },

    // Masters Menu
    {
      name: "Master",
      icon: <FaLayerGroup />,
      children: [
        { path: "/customers", name: "Customers", icon: <FaUsers /> },
        { path: "/dealers", name: "Dealers", icon: <FaUserTie /> },
        {
          name: "Staff",
          icon: <FaUserFriends />,
          children: [
            { path: "/staffs", name: "Employee", icon: <FaUser /> },
            {
              path: "/staff/payroll",
              name: "Payroll",
              icon: <FaMoneyBillWave />,
            },
            { path: "/staff/bonuses", name: "Bonus", icon: <FaGift /> },
          ],
        },
      ],
    },

    // Transactions Menu with Orders, Inventory, Invoices, Expenses
    {
      name: "Transactions",
      icon: <FaReceipt />,
      children: [
        { path: "/orders", name: "Orders", icon: <FaShoppingCart /> },
        { path: "/inventory", name: "Inventory", icon: <FaBoxes /> },
        { path: "/invoices", name: "Invoices", icon: <FaFileInvoice /> },
        { path: "/expenses", name: "Expenses", icon: <FaMoneyBillWave /> },
      ],
    },

    // Reports
    { path: "/reports", name: "Reports", icon: <FaChartLine /> },

    {
      path: "/company-setting",
      name: "Company Setting",
      icon: <FaCogs />,
    },
  ];

  // ✅ Super Admin Menu (with similar structure)
  const superAdminMenu = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <FaTachometerAlt />,
    },
    // Masters / Data Management
    {
      name: "Master Data",
      icon: <FaDatabase />,
      children: [
        {
          name: "Location Management",
          icon: <FaMapMarkerAlt />,
          children: [
            {
              path: "/superadmin/countries",
              name: "Countries",
              icon: <FaGlobe />,
            },
            {
              path: "/superadmin/states",
              name: "States",
              icon: <FaMapMarkerAlt />,
            },
            { path: "/superadmin/cities", name: "Cities", icon: <FaCity /> },
            {
              path: "/superadmin/pincodes",
              name: "Pincodes",
              icon: <FaMailBulk />,
            },
          ],
        },
        {
          name: "LPG Management",
          icon: <FaGasPump />,
          children: [
            {
              path: "/superadmin/lpg-brands",
              name: "Brands",
              icon: <FaTrademark />,
            },
            {
              path: "/superadmin/cylinder-types",
              name: "Cylinder Types",
              icon: <FaCubes />,
            },
            {
              path: "/superadmin/cylinder-rates",
              name: "Cylinder Rates",
              icon: <FaMoneyCheckAlt />,
            },
          ],
        },
        {
          name: "Plans & Pricing",
          icon: <FaTags />,
          children: [
            {
              path: "/superadmin/subscription-plans",
              name: "Subscription Plans",
              icon: <FaFileContract />,
            },
            {
              path: "/superadmin/plan-features",
              name: "Plan Features",
              icon: <FaStar />,
            },
          ],
        },
      ],
    },
    // Tenant Management
    {
      name: "Tenant Management",
      icon: <FaBuilding />,
      children: [
        {
          path: "/superadmin/tenants",
          name: "Manage Tenants",
          icon: <FaList />,
        },
        {
          path: "/superadmin/tenant-subscriptions",
          name: "Tenant Subscriptions",
          icon: <FaFileContract />,
        },
      ],
    },
    // User Management
    {
      name: "User Management",
      icon: <FaUserCog />,
      children: [
        { path: "/superadmin/User", name: "Manage Users", icon: <FaUsers /> },
        {
          path: "/superadmin/user-roles",
          name: "User Role",
          icon: <FaUserShield />,
        },
      ],
    },
    // Financial Management
    {
      name: "Financial Management",
      icon: <FaWallet />,
      children: [
        {
          path: "/superadmin/revenue-reports",
          name: "Revenue Reports",
          icon: <FaChartLine />,
        },
        {
          path: "/superadmin/payment-history",
          name: "Payment History",
          icon: <FaHistory />,
        },
        {
          path: "/superadmin/invoice-overview",
          name: "Invoice Overview",
          icon: <FaFileInvoiceDollar />,
        },
      ],
    },
    // Reports & Analytics
    {
      name: "Reports & Analytics",
      icon: <FaChartBar />,
      children: [
        {
          path: "/superadmin/tenant-growth",
          name: "Tenant Growth",
          icon: <FaUsers />,
        },
        {
          path: "/superadmin/revenue-analytics",
          name: "Revenue Analytics",
          icon: <FaChartLine />,
        },
        {
          path: "/superadmin/user-activity",
          name: "User Activity",
          icon: <FaUserClock />,
        },
        {
          path: "/superadmin/system-health",
          name: "System Health",
          icon: <FaHeartbeat />,
        },
      ],
    },
    // System Settings
    {
      name: "System Settings",
      icon: <FaCogs />,
      children: [
        {
          path: "/superadmin/general-settings",
          name: "General Settings",
          icon: <FaSlidersH />,
        },
        {
          path: "/superadmin/email-configuration",
          name: "Email Configuration",
          icon: <FaEnvelope />,
        },
        {
          path: "/superadmin/backup-settings",
          name: "Backup Settings",
          icon: <FaDatabase />,
        },
        {
          path: "/superadmin/api-settings",
          name: "API Settings",
          icon: <FaPlug />,
        },
      ],
    },
    // Security
    {
      name: "Security",
      icon: <FaShieldAlt />,
      children: [
        {
          path: "/superadmin/audit-logs",
          name: "Audit Logs",
          icon: <FaClipboardList />,
        },
        {
          path: "/superadmin/login-history",
          name: "Login History",
          icon: <FaHistory />,
        },
        {
          path: "/superadmin/permission-management",
          name: "Permission Management",
          icon: <FaUserLock />,
        },
      ],
    },
    // Backup & Maintenance
    {
      name: "Backup & Maintenance",
      icon: <FaTools />,
      children: [
        {
          path: "/superadmin/database-backup",
          name: "Database Backup",
          icon: <FaDatabase />,
        },
        {
          path: "/superadmin/restore-backup",
          name: "Restore Backup",
          icon: <FaRedoAlt />,
        },
        {
          path: "/superadmin/system-maintenance",
          name: "System Maintenance",
          icon: <FaWrench />,
        },
      ],
    },
  ];

  const menuItems = role === "superadmin" ? superAdminMenu : adminMenu;

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, logout!",
      cancelButtonText: "Cancel",
      background: "#fff",
      backdrop: true,
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Show loading toast
          const loadingToast = toast.loading("Logging out...", {
            position: "top-right",
            theme: "colored",
          });

          // Simulate logout process (you can add API call here)
          setTimeout(() => {
            // Clear localStorage
            localStorage.removeItem("isAuthenticated");
            localStorage.removeItem("role");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("userType");
            localStorage.removeItem("subdomain");
            localStorage.removeItem("tenant");

            // Update toast to success
            toast.update(loadingToast, {
              render: "Logged out successfully!",
              type: "success",
              isLoading: false,
              autoClose: 2000,
              transition: Bounce,
            });

            // Navigate to login after toast
            setTimeout(() => {
              navigate("/login");
            }, 1500);
          }, 1000);
        } catch (error) {
          console.error("Logout error:", error);
          toast.error("Failed to logout. Please try again.", {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
            transition: Bounce,
          });
        }
      }
    });
  };

  return (
    <div className="sidebar d-flex flex-column">
      {/* Toast Container */}
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

      {/* Header */}
      <div className="sidebar-header text-center">
        <h3>{role === "superadmin" ? "👑 Super Admin" : "💰 GST Billing"}</h3>
        <p>
          {role === "superadmin" ? "System Control Panel" : "Invoice Manager"}
        </p>
      </div>

      {/* Menu */}
      <Nav className="flex-column px-3 mt-3">
        {menuItems.map((item, index) => renderMenuItem(item, index))}
      </Nav>

      {/* Footer */}
      <div className="mt-auto">
        <div className="user-info d-flex align-items-center gap-3">
          <FaUserCircle size={24} />
          <div>
            <div className="fw-bold" style={{ fontSize: "0.85rem" }}>
              {role === "superadmin" ? "Super Admin" : "Admin User"}
            </div>
            <small style={{ fontSize: "0.7rem", opacity: 0.7 }}>
              {role === "superadmin" ? "Full Access" : "Administrator"}
            </small>
          </div>
        </div>

        <Nav.Link
          onClick={handleLogout}
          className="logout-btn d-flex align-items-center mx-3 mb-3"
        >
          <FaSignOutAlt className="me-2" />
          <span>Sign Out</span>
        </Nav.Link>
      </div>
    </div>
  );
};

export default Sidebar;
