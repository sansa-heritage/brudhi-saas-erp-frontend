import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Sidebar from "./components/Layout/Sidebar";
import TopBar from "./components/Layout/TopBar";
import "./index.css";
import CylinderStock from "./pages/products/CylinderStock";
import StockTransactions from "./pages/products/StockTransactions";
import LowStockAlerts from "./pages/products/LowStockAlerts";
import ReportsDashboard from "./pages/reports/index";
import SalesReport from "./pages/reports/SalesReport";
import StockReport from "./pages/reports/StockReport";
import FinancialReport from "./pages/reports/FinancialReport";
import CustomerReport from "./pages/reports/CustomerReport";
import DealerReport from "./pages/reports/DealerReport";
import Users from "./pages/superadmin/User Management/Manage Users/Users";
import Roles from "./pages/superadmin/User Management/User Role/Roles";
import Countries from "./pages/superadmin/Master Data Management/Location Management/Countries/Countries";
import States from "./pages/superadmin/Master Data Management/Location Management/States/States";
import Cities from "./pages/superadmin/Master Data Management/Location Management/Cities/Cities";
import Pincodes from "./pages/superadmin/Master Data Management/Location Management/Pincodes/Pincodes";
import Brands from "./pages/superadmin/Master Data Management/LPG Management/Brands/Brands";
import CylinderRates from "./pages/superadmin/Master Data Management/LPG Management/Cylinder Rates/CylinderRates";
import CylinderTypes from "./pages/superadmin/Master Data Management/LPG Management/Cylinder Types/CylinderTypes";
import SubscriptionPlans from "./pages/superadmin/Master Data Management/Plans & Pricing/Subscription Plans/SubscriptionPlans";
import Plans from "./pages/superadmin/Master Data Management/Plans & Pricing/Plan Features/Plans";
import RevenueReports from "./pages/superadmin/Financial Management/Revenue Reports/RevenueReports";
import PaymentHistory from "./pages/superadmin/Financial Management/Payment History/PaymentHistory";
import InvoiceOverview from "./pages/superadmin/Financial Management/Invoice Overview/InvoiceOverview";
import TenantGrowth from "./pages/superadmin/Reports Analytics/Tenant Growth/TenantGrowth";
import RevenueAnalytics from "./pages/superadmin/Reports Analytics/Revenue Analytics/RevenueAnalytics";
import UserActivity from "./pages/superadmin/Reports Analytics/User Activity/UserActivity";
import SystemHealth from "./pages/superadmin/Reports Analytics/System Health/SystemHealth";
import GeneralSettings from "./pages/superadmin/System Settings/General Settings/GeneralSettings";
import EmailConfig from "./pages/superadmin/System Settings/Email Configuration/EmailConfig";
import BackupSettings from "./pages/superadmin/System Settings/Backup Settings/BackupSettings";
import ApiSettings from "./pages/superadmin/System Settings/API Settings/ApiSettings";
import AuditLogs from "./pages/superadmin/Security/Audit Logs/AuditLogs";
import LoginHistory from "./pages/superadmin/Security/Login History/LoginHistory";
import Permissions from "./pages/superadmin/Security/Permission Management/Permissions";
import DatabaseBackup from "./pages/superadmin/Backup & Maintenance/Database Backup/DatabaseBackup";
import RestoreBackup from "./pages/superadmin/Backup & Maintenance/Restore Backup/RestoreBackup";
import SystemMaintenance from "./pages/superadmin/Backup & Maintenance/System Maintenance/SystemMaintenance";
import StaffManagement from "./pages/staff/StaffManagement";
import AddStaff from "./pages/staff/AddStaff";
import EditStaff from "./pages/staff/EditStaff"; // Add this - Make sure file exists
import ViewStaff from "./pages/staff/ViewStaff"; // Add this - Make sure file exists
import RolePermissions from "./pages/staff/RolePermissions";

// Document Management Imports
import DocumentManagement from "./pages/documents/DocumentManagement";
import CustomerDocuments from "./pages/documents/CustomerDocuments";
import DealerDocuments from "./pages/documents/DealerDocuments";
import CompanyDocuments from "./pages/documents/CompanyDocuments";
import CustomerDocumentView from "./pages/documents/CustomerDocumentView";
import DealerDocumentView from "./pages/documents/DealerDocumentView";
import Subscription from "./pages/subscription/subscription";
import UpgradeSubscription from "./pages/subscription/UpgradeSubscription";
import SubscriptionDetails from "./pages/subscription/SubscriptionDetails";
import Customers from "./pages/customers/Customers";
import CustomerDetails from "./pages/customers/CustomerDetails";
import AddCustomer from "./pages/customers/AddCustomer";
import EditCustomer from "./pages/customers/EditCustomer";
import Dealers from "./pages/dealers/Dealers";
import DealerDetails from "./pages/dealers/DealerDetails";
import AddDealer from "./pages/dealers/AddDealer";
import EditDealer from "./pages/dealers/EditDealer";
import Tenants from "./pages/superadmin/ManageTenant/Tenants";
import TenantForm from "./pages/superadmin/ManageTenant/TenantForm";
import Expenses from "./pages/expenses/ExpensesList";
import AddExpense from "./pages/expenses/AddExpense";
import EditExpense from "./pages/expenses/EditExpense.js";
import InventoryList from "./pages/inventory/InventoryList.js";
import AddInventory from "./pages/inventory/AddInventory.js";
import EditInventory from "./pages/inventory/EditInventory.js";
import Orders from "./pages/orders/Orders.js";
import AddOrder from "./pages/orders/AddOrder.js";
import EditOrder from "./pages/orders/EditOrder.js";
import Invoices from "./pages/invoices/Invoices.js";
// import CreateInvoice from "./pages/invoices/CreateInvoice.js";
import TenantSubscription from "./pages/superadmin/ManageTenant/TenantSubscription.js";
import ProfileManagement from "./pages/ProfileManagement.js";
import ChangePassword from "./components/Profile/ChangePassword.js";
import AddInvoice from "./pages/invoices/AddInvoice.js";
import EditInvoice from "./pages/invoices/EditInvoice.js";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      <Sidebar />
      <div className="main-content">
        <TopBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <ProfileManagement />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <Layout>
                <ChangePassword />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Layout>
                <Customers />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <CustomerDetails />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditCustomer />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/add"
          element={
            <ProtectedRoute>
              <Layout>
                <AddCustomer />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dealers"
          element={
            <ProtectedRoute>
              <Layout>
                <Dealers />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dealers/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <DealerDetails />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dealers/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditDealer />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dealers/add"
          element={
            <ProtectedRoute>
              <Layout>
                <AddDealer />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/staffs"
          element={
            <ProtectedRoute>
              <Layout>
                <StaffManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staffs/add"
          element={
            <ProtectedRoute>
              <Layout>
                <AddStaff />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staffs/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditStaff />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staffs/view/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ViewStaff />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staffs/roles"
          element={
            <ProtectedRoute>
              <Layout>
                <RolePermissions />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/cylinder-types"
          element={
            <ProtectedRoute>
              <Layout>
                <CylinderTypes />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/cylinder-stock"
          element={
            <ProtectedRoute>
              <Layout>
                <CylinderStock />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/stock-transactions"
          element={
            <ProtectedRoute>
              <Layout>
                <StockTransactions />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/low-stock-alerts"
          element={
            <ProtectedRoute>
              <Layout>
                <LowStockAlerts />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Layout>
                <Orders />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/add"
          element={
            <ProtectedRoute>
              <Layout>
                <AddOrder />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditOrder />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Layout>
                <Expenses />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses/add"
          element={
            <ProtectedRoute>
              <Layout>
                <AddExpense />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditExpense />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Inventory Routes */}
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Layout>
                <InventoryList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/add"
          element={
            <ProtectedRoute>
              <Layout>
                <AddInventory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditInventory />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <Layout>
                <Invoices />
              </Layout>
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <Layout>
                <Invoices />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/create"
          element={
            <ProtectedRoute>
              <Layout>
                <AddInvoice />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Edit Invoice Page */}
        <Route
          path="/invoices/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditInvoice />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/invoices/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateInvoice />
              </Layout>
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <ReportsDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/sales"
          element={
            <ProtectedRoute>
              <Layout>
                <SalesReport />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* stock */}
        <Route
          path="/reports/stock"
          element={
            <ProtectedRoute>
              <Layout>
                <StockReport />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* financial */}
        <Route
          path="/reports/financial"
          element={
            <ProtectedRoute>
              <Layout>
                <FinancialReport />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* customer */}
        <Route
          path="/reports/customer"
          element={
            <ProtectedRoute>
              <Layout>
                <CustomerReport />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* dealer */}
        <Route
          path="/reports/dealer"
          element={
            <ProtectedRoute>
              <Layout>
                <DealerReport />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Document Management Routes */}
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Layout>
                <DocumentManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/customers"
          element={
            <ProtectedRoute>
              <Layout>
                <CustomerDocuments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/dealers"
          element={
            <ProtectedRoute>
              <Layout>
                <DealerDocuments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/company"
          element={
            <ProtectedRoute>
              <Layout>
                <CompanyDocuments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/customers/view/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <CustomerDocumentView />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/dealers/view/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <DealerDocumentView />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Subscription Routes */}
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <Layout>
                <Subscription />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription/details"
          element={
            <ProtectedRoute>
              <Layout>
                <SubscriptionDetails />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription/upgrade"
          element={
            <ProtectedRoute>
              <Layout>
                <UpgradeSubscription />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* User */}
        <Route
          path="/superadmin/User"
          element={
            <ProtectedRoute>
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* user-roles */}
        <Route
          path="/superadmin/user-roles"
          element={
            <ProtectedRoute>
              <Layout>
                <Roles />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* countries */}
        <Route
          path="/superadmin/countries"
          element={
            <ProtectedRoute>
              <Layout>
                <Countries />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* states */}
        <Route
          path="/superadmin/states"
          element={
            <ProtectedRoute>
              <Layout>
                <States />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* cities */}
        <Route
          path="/superadmin/cities"
          element={
            <ProtectedRoute>
              <Layout>
                <Cities />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* pincodes */}
        <Route
          path="/superadmin/pincodes"
          element={
            <ProtectedRoute>
              <Layout>
                <Pincodes />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Brands */}
        <Route
          path="/superadmin/lpg-brands"
          element={
            <ProtectedRoute>
              <Layout>
                <Brands />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Cylinder Types */}
        <Route
          path="/superadmin/cylinder-types"
          element={
            <ProtectedRoute>
              <Layout>
                <CylinderTypes />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Cylinder Rates */}
        <Route
          path="/superadmin/cylinder-rates"
          element={
            <ProtectedRoute>
              <Layout>
                <CylinderRates />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Subscription Plans */}
        <Route
          path="/superadmin/subscription-plans"
          element={
            <ProtectedRoute>
              <Layout>
                <SubscriptionPlans />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Plan Features */}
        <Route
          path="/superadmin/plan-features"
          element={
            <ProtectedRoute>
              <Layout>
                <Plans />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Financial Management */}
        {/* Revenue Reports */}
        <Route
          path="/superadmin/revenue-reports"
          element={
            <ProtectedRoute>
              <Layout>
                <RevenueReports />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Payments */}
        <Route
          path="/superadmin/payment-history"
          element={
            <ProtectedRoute>
              <Layout>
                <PaymentHistory />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Invoice Overview */}
        <Route
          path="/superadmin/invoice-overview"
          element={
            <ProtectedRoute>
              <Layout>
                <InvoiceOverview />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Reports & Analytics */}
        {/* Tenant Growth */}
        <Route
          path="/superadmin/tenant-growth"
          element={
            <ProtectedRoute>
              <Layout>
                <TenantGrowth />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Reports & Revenue */}
        <Route
          path="/superadmin/revenue-analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <RevenueAnalytics />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* User Activity */}
        <Route
          path="/superadmin/user-activity"
          element={
            <ProtectedRoute>
              <Layout>
                <UserActivity />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* System Health */}
        <Route
          path="/superadmin/system-health"
          element={
            <ProtectedRoute>
              <Layout>
                <SystemHealth />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* System Settings */}
        {/* General Settings */}
        <Route
          path="/superadmin/general-settings"
          element={
            <ProtectedRoute>
              <Layout>
                <GeneralSettings />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Email Config */}
        <Route
          path="/superadmin/email-configuration"
          element={
            <ProtectedRoute>
              <Layout>
                <EmailConfig />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Backup Settings */}
        <Route
          path="/superadmin/backup-settings"
          element={
            <ProtectedRoute>
              <Layout>
                <BackupSettings />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* API Settings */}
        <Route
          path="/superadmin/api-settings"
          element={
            <ProtectedRoute>
              <Layout>
                <ApiSettings />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Security */}
        {/* AuditLogs */}
        <Route
          path="/superadmin/audit-logs"
          element={
            <ProtectedRoute>
              <Layout>
                <AuditLogs />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Login History */}
        <Route
          path="/superadmin/login-history"
          element={
            <ProtectedRoute>
              <Layout>
                <LoginHistory />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Permissions */}
        <Route
          path="/superadmin/permission-management"
          element={
            <ProtectedRoute>
              <Layout>
                <Permissions />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Backup & Maintenance */}
        {/* Database Backup */}
        <Route
          path="/superadmin/database-backup"
          element={
            <ProtectedRoute>
              <Layout>
                <DatabaseBackup />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Restore Backup  */}
        <Route
          path="/superadmin/restore-backup"
          element={
            <ProtectedRoute>
              <Layout>
                <RestoreBackup />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* System Maintenance */}
        <Route
          path="/superadmin/system-maintenance"
          element={
            <ProtectedRoute>
              <Layout>
                <SystemMaintenance />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/tenants"
          element={
            <ProtectedRoute>
              <Layout>
                <Tenants />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/tenants/create"
          element={
            <ProtectedRoute>
              <Layout>
                <TenantForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/tenants/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <TenantForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/tenant-subscriptions"
          element={
            <ProtectedRoute>
              <Layout>
                <TenantSubscription />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
