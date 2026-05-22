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
  FaTag,
  FaFire,
  FaCalendarAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { brandApi } from "../../../../../api/superadmin/masterData.api";

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [viewShow, setViewShow] = useState(false);
  const [editShow, setEditShow] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [currentBrand, setCurrentBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    status: 1,
  });

  // Calculate summary stats
  const totalBrands = filteredBrands.length;
  const activeBrands = filteredBrands.filter(b => b.status === 1).length;
  const inactiveBrands = filteredBrands.filter(b => b.status === 0).length;

  // Fetch all brands on component mount
  useEffect(() => {
    fetchBrands();
  }, []);

  // Filter brands based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredBrands(brands);
    } else {
      const filtered = brands.filter(
        (brand) =>
          brand.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          brand.code?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredBrands(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, brands]);

  // Get all brands
  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await brandApi.getAll();
      console.log("Full API response:", response);

      let brandsData = [];

      if (response.data && response.data.success) {
        if (response.data.data && response.data.data.data) {
          brandsData = response.data.data.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          brandsData = response.data.data;
        } else if (Array.isArray(response.data.data)) {
          brandsData = response.data.data;
        }
      } else if (response.data && Array.isArray(response.data)) {
        brandsData = response.data;
      } else if (Array.isArray(response)) {
        brandsData = response;
      }

      console.log("Extracted brands data:", brandsData);
      setBrands(brandsData);
      setFilteredBrands(brandsData);
    } catch (error) {
      console.error("Error fetching brands:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to fetch brands",
      });
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBrands.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add Brand
  const handleAdd = async () => {
    if (!formData.name || !formData.code) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill all required fields (Brand Name and Code)",
      });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        status: parseInt(formData.status),
      };

      console.log("Creating brand with payload:", payload);
      const response = await brandApi.create(payload);
      console.log("Create response:", response.data);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Brand added successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      setFormData({ name: "", code: "", status: 1 });
      setShow(false);
      await fetchBrands();
    } catch (error) {
      console.error("Error adding brand:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to add brand",
      });
    }
  };

  // Delete Brand
  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${name}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await brandApi.delete(id);

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Brand has been deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });

        await fetchBrands();
      } catch (error) {
        console.error("Error deleting brand:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Failed to delete brand",
        });
      }
    }
  };

  // View Brand
  const handleView = async (brand) => {
    try {
      const response = await brandApi.getById(brand.id);
      let fullData = brand;
      if (response.data && response.data.data) {
        fullData = response.data.data;
      } else if (response.data) {
        fullData = response.data;
      }
      setCurrentBrand(fullData);
      setViewShow(true);
    } catch (error) {
      console.error("Error fetching brand details:", error);
      setCurrentBrand(brand);
      setViewShow(true);
    }
  };

  // Edit Open
  const handleEditOpen = (brand) => {
    setCurrentBrand(brand);
    setFormData({
      name: brand.name,
      code: brand.code,
      status: brand.status,
    });
    setEditShow(true);
  };

  // Update Brand
  const handleUpdate = async () => {
    if (!formData.name || !formData.code) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill all required fields (Brand Name and Code)",
      });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        status: parseInt(formData.status),
      };

      console.log("Updating brand ID:", currentBrand.id);
      console.log("Updating brand with payload:", payload);

      const response = await brandApi.update(currentBrand.id, payload);
      console.log("Update response:", response.data);

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Brand has been updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      setEditShow(false);
      setFormData({ name: "", code: "", status: 1 });
      await fetchBrands();
    } catch (error) {
      console.error("Error updating brand:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to update brand",
      });
    }
  };

  // Toggle status
  const handleToggleStatus = async (brand) => {
    const isActive = brand.status === 1;
    const action = isActive ? "deactivate" : "activate";

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to ${action} "${brand.name}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${action} it!`,
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setToggleLoading(true);
      try {
        const payload = {
          ...brand,
          status: isActive ? 0 : 1,
        };
        await brandApi.update(brand.id, payload);

        Swal.fire({
          icon: "success",
          title: `${action.charAt(0).toUpperCase() + action.slice(1)}d!`,
          text: `Brand has been ${action}d successfully`,
          timer: 1500,
          showConfirmButton: false,
        });

        await fetchBrands();
      } catch (error) {
        console.error("Error toggling status:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || `Failed to ${action} brand`,
        });
      } finally {
        setToggleLoading(false);
      }
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const isActive = status === 1;
    return (
      <Badge
        bg={isActive ? "success" : "danger"}
        className="px-2 py-1 rounded-pill"
        style={{ fontSize: "11px", fontWeight: 500 }}
      >
        <span className="me-1">{isActive ? "●" : "○"}</span>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get brand icon color
  const getBrandColor = (name) => {
    const colors = ["primary", "success", "danger", "warning", "info", "secondary"];
    const index = name ? name.length % colors.length : 0;
    return colors[index];
  };

  return (
    <div className="p-4" style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: "#1e293b", fontSize: "1.5rem" }}>
          <FaFire className="me-2" style={{ color: "#dc3545", fontSize: "1.3rem" }} />
          LPG Brands
        </h3>
        <p className="text-muted mb-0" style={{ fontSize: "13px" }}>Manage your LPG brand database</p>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Total Brands</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{totalBrands}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#e3f2fd", width: "36px", height: "36px" }}>
                  <FaTag size={16} style={{ color: "#3085d6" }} />
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
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Active Brands</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{activeBrands}</h4>
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
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Inactive Brands</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{inactiveBrands}</h4>
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
              <h5 className="mb-0 fw-bold" style={{ fontSize: "1rem" }}>Brands Database</h5>
              <p className="text-muted small mb-0" style={{ fontSize: "11px" }}>Manage, edit, and monitor brand information</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={fetchBrands} className="rounded-pill px-3" style={{ fontSize: "12px", padding: "5px 12px" }}>
                <FaSync className="me-1" size={12} /> Refresh
              </Button>
              <Button variant="primary" onClick={() => setShow(true)} className="rounded-pill px-4" style={{ background: "#1e3a6f", border: "none", fontSize: "12px", padding: "5px 16px" }}>
                <FaPlus className="me-2" size={12} /> Add New Brand
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
                    placeholder="Search by brand name or code..."
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
              <p className="mt-3 text-muted" style={{ fontSize: "13px" }}>Loading brands...</p>
            </div>
          )}

          {/* Modern Table */}
          {!loading && (
            <div className="table-responsive px-4">
              <Table className="align-middle mb-0" style={{ minWidth: "900px", fontSize: "12px" }}>
                <thead style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                  <tr className="text-muted">
                    <th className="py-2 ps-3" style={{ width: "60px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>#</th>
                    <th className="py-2" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Brand Name</th>
                    <th className="py-2" style={{ width: "150px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Brand Code</th>
                    <th className="py-2" style={{ width: "100px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>Status</th>
                    <th className="py-2" style={{ width: "110px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Created</th>
                    <th className="py-2 text-center" style={{ width: "170px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="text-muted">
                          <FaFire size={36} className="mb-2 opacity-25" />
                          <p style={{ fontSize: "13px" }}>No brands found</p>
                          <Button variant="primary" size="sm" onClick={() => setShow(true)} className="rounded-pill" style={{ fontSize: "11px" }}>
                            <FaPlus className="me-1" size={10} /> Add your first brand
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((b, i) => (
                      <tr key={b.id} className="border-bottom" style={{ borderBottom: "1px solid #f0f2f8" }}>
                        <td className="py-2 ps-3 text-center fw-bold text-muted" style={{ fontSize: "12px" }}>{indexOfFirstItem + i + 1}</td>
                        <td className="py-2">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: "32px", height: "32px", background: "transparent" }}
                            >
                              <FaFire size={14} style={{ color: "#f5576c" }} />
                            </div>
                            <div>
                              <div className="fw-semibold" style={{ fontSize: "13px" }}>{b.name}</div>
                              <div className="small text-muted" style={{ fontSize: "10px" }}>ID: {b.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2">
                          <Badge bg={getBrandColor(b.name)} className="px-2 py-1 rounded-pill" style={{ fontSize: "11px", fontWeight: 500 }}>
                            {b.code || "N/A"}
                          </Badge>
                        </td>
                        <td className="py-2 text-center">{getStatusBadge(b.status)}</td>
                        <td className="py-2">
                          <small className="text-muted" style={{ fontSize: "11px" }}>
                            <FaCalendarAlt className="me-1" size={9} style={{ color: "#6c757d" }} />
                            {formatDate(b.created_at)}
                          </small>
                        </td>
                        <td className="py-2">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              size="sm"
                              variant="outline-info"
                              onClick={() => handleView(b)}
                              title="View Details"
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: "#0dcaf0", color: "#0dcaf0" }}
                            >
                              <FaEye size={12} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-warning"
                              onClick={() => handleEditOpen(b)}
                              title="Edit Brand"
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: "#ffc107", color: "#ffc107" }}
                            >
                              <FaEdit size={12} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => handleToggleStatus(b)}
                              title={b.status === 1 ? "Deactivate" : "Activate"}
                              disabled={toggleLoading}
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: b.status === 1 ? "#dc3545" : "#198754", color: b.status === 1 ? "#dc3545" : "#198754" }}
                            >
                              {toggleLoading ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : b.status === 1 ? (
                                <FaToggleOn size={12} />
                              ) : (
                                <FaToggleOff size={12} />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(b.id, b.name)}
                              title="Delete Brand"
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
          {!loading && filteredBrands.length > 0 && totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top mt-2">
              <div className="text-muted" style={{ fontSize: "11px" }}>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBrands.length)} of {filteredBrands.length} entries
              </div>
              <Pagination className="mb-0" style={{ fontSize: "12px" }}>
                <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="rounded-circle mx-1">
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
                    <Pagination.Item key={pageNum} active={pageNum === currentPage} onClick={() => paginate(pageNum)} className="mx-1" style={{ fontSize: "12px", minWidth: "30px", textAlign: "center" }}>
                      {pageNum}
                    </Pagination.Item>
                  );
                })}
                <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="rounded-circle mx-1">
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
            <FaPlus className="me-2" style={{ color: "#1e3a6f", fontSize: "14px" }} /> Add New Brand
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          <Form>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Brand Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter brand name (e.g., Indane, HP Gas, Bharat Gas)"
                value={formData.name}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              />
              <Form.Text className="text-muted" style={{ fontSize: "11px" }}>Enter the LPG brand name</Form.Text>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Brand Code <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="code"
                placeholder="Enter brand code (e.g., IND, HP, BHARAT)"
                value={formData.code}
                onChange={handleChange}
                style={{ textTransform: "uppercase", fontSize: "13px" }}
                className="rounded-3"
              />
              <Form.Text className="text-muted" style={{ fontSize: "11px" }}>Unique identifier code for the brand</Form.Text>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pb-3 px-4">
          <Button variant="light" onClick={() => setShow(false)} className="rounded-pill px-3" style={{ fontSize: "12px" }}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd} className="rounded-pill px-3" style={{ background: "#1e3a6f", fontSize: "12px" }}>Save Brand</Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={viewShow} onHide={() => setViewShow(false)} centered>
        <Modal.Header closeButton className="bg-white border-0 pt-3 px-4">
          <Modal.Title className="fw-bold" style={{ fontSize: "1.1rem" }}>
            <FaEye className="me-2" style={{ color: "#0dcaf0", fontSize: "14px" }} /> Brand Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          {currentBrand && (
            <>
              <div className="text-center mb-3">
                <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2" style={{ width: "60px", height: "60px", background: "transparent" }}>
                  <FaFire size={30} style={{ color: "#f5576c" }} />
                </div>
                <h4 className="mb-0" style={{ fontSize: "1.2rem" }}>{currentBrand.name}</h4>
                <Badge bg="secondary" className="mt-1" style={{ fontSize: "11px" }}>ID: #{currentBrand.id}</Badge>
              </div>
              <hr className="my-2" />
              <div className="row" style={{ fontSize: "12px" }}>
                <div className="col-md-6 mb-2">
                  <strong>Brand Name:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{currentBrand.name}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Brand Code:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{currentBrand.code || "N/A"}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Status:</strong>
                  <div className="mt-1">{getStatusBadge(currentBrand.status)}</div>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Created At:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{formatDate(currentBrand.created_at)}</p>
                </div>
                <div className="col-md-12 mb-2">
                  <strong>Last Updated:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{formatDate(currentBrand.updated_at)}</p>
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
            <FaEdit className="me-2" style={{ color: "#ffc107", fontSize: "14px" }} /> Edit Brand
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          <Form>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Brand Name <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Brand Code <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" name="code" value={formData.code} onChange={handleChange} style={{ textTransform: "uppercase", fontSize: "13px" }} className="rounded-3" />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pb-3 px-4">
          <Button variant="light" onClick={() => setEditShow(false)} className="rounded-pill px-3" style={{ fontSize: "12px" }}>Cancel</Button>
          <Button variant="warning" onClick={handleUpdate} className="rounded-pill px-3" style={{ fontSize: "12px" }}>Update Brand</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Brands;