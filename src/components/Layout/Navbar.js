import React, { useState } from "react";
import { FaSearch, FaBell, FaUserCircle, FaTimes } from "react-icons/fa";

const Navbar = ({ toggleSidebar, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Sample data for searching (in real app, this would come from props/context)
  const invoices = [
    { id: "INV-001", customer: "ABC Traders", amount: 25000, type: "invoice" },
    {
      id: "INV-002",
      customer: "XYZ Enterprises",
      amount: 18750,
      type: "invoice",
    },
    {
      id: "INV-003",
      customer: "PQR Solutions",
      amount: 42000,
      type: "invoice",
    },
    {
      id: "INV-004",
      customer: "LMN Industries",
      amount: 15000,
      type: "invoice",
    },
  ];

  const customers = [
    {
      id: 1,
      name: "ABC Traders",
      gstin: "22AAAAA0000A1Z",
      phone: "9876543210",
      type: "customer",
    },
    {
      id: 2,
      name: "XYZ Enterprises",
      gstin: "22BBBBB1111B2Z",
      phone: "9876543211",
      type: "customer",
    },
    {
      id: 3,
      name: "PQR Solutions",
      gstin: "22CCCCC2222C3Z",
      phone: "9876543212",
      type: "customer",
    },
    {
      id: 4,
      name: "LMN Industries",
      gstin: "22DDDDD3333D4Z",
      phone: "9876543213",
      type: "customer",
    },
  ];

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === "") {
      setSearchResults([]);
      setShowResults(false);
      if (onSearch) onSearch("");
      return;
    }

    // Search in invoices
    const invoiceResults = invoices
      .filter(
        (inv) =>
          inv.id.toLowerCase().includes(term.toLowerCase()) ||
          inv.customer.toLowerCase().includes(term.toLowerCase()),
      )
      .map((inv) => ({
        ...inv,
        displayText: `${inv.id} - ${inv.customer}`,
        subtitle: `Amount: ₹${inv.amount.toLocaleString()}`,
        icon: "📄",
      }));

    // Search in customers
    const customerResults = customers
      .filter(
        (cust) =>
          cust.name.toLowerCase().includes(term.toLowerCase()) ||
          cust.gstin.toLowerCase().includes(term.toLowerCase()) ||
          cust.phone.includes(term),
      )
      .map((cust) => ({
        ...cust,
        displayText: cust.name,
        subtitle: `GST: ${cust.gstin} | Phone: ${cust.phone}`,
        icon: "👤",
      }));

    const results = [...invoiceResults, ...customerResults];
    setSearchResults(results);
    setShowResults(results.length > 0);

    if (onSearch) onSearch(term);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);
    if (onSearch) onSearch("");
  };

  const handleResultClick = (result) => {
    console.log("Selected:", result);
    setSearchTerm("");
    setShowResults(false);
    // Navigate to respective page based on type
    if (result.type === "invoice") {
      // Navigate to invoice details
      window.location.href = `/invoices/${result.id}`;
    } else if (result.type === "customer") {
      // Navigate to customer details
      window.location.href = `/customers/${result.id}`;
    }
  };

  return (
    <nav className="main-navbar">
      <div className="navbar-container">
        {/* Left side - Title and Search */}
        <div className="navbar-left">
          <div className="navbar-title">
            <h4>Dashboard</h4>
            <p>Overview of your business performance</p>
          </div>

          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search invoices, customers..."
              value={searchTerm}
              onChange={handleSearch}
              onFocus={() => searchTerm && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
            />
            {searchTerm && (
              <FaTimes className="clear-icon" onClick={clearSearch} />
            )}

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="search-results">
                {searchResults.length > 0 ? (
                  <>
                    <div className="search-results-header">
                      Found {searchResults.length} result(s)
                    </div>
                    {searchResults.map((result, idx) => (
                      <div
                        key={idx}
                        className="search-result-item"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="result-icon">{result.icon}</div>
                        <div className="result-details">
                          <div className="result-title">
                            {result.displayText}
                          </div>
                          <div className="result-subtitle">
                            {result.subtitle}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="no-results">
                    <FaSearch />
                    <p>No results found for "{searchTerm}"</p>
                    <small>Try searching with different keywords</small>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Notifications and User */}
        <div className="navbar-right">
          <div className="notification-icon">
            <FaBell size={20} />
            <span className="notification-badge">3</span>
          </div>

          <div className="user-profile">
            <div className="user-avatar-nav">A</div>
            <div className="user-info-nav">
              <div className="user-name">Admin User</div>
              <div className="user-role">Administrator</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
