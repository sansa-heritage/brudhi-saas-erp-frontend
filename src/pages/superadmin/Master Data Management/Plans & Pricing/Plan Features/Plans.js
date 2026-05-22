import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Card,
  Badge,
  InputGroup,
  FormControl,
  Pagination,
} from "react-bootstrap";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaPlus,
  FaSearch,
  FaSync,
  FaChevronLeft,
  FaChevronRight,
  FaRupeeSign,
  FaTags,
  FaCalendarAlt,
  FaBuilding,
  FaUsers,
  FaFileInvoice,
  FaBoxes,
  FaDatabase,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { planApi } from "../../../../../api/superadmin/masterData.api";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [viewShow, setViewShow] = useState(false);
  const [editShow, setEditShow] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [currentPlan, setCurrentPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    annual_price: "",
    max_users: 5,
    max_invoices: 100,
    max_stock_items: 500,
    max_customers: 500,
    max_dealers: 100,
    max_storage_mb: 100,
    features: {},
    is_active: 1,
  });

  // Helper function to safely parse features
  const parseFeatures = (features) => {
    if (!features) return {};
    if (typeof features === 'object') return features;
    if (typeof features === 'string') {
      try {
        return JSON.parse(features);
      } catch (e) {
        console.error("Error parsing features:", e);
        return {};
      }
    }
    return {};
  };

  // Calculate summary stats
  const totalPlans = filteredPlans.length;
  const activePlans = filteredPlans.filter(p => p.is_active === 1).length;
  const inactivePlans = filteredPlans.filter(p => p.is_active === 0).length;

  // Fetch all plans on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  // Filter plans based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredPlans(plans);
    } else {
      const filtered = plans.filter(plan =>
        plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPlans(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, plans]);

  // Get all plans
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await planApi.getAll();
      console.log("Full API response:", response);

      let plansData = [];

      if (response.data && response.data.success) {
        if (response.data.data && response.data.data.data) {
          plansData = response.data.data.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          plansData = response.data.data;
        } else if (Array.isArray(response.data.data)) {
          plansData = response.data.data;
        }
      } else if (response.data && Array.isArray(response.data)) {
        plansData = response.data;
      } else if (Array.isArray(response)) {
        plansData = response;
      }

      // Ensure features are parsed correctly for each plan
      const formattedPlans = plansData.map(plan => ({
        ...plan,
        features: parseFeatures(plan.features)
      }));

      console.log("Extracted plans data:", formattedPlans);
      setPlans(formattedPlans);
      setFilteredPlans(formattedPlans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to fetch plans',
      });
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPlans.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add Plan
  const handleAdd = async () => {
    if (!formData.name || !formData.price) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill all required fields: Plan Name and Price',
      });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        annual_price: formData.annual_price ? parseFloat(formData.annual_price) : null,
        max_users: parseInt(formData.max_users),
        max_invoices: parseInt(formData.max_invoices),
        max_stock_items: parseInt(formData.max_stock_items),
        max_customers: parseInt(formData.max_customers),
        max_dealers: parseInt(formData.max_dealers),
        max_storage_mb: parseInt(formData.max_storage_mb),
        features: formData.features,
        is_active: parseInt(formData.is_active)
      };

      console.log("Creating plan with payload:", payload);
      const response = await planApi.create(payload);
      console.log("Create response:", response.data);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Plan added successfully',
        timer: 1500,
        showConfirmButton: false
      });
      
      resetForm();
      setShow(false);
      await fetchPlans();
    } catch (error) {
      console.error("Error adding plan:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to add plan',
      });
    }
  };

  // Delete Plan
  const handleDelete = async (id, planName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${planName}" plan`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await planApi.delete(id);
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Plan has been deleted successfully',
          timer: 1500,
          showConfirmButton: false
        });
        
        await fetchPlans();
      } catch (error) {
        console.error("Error deleting plan:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to delete plan',
        });
      }
    }
  };

  // View Plan
  const handleView = async (plan) => {
    try {
      const response = await planApi.getById(plan.id);
      let fullData = plan;
      if (response.data && response.data.data) {
        fullData = response.data.data;
      } else if (response.data) {
        fullData = response.data;
      }
      fullData.features = parseFeatures(fullData.features);
      setCurrentPlan(fullData);
      setViewShow(true);
    } catch (error) {
      console.error("Error fetching plan details:", error);
      plan.features = parseFeatures(plan.features);
      setCurrentPlan(plan);
      setViewShow(true);
    }
  };

  // Edit Open
  const handleEditOpen = (plan) => {
    setCurrentPlan(plan);
    setFormData({
      name: plan.name || "",
      description: plan.description || "",
      price: plan.price || "",
      annual_price: plan.annual_price || "",
      max_users: plan.max_users || 5,
      max_invoices: plan.max_invoices || 100,
      max_stock_items: plan.max_stock_items || 500,
      max_customers: plan.max_customers || 500,
      max_dealers: plan.max_dealers || 100,
      max_storage_mb: plan.max_storage_mb || 100,
      features: parseFeatures(plan.features),
      is_active: plan.is_active !== undefined ? plan.is_active : 1,
    });
    setEditShow(true);
  };

  // Update Plan
  const handleUpdate = async () => {
    if (!formData.name || !formData.price) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill all required fields: Plan Name and Price',
      });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        annual_price: formData.annual_price ? parseFloat(formData.annual_price) : null,
        max_users: parseInt(formData.max_users),
        max_invoices: parseInt(formData.max_invoices),
        max_stock_items: parseInt(formData.max_stock_items),
        max_customers: parseInt(formData.max_customers),
        max_dealers: parseInt(formData.max_dealers),
        max_storage_mb: parseInt(formData.max_storage_mb),
        features: formData.features,
        is_active: parseInt(formData.is_active)
      };
      
      console.log("Updating plan ID:", currentPlan.id);
      console.log("Updating plan with payload:", payload);
      
      const response = await planApi.update(currentPlan.id, payload);
      console.log("Update response:", response.data);
      
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Plan has been updated successfully',
        timer: 1500,
        showConfirmButton: false
      });
      
      setEditShow(false);
      resetForm();
      await fetchPlans();
    } catch (error) {
      console.error("Error updating plan:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to update plan',
      });
    }
  };

  // Toggle status
  const handleToggleStatus = async (plan) => {
    const isActive = plan.is_active === 1;
    const action = isActive ? 'deactivate' : 'activate';
    const newStatus = isActive ? 0 : 1;
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You want to ${action} "${plan.name}" plan?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${action} it!`,
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setToggleLoading(true);
      try {
        await planApi.toggleStatus(plan.id, { is_active: newStatus });
        
        Swal.fire({
          icon: 'success',
          title: `${action.charAt(0).toUpperCase() + action.slice(1)}d!`,
          text: `Plan has been ${action}d successfully`,
          timer: 1500,
          showConfirmButton: false
        });
        
        await fetchPlans();
      } catch (error) {
        console.error("Error toggling status:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.data?.message || `Failed to ${action} plan`,
        });
      } finally {
        setToggleLoading(false);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      annual_price: "",
      max_users: 5,
      max_invoices: 100,
      max_stock_items: 500,
      max_customers: 500,
      max_dealers: 100,
      max_storage_mb: 100,
      features: {},
      is_active: 1,
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const isActive = status === 1;
    return (
      <Badge
        bg={isActive ? 'success' : 'danger'}
        className="px-2 py-1 rounded-pill"
        style={{ fontSize: "11px", fontWeight: 500 }}
      >
        <span className="me-1">{isActive ? '●' : '○'}</span>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="p-4" style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: "#1e293b", fontSize: "1.5rem" }}>
          <FaTags className="me-2" style={{ color: "#dc3545", fontSize: "1.3rem" }} />
          Plan Management
        </h3>
        <p className="text-muted mb-0" style={{ fontSize: "13px" }}>Manage subscription plans and their features</p>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Total Plans</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{totalPlans}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#e3f2fd", width: "36px", height: "36px" }}>
                  <FaTags size={16} style={{ color: "#3085d6" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Active Plans</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{activePlans}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#d1fae5", width: "36px", height: "36px" }}>
                  <FaToggleOn size={16} style={{ color: "#10b981" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Inactive Plans</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{inactivePlans}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#fee2e2", width: "36px", height: "36px" }}>
                  <FaToggleOff size={16} style={{ color: "#ef4444" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-sm border-0" style={{ borderRadius: "20px", overflow: "hidden" }}>
        <Card.Header className="bg-white border-0 py-3 px-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h5 className="mb-0 fw-bold" style={{ fontSize: "1rem" }}>Plans Database</h5>
              <p className="text-muted small mb-0" style={{ fontSize: "11px" }}>Manage, edit, and monitor subscription plan information</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={fetchPlans} className="rounded-pill px-3" style={{ fontSize: "12px", padding: "5px 12px" }}>
                <FaSync className="me-1" size={12} /> Refresh
              </Button>
              <Button variant="primary" onClick={() => setShow(true)} className="rounded-pill px-4" style={{ background: "#1e3a6f", border: "none", fontSize: "12px", padding: "5px 16px" }}>
                <FaPlus className="me-2" size={12} /> Add New Plan
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {/* Search Bar */}
          <div className="px-4 pt-3 pb-2">
            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
              <div className="flex-grow-1" style={{ maxWidth: "400px" }}>
                <InputGroup className="rounded-pill overflow-hidden shadow-sm">
                  <InputGroup.Text className="bg-white border-end-0" style={{ fontSize: "12px" }}>
                    <FaSearch className="text-muted" size={12} />
                  </InputGroup.Text>
                  <FormControl
                    placeholder="Search by plan name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                    style={{ fontSize: "13px" }}
                  />
                </InputGroup>
              </div>
            </div>
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: "2rem", height: "2rem" }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted" style={{ fontSize: "13px" }}>Loading plans...</p>
            </div>
          )}

          {/* Modern Table */}
          {!loading && (
            <div className="table-responsive px-4">
              <Table className="align-middle mb-0" style={{ minWidth: "1000px", fontSize: "12px" }}>
                <thead style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                  <tr className="text-muted">
                    <th className="py-2 ps-3" style={{ width: "60px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>#</th>
                    <th className="py-2" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Plan Name</th>
                    <th className="py-2" style={{ width: "200px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Description</th>
                    <th className="py-2" style={{ width: "100px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>Price</th>
                    <th className="py-2" style={{ width: "120px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>Annual Price</th>
                    <th className="py-2" style={{ width: "90px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>Status</th>
                    <th className="py-2" style={{ width: "100px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Created</th>
                    <th className="py-2 text-center" style={{ width: "170px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Actions</th>
                   </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <div className="text-muted">
                          <FaTags size={36} className="mb-2 opacity-25" />
                          <p style={{ fontSize: "13px" }}>No plans found</p>
                          <Button variant="primary" size="sm" onClick={() => setShow(true)} className="rounded-pill" style={{ fontSize: "11px" }}>
                            <FaPlus className="me-1" size={10} /> Add your first plan
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((p, i) => (
                      <tr key={p.id} className="border-bottom" style={{ borderBottom: "1px solid #f0f2f8" }}>
                        <td className="py-2 ps-3 text-center fw-bold text-muted" style={{ fontSize: "12px" }}>{indexOfFirstItem + i + 1}</td>
                        <td className="py-2">
                          <div className="fw-semibold" style={{ fontSize: "13px" }}>{p.name}</div>
                        </td>
                        <td className="py-2">
                          <span style={{ fontSize: "12px" }}>
                            {p.description?.length > 50 ? `${p.description.substring(0, 50)}...` : p.description || '-'}
                          </span>
                        </td>
                        <td className="py-2 text-center">
                          <Badge bg="info" className="px-2 py-1 rounded-pill" style={{ fontSize: "11px", fontWeight: 500 }}>
                            <FaRupeeSign className="me-1" size={10} />
                            {formatPrice(p.price)}
                          </Badge>
                        </td>
                        <td className="py-2 text-center">
                          {p.annual_price ? (
                            <Badge bg="secondary" className="px-2 py-1 rounded-pill" style={{ fontSize: "11px", fontWeight: 500 }}>
                              <FaRupeeSign className="me-1" size={10} />
                              {formatPrice(p.annual_price)}/yr
                            </Badge>
                          ) : (
                            <span className="text-muted" style={{ fontSize: "11px" }}>-</span>
                          )}
                        </td>
                        <td className="py-2 text-center">{getStatusBadge(p.is_active)}</td>
                        <td className="py-2">
                          <small className="text-muted" style={{ fontSize: "11px" }}>
                            <FaCalendarAlt className="me-1" size={9} style={{ color: "#6c757d" }} />
                            {formatDate(p.created_at)}
                          </small>
                        </td>
                        <td className="py-2">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              size="sm"
                              variant="outline-info"
                              onClick={() => handleView(p)}
                              title="View Details"
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: "#0dcaf0", color: "#0dcaf0" }}
                            >
                              <FaEye size={12} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-warning"
                              onClick={() => handleEditOpen(p)}
                              title="Edit Plan"
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: "#ffc107", color: "#ffc107" }}
                            >
                              <FaEdit size={12} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => handleToggleStatus(p)}
                              title={p.is_active === 1 ? "Deactivate" : "Activate"}
                              disabled={toggleLoading}
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: p.is_active === 1 ? "#dc3545" : "#198754", color: p.is_active === 1 ? "#dc3545" : "#198754" }}
                            >
                              {toggleLoading ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : p.is_active === 1 ? (
                                <FaToggleOn size={12} />
                              ) : (
                                <FaToggleOff size={12} />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(p.id, p.name)}
                              title="Delete Plan"
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: "#dc3545", color: "#dc3545" }}
                            >
                              <FaTrash size={12} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredPlans.length > 0 && totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top mt-2">
              <div className="text-muted" style={{ fontSize: "11px" }}>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPlans.length)} of {filteredPlans.length} entries
              </div>
              <Pagination className="mb-0" style={{ fontSize: "12px" }}>
                <Pagination.Prev
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-circle mx-1"
                >
                  <FaChevronLeft size={10} />
                </Pagination.Prev>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === currentPage}
                      onClick={() => paginate(pageNum)}
                      className="mx-1"
                      style={{ fontSize: "12px", minWidth: "30px", textAlign: "center" }}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}

                <Pagination.Next
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-circle mx-1"
                >
                  <FaChevronRight size={10} />
                </Pagination.Next>
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Modal */}
      <Modal show={show} onHide={() => setShow(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-white border-0 pt-3 px-4">
          <Modal.Title className="fw-bold" style={{ fontSize: "1.1rem" }}>
            <FaPlus className="me-2" style={{ color: "#1e3a6f", fontSize: "14px" }} /> Add New Plan
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          <Form>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Plan Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter plan name (e.g., Basic, Premium, Enterprise)"
                value={formData.name}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                placeholder="Enter plan description"
                value={formData.description}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Monthly Price (₹) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    placeholder="Monthly price"
                    value={formData.price}
                    onChange={handleChange}
                    className="rounded-3"
                    style={{ fontSize: "13px" }}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Annual Price (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    name="annual_price"
                    placeholder="Annual price (optional)"
                    value={formData.annual_price}
                    onChange={handleChange}
                    className="rounded-3"
                    style={{ fontSize: "13px" }}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>
                    <FaUsers className="me-1" size={12} /> Max Users
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="max_users"
                    value={formData.max_users}
                    onChange={handleChange}
                    className="rounded-3"
                    style={{ fontSize: "13px" }}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>
                    <FaFileInvoice className="me-1" size={12} /> Max Invoices
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="max_invoices"
                    value={formData.max_invoices}
                    onChange={handleChange}
                    className="rounded-3"
                    style={{ fontSize: "13px" }}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>
                    <FaBoxes className="me-1" size={12} /> Max Stock Items
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="max_stock_items"
                    value={formData.max_stock_items}
                    onChange={handleChange}
                    className="rounded-3"
                    style={{ fontSize: "13px" }}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>
                    <FaDatabase className="me-1" size={12} /> Max Storage (MB)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="max_storage_mb"
                    value={formData.max_storage_mb}
                    onChange={handleChange}
                    className="rounded-3"
                    style={{ fontSize: "13px" }}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Status</Form.Label>
              <Form.Select name="is_active" value={formData.is_active} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pb-3 px-4">
          <Button variant="light" onClick={() => setShow(false)} className="rounded-pill px-3" style={{ fontSize: "12px" }}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd} className="rounded-pill px-3" style={{ background: "#1e3a6f", fontSize: "12px" }}>Save Plan</Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={viewShow} onHide={() => setViewShow(false)} centered size="lg">
        <Modal.Header closeButton className="bg-white border-0 pt-3 px-4">
          <Modal.Title className="fw-bold" style={{ fontSize: "1.1rem" }}>
            <FaEye className="me-2" style={{ color: "#0dcaf0", fontSize: "14px" }} /> Plan Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          {currentPlan && (
            <>
              <div className="text-center mb-3">
                <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2" style={{ width: "60px", height: "60px", background: "transparent" }}>
                  <FaTags size={30} style={{ color: "#667eea" }} />
                </div>
                <h4 className="mb-0" style={{ fontSize: "1.2rem" }}>{currentPlan.name}</h4>
                <Badge bg={currentPlan.is_active === 1 ? "success" : "danger"} className="mt-1" style={{ fontSize: "11px" }}>
                  {currentPlan.is_active === 1 ? "Active" : "Inactive"}
                </Badge>
              </div>

              <hr className="my-2" />

              <div className="row" style={{ fontSize: "12px" }}>
                <div className="col-md-6 mb-2">
                  <strong>Plan ID:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>#{currentPlan.id}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Description:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{currentPlan.description || '-'}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Monthly Price:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{formatPrice(currentPlan.price)}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Annual Price:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{currentPlan.annual_price ? formatPrice(currentPlan.annual_price) : '-'}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Max Users:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{currentPlan.max_users || '-'}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Max Invoices:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{currentPlan.max_invoices || '-'}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Max Stock Items:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{currentPlan.max_stock_items || '-'}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Max Storage:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{currentPlan.max_storage_mb ? `${currentPlan.max_storage_mb} MB` : '-'}</p>
                </div>
                <div className="col-md-12 mb-2">
                  <strong>Created At:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{formatDate(currentPlan.created_at)}</p>
                </div>
                <div className="col-md-12 mb-2">
                  <strong>Last Updated:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{formatDate(currentPlan.updated_at)}</p>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pb-3 px-4">
          <Button variant="secondary" onClick={() => setViewShow(false)} className="rounded-pill px-3" style={{ fontSize: "12px" }}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={editShow} onHide={() => setEditShow(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-white border-0 pt-3 px-4">
          <Modal.Title className="fw-bold" style={{ fontSize: "1.1rem" }}>
            <FaEdit className="me-2" style={{ color: "#ffc107", fontSize: "14px" }} /> Edit Plan
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          <Form>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Plan Name <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Description</Form.Label>
              <Form.Control as="textarea" rows={2} name="description" value={formData.description} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }} />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Monthly Price (₹) <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="number" name="price" value={formData.price} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }} />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Annual Price (₹)</Form.Label>
                  <Form.Control type="number" name="annual_price" value={formData.annual_price} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }} />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>
                    <FaUsers className="me-1" size={12} /> Max Users
                  </Form.Label>
                  <Form.Control type="number" name="max_users" value={formData.max_users} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }} />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>
                    <FaFileInvoice className="me-1" size={12} /> Max Invoices
                  </Form.Label>
                  <Form.Control type="number" name="max_invoices" value={formData.max_invoices} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }} />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>
                    <FaBoxes className="me-1" size={12} /> Max Stock Items
                  </Form.Label>
                  <Form.Control type="number" name="max_stock_items" value={formData.max_stock_items} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }} />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>
                    <FaDatabase className="me-1" size={12} /> Max Storage (MB)
                  </Form.Label>
                  <Form.Control type="number" name="max_storage_mb" value={formData.max_storage_mb} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }} />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Status</Form.Label>
              <Form.Select name="is_active" value={formData.is_active} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pb-3 px-4">
          <Button variant="light" onClick={() => setEditShow(false)} className="rounded-pill px-3" style={{ fontSize: "12px" }}>Cancel</Button>
          <Button variant="warning" onClick={handleUpdate} className="rounded-pill px-3" style={{ fontSize: "12px" }}>Update Plan</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Plans;