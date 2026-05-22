import React from "react";
import Sidebar from "./Sidebar";

const SuperAdminLayout = ({ children }) => {
  return (
    <div className="d-flex">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-grow-1">
        
        {/* Topbar */}
        <div className="bg-light p-3 shadow">
          <h5>Super Admin Panel</h5>
        </div>

        {/* Page Content */}
        <div className="p-4">
          {children}
        </div>
      </div>

    </div>
  );
};

export default SuperAdminLayout;