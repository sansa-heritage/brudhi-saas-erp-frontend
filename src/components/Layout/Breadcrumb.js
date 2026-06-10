// components/Layout/Breadcrumb.js
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaChevronRight,
  FaUser,
  FaBox,
  FaFile,
  FaChartLine,
} from "react-icons/fa";

const Breadcrumb = () => {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Complete breadcrumb mapping for all routes
  const getBreadcrumbLabel = (path, params = {}) => {
    const labels = {
      "/dashboard": "Dashboard",
      "/profile": "My Profile",
      "/change-password": "Change Password",

      // Customer routes
      "/customers": "Customers",
      "/customers/add": "Add Customer",

      // Dealer routes
      "/dealers": "Dealers",
      "/dealers/add": "Add Dealer",

      // Staff routes
      "/staffs": "Staff Management",
      "/staffs/add": "Add Staff",
      "/staffs/roles": "Role Permissions",

      // Product routes
      "/products": "Products",
      "/products/cylinder-types": "Cylinder Types",
      "/products/cylinder-stock": "Cylinder Stock",
      "/products/stock-transactions": "Stock Transactions",
      "/products/low-stock-alerts": "Low Stock Alerts",

      // Order routes
      "/orders": "Orders",
      "/orders/add": "Create Order",

      // Expense routes
      "/expenses": "Expenses",
      "/expenses/add": "Add Expense",
      "/expenses/view/:id": "View Expense",
      "/expenses/edit/:id": "Edit Expense",

      // Inventory routes
      "/inventory": "Inventory",
      "/inventory/add": "Add Inventory",

      // Invoice routes
      "/invoices": "Invoices",
      "/invoices/create": "Create Invoice",
      "/invoices/:id": "Edit Invoice",

      // Report routes
      "/reports": "Reports",
      "/reports/sales": "Sales Report",
      "/reports/stock": "Stock Report",
      "/reports/financial": "Financial Report",
      "/reports/customer": "Customer Report",
      "/reports/dealer": "Dealer Report",

      // Document routes
      "/documents": "Documents",
      "/documents/customers": "Customer Documents",
      "/documents/dealers": "Dealer Documents",
      "/documents/company": "Company Documents",

      // Subscription routes
      "/subscription": "Subscription",
      "/subscription/details": "Subscription Details",
      "/subscription/upgrade": "Upgrade Subscription",

      // Company Settings
      "/company-setting": "Company Settings",

      // ============ PAYROLL ROUTES ============
      "/staff/payroll": "Payroll List",
      "/payroll/generate": "Generate Payroll",
      "/staff/payroll/:id": "Payroll Details",
      "/payslip": "Download Payslip",

      // ============ SALARY STRUCTURE ROUTES ============
      "/staff/salary-structure": "Salary Structure",
      "/salary-structure/add": "Create Salary Structure",

      // ============ BONUS ROUTES ============
      "/staff/bonuses": "Bonuses",
      "/staff/bonuses/add": "Add Bonus",

      // ============ TARGET ROUTES ============
      "/staff/targets": "Targets",
      "/staff/targets/add": "Add Target",

      // ============ OVERTIME ROUTES ============
      "/staff/overtime": "Overtime Requests",
      "/staff/overtime/add": "Add Overtime",

      // ============ LEAVE MANAGEMENT ROUTES ============
      "/staff/mark-leave": "Mark Leave",
      "/staff/leave-history": "Leave History",
      "/leave/summary": "Leave Summary",

      // Super Admin routes
      "/superadmin/User": "User Management",
      "/superadmin/user-roles": "User Roles",
      "/superadmin/countries": "Countries",
      "/superadmin/states": "States",
      "/superadmin/cities": "Cities",
      "/superadmin/pincodes": "Pincodes",
      "/superadmin/lpg-brands": "LPG Brands",
      "/superadmin/cylinder-types": "Cylinder Types",
      "/superadmin/cylinder-rates": "Cylinder Rates",
      "/superadmin/subscription-plans": "Subscription Plans",
      "/superadmin/plan-features": "Plan Features",
      "/superadmin/revenue-reports": "Revenue Reports",
      "/superadmin/payment-history": "Payment History",
      "/superadmin/invoice-overview": "Invoice Overview",
      "/superadmin/tenant-growth": "Tenant Growth",
      "/superadmin/revenue-analytics": "Revenue Analytics",
      "/superadmin/user-activity": "User Activity",
      "/superadmin/system-health": "System Health",
      "/superadmin/general-settings": "General Settings",
      "/superadmin/email-configuration": "Email Configuration",
      "/superadmin/backup-settings": "Backup Settings",
      "/superadmin/api-settings": "API Settings",
      "/superadmin/audit-logs": "Audit Logs",
      "/superadmin/login-history": "Login History",
      "/superadmin/permission-management": "Permission Management",
      "/superadmin/database-backup": "Database Backup",
      "/superadmin/restore-backup": "Restore Backup",
      "/superadmin/system-maintenance": "System Maintenance",
      "/superadmin/tenants": "Tenants",
      "/superadmin/tenants/create": "Create Tenant",
      "/superadmin/tenant-subscriptions": "Tenant Subscriptions",
    };

    return labels[path] || path.split("/").pop();
  };

  const getIconForPath = (path) => {
    if (path === "/dashboard") return <FaHome size={14} />;
    if (path === "/customers") return <FaUser size={12} />;
    if (path === "/products") return <FaBox size={12} />;
    if (path === "/invoices") return <FaFile size={12} />;
    if (path === "/reports") return <FaChartLine size={12} />;
    return null;
  };

  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    const breadcrumbsArray = [];

    // Always add Home as first breadcrumb
    breadcrumbsArray.push({
      label: "Home",
      path: "/dashboard",
      icon: <FaHome size={14} />,
    });

    // Build breadcrumbs progressively
    let accumulatedPath = "";

    for (let i = 0; i < pathnames.length; i++) {
      const segment = pathnames[i];
      const previousPath = accumulatedPath;
      accumulatedPath += `/${segment}`;

      // Skip ID segments and 'edit'/'view' when building intermediate breadcrumbs
      const isId = /^\d+$/.test(segment);
      const isEdit = segment === "edit";
      const isView = segment === "view";

      // Skip ID and action words in the middle of path
      if ((isId || isEdit || isView) && i < pathnames.length - 1) {
        continue;
      }

      let label = getBreadcrumbLabel(accumulatedPath);
      let isLast = i === pathnames.length - 1;

      // Handle dynamic segments at the end
      if (isId && isLast) {
        const parentPath = previousPath;
        const parentLabel = getBreadcrumbLabel(parentPath);

        if (accumulatedPath.includes("/edit/")) {
          label = `Edit ${parentLabel.slice(0, -1)}`;
        } else if (accumulatedPath.includes("/view/")) {
          label = `View ${parentLabel.slice(0, -1)}`;
        } else {
          // Get the entity name from parent path
          const entityName = parentLabel.slice(0, -1);
          label = `${entityName} Details`;
        }
      }

      // Handle edit/view as last segment
      if ((isEdit || isView) && isLast) {
        const parentPath = previousPath;
        const parentLabel = getBreadcrumbLabel(parentPath);
        label = isEdit ? `Edit ${parentLabel}` : `View ${parentLabel}`;
      }

      // Add icon for specific paths
      const icon = getIconForPath(accumulatedPath);

      breadcrumbsArray.push({
        label: label,
        path: accumulatedPath,
        isLast: isLast,
        icon: icon,
      });
    }

    // Remove duplicate consecutive breadcrumbs with same path
    const uniqueBreadcrumbs = breadcrumbsArray.filter(
      (crumb, index, self) =>
        index === 0 || crumb.path !== self[index - 1].path,
    );

    setBreadcrumbs(uniqueBreadcrumbs);
  };

  useEffect(() => {
    generateBreadcrumbs();
  }, [location.pathname]);

  // Don't show breadcrumb on dashboard or if only home exists
  if (breadcrumbs.length <= 1 || location.pathname === "/dashboard") {
    return null;
  }

  return (
    <nav aria-label="breadcrumb" className="dynamic-breadcrumb">
      <ol className="breadcrumb mb-0">
        {breadcrumbs.map((crumb, index) => (
          <li
            key={index}
            className={`breadcrumb-item ${crumb.isLast ? "active" : ""}`}
          >
            {crumb.isLast ? (
              <span className="d-flex align-items-center gap-1">
                {crumb.icon && <span className="me-1">{crumb.icon}</span>}
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.path} className="d-flex align-items-center gap-1">
                {crumb.icon && <span className="me-1">{crumb.icon}</span>}
                {crumb.label}
              </Link>
            )}
            {!crumb.isLast && index < breadcrumbs.length - 1 && (
              <FaChevronRight size={10} className="mx-2 text-muted" />
            )}
          </li>
        ))}
      </ol>

      <style>{`
        .dynamic-breadcrumb {
          padding: 12px 0;
          margin-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
          background: transparent;
        }
        
        .dynamic-breadcrumb .breadcrumb {
          background: transparent;
          padding: 0;
          margin: 0;
          list-style: none;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
        }
        
        /* Remove default slash separator */
        .dynamic-breadcrumb .breadcrumb-item + .breadcrumb-item::before {
          content: "";
          display: none;
        }
        
        .dynamic-breadcrumb .breadcrumb-item {
          display: inline-flex;
          align-items: center;
          font-size: 13px;
        }
        
        .dynamic-breadcrumb .breadcrumb-item a {
          color: #3b82f6;
          text-decoration: none;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .dynamic-breadcrumb .breadcrumb-item a:hover {
          color: #1d4ed8;
          text-decoration: underline;
          transform: translateX(2px);
        }
        
        .dynamic-breadcrumb .breadcrumb-item.active {
          color: #64748b;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        /* Ensure arrow icon spacing */
        .dynamic-breadcrumb .breadcrumb-item .mx-2 {
          margin-left: 8px;
          margin-right: 8px;
        }
        
        /* Animation for breadcrumb items */
        .dynamic-breadcrumb .breadcrumb-item {
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-5px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @media (max-width: 768px) {
          .dynamic-breadcrumb {
            padding: 8px 0;
            margin-bottom: 12px;
          }
          
          .dynamic-breadcrumb .breadcrumb-item {
            font-size: 11px;
          }
          
          .dynamic-breadcrumb .breadcrumb-item a:hover {
            transform: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Breadcrumb;
