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
  FaCube,
  FaWeightHanging,
  FaRupeeSign,
  FaTag,
  FaBoxes,
  FaCalendarAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { cylinderTypeApi } from "../../../../../api/superadmin/masterData.api";

const CylinderTypes = () => {
  const [cylinderTypes, setCylinderTypes] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [viewShow, setViewShow] = useState(false);
  const [editShow, setEditShow] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [currentType, setCurrentType] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    weight: "",
    type: "",
    capacity_kg: "",
    price: "",
    status: 1,
  });

  // Calculate summary stats
  const totalTypes = filteredTypes.length;
  const activeTypes = filteredTypes.filter(t => t.status === 1).length;
  const inactiveTypes = filteredTypes.filter(t => t.status === 0).length;
  const domesticTypes = filteredTypes.filter(t => t.type === "domestic").length;

  // Fetch all cylinder types on component mount
  useEffect(() => {
    fetchCylinderTypes();
  }, []);

  // Filter types based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredTypes(cylinderTypes);
    } else {
      const filtered = cylinderTypes.filter(
        (type) =>
          type.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          type.weight?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          type.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTypes(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, cylinderTypes]);

  // Get all cylinder types
  const fetchCylinderTypes = async () => {
    setLoading(true);
    try {
      const response = await cylinderTypeApi.getAll();
      console.log("Full API response:", response);

      let typesData = [];

      if (response?.data?.data) {
        if (Array.isArray(response.data.data)) {
          typesData = response.data.data;
        } else if (typeof response.data.data === "object" && response.data.data !== null) {
          typesData = [response.data.data];
        }
      } else if (response?.data?.success && response.data.data) {
        if (Array.isArray(response.data.data)) {
          typesData = response.data.data;
        } else if (response.data.data.data && Array.isArray(response.data.data.data)) {
          typesData = response.data.data.data;
        }
      } else if (Array.isArray(response?.data)) {
        typesData = response.data;
      } else if (Array.isArray(response)) {
        typesData = response;
      }

      console.log("Extracted cylinder types data:", typesData);
      console.log(`Total records: ${typesData.length}`);

      setCylinderTypes(typesData);
      setFilteredTypes(typesData);

      if (typesData.length === 0) {
        console.warn("No cylinder types found");
      }
    } catch (error) {
      console.error("Error fetching cylinder types:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to fetch cylinder types",
      });
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTypes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTypes.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add Cylinder Type
  const handleAdd = async () => {
    if (!formData.name || !formData.weight || !formData.type || !formData.price) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill all required fields: Name, Weight, Type, and Price",
      });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        weight: parseFloat(formData.weight),
        type: formData.type,
        capacityKg: formData.capacity_kg ? parseFloat(formData.capacity_kg) : null,
        price: parseFloat(formData.price),
        status: parseInt(formData.status),
      };

      console.log("Creating cylinder type with payload:", payload);
      const response = await cylinderTypeApi.create(payload);
      console.log("Create response:", response.data);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Cylinder type added successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      setFormData({
        name: "",
        weight: "",
        type: "",
        capacity_kg: "",
        price: "",
        status: 1,
      });
      setShow(false);
      await fetchCylinderTypes();
    } catch (error) {
      console.error("Error adding cylinder type:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to add cylinder type",
      });
    }
  };

  // Delete Cylinder Type
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
        await cylinderTypeApi.delete(id);

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Cylinder type has been deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });

        await fetchCylinderTypes();
      } catch (error) {
        console.error("Error deleting cylinder type:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Failed to delete cylinder type",
        });
      }
    }
  };

  // View Cylinder Type
  const handleView = async (type) => {
    try {
      const response = await cylinderTypeApi.getById(type.id);
      let fullData = type;
      if (response?.data?.success && response.data.data) {
        fullData = response.data.data;
      } else if (response?.data) {
        fullData = response.data;
      }
      setCurrentType(fullData);
      setViewShow(true);
    } catch (error) {
      console.error("Error fetching cylinder type details:", error);
      setCurrentType(type);
      setViewShow(true);
    }
  };

  // Edit Open
  const handleEditOpen = (type) => {
    setCurrentType(type);
    setFormData({
      name: type.name || "",
      weight: type.weight || "",
      type: type.type || "",
      capacity_kg: type.capacity_kg || type.capacityKg || "",
      price: type.price || "",
      status: type.status || 1,
    });
    setEditShow(true);
  };

  // Update Cylinder Type
  const handleUpdate = async () => {
    if (!formData.name || !formData.weight || !formData.type || !formData.price) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill all required fields: Name, Weight, Type, and Price",
      });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        weight: parseFloat(formData.weight),
        type: formData.type,
        capacityKg: formData.capacity_kg ? parseFloat(formData.capacity_kg) : null,
        price: parseFloat(formData.price),
        status: parseInt(formData.status),
      };

      console.log("Updating cylinder type ID:", currentType.id);
      console.log("Updating cylinder type with payload:", payload);

      const response = await cylinderTypeApi.update(currentType.id, payload);
      console.log("Update response:", response.data);

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Cylinder type has been updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      setEditShow(false);
      setFormData({
        name: "",
        weight: "",
        type: "",
        capacity_kg: "",
        price: "",
        status: 1,
      });

      await fetchCylinderTypes();
    } catch (error) {
      console.error("Error updating cylinder type:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to update cylinder type",
      });
    }
  };

  // Toggle status
  const handleToggleStatus = async (type) => {
    const isActive = type.status === 1;
    const action = isActive ? "deactivate" : "activate";

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to ${action} "${type.name}"?`,
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
          status: isActive ? 0 : 1
        };
        await cylinderTypeApi.update(type.id, payload);

        Swal.fire({
          icon: "success",
          title: `${action.charAt(0).toUpperCase() + action.slice(1)}d!`,
          text: `Cylinder type has been ${action}d successfully`,
          timer: 1500,
          showConfirmButton: false,
        });

        await fetchCylinderTypes();
      } catch (error) {
        console.error("Error toggling status:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || `Failed to ${action} cylinder type`,
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

  // Format price
  const formatPrice = (price) => {
    if (!price || price === 0) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get type badge color
  const getTypeBadgeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "domestic":
        return "success";
      case "commercial":
        return "warning";
      case "industrial":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <div className="p-4" style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: "#1e293b", fontSize: "1.5rem" }}>
          <FaCube className="me-2" style={{ color: "#dc3545", fontSize: "1.3rem" }} />
          Cylinder Types
        </h3>
        <p className="text-muted mb-0" style={{ fontSize: "13px" }}>Manage your cylinder type database</p>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Total Types</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{totalTypes}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#e3f2fd", width: "36px", height: "36px" }}>
                  <FaCube size={16} style={{ color: "#3085d6" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Active Types</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{activeTypes}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#d1fae5", width: "36px", height: "36px" }}>
                  <FaToggleOn size={16} style={{ color: "#10b981" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Inactive Types</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{inactiveTypes}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#fee2e2", width: "36px", height: "36px" }}>
                  <FaToggleOff size={16} style={{ color: "#ef4444" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Domestic Types</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{domesticTypes}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#fff3e0", width: "36px", height: "36px" }}>
                  <FaTag size={16} style={{ color: "#f59e0b" }} />
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
              <h5 className="mb-0 fw-bold" style={{ fontSize: "1rem" }}>Cylinder Types Database</h5>
              <p className="text-muted small mb-0" style={{ fontSize: "11px" }}>Manage, edit, and monitor cylinder type information</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={fetchCylinderTypes} className="rounded-pill px-3" style={{ fontSize: "12px", padding: "5px 12px" }}>
                <FaSync className="me-1" size={12} /> Refresh
              </Button>
              <Button variant="primary" onClick={() => setShow(true)} className="rounded-pill px-4" style={{ background: "#1e3a6f", border: "none", fontSize: "12px", padding: "5px 16px" }}>
                <FaPlus className="me-2" size={12} /> Add New Cylinder Type
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
                    placeholder="Search by name, weight, or type..."
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
              <p className="mt-3 text-muted" style={{ fontSize: "13px" }}>Loading cylinder types...</p>
            </div>
          )}

          {/* Modern Table */}
          {!loading && (
            <div className="table-responsive px-4">
              <Table className="align-middle mb-0" style={{ minWidth: "1100px", fontSize: "12px" }}>
                <thead style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                  <tr className="text-muted">
                    <th className="py-2 ps-3" style={{ width: "60px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>#</th>
                    <th className="py-2" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Cylinder Type</th>
                    <th className="py-2" style={{ width: "100px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>Weight</th>
                    <th className="py-2" style={{ width: "100px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>Type</th>
                    <th className="py-2" style={{ width: "100px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>Capacity</th>
                    <th className="py-2" style={{ width: "100px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>Price</th>
                    <th className="py-2" style={{ width: "90px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>Status</th>
                    <th className="py-2" style={{ width: "100px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Created</th>
                    <th className="py-2 text-center" style={{ width: "170px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        <div className="text-muted">
                          <FaCube size={36} className="mb-2 opacity-25" />
                          <p style={{ fontSize: "13px" }}>No cylinder types found</p>
                          <Button variant="primary" size="sm" onClick={() => setShow(true)} className="rounded-pill" style={{ fontSize: "11px" }}>
                            <FaPlus className="me-1" size={10} /> Add your first cylinder type
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((t, i) => (
                      <tr key={t.id} className="border-bottom" style={{ borderBottom: "1px solid #f0f2f8" }}>
                        <td className="py-2 ps-3 text-center fw-bold text-muted" style={{ fontSize: "12px" }}>{indexOfFirstItem + i + 1}</td>
                        <td className="py-2">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: "32px", height: "32px", background: "transparent" }}
                            >
                              <FaCube size={14} style={{ color: "#667eea" }} />
                            </div>
                            <div>
                              <div className="fw-semibold" style={{ fontSize: "13px" }}>{t.name}</div>
                              <div className="small text-muted" style={{ fontSize: "10px" }}>ID: {t.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 text-center">
                          <Badge bg="secondary" className="px-2 py-1 rounded-pill" style={{ fontSize: "11px", fontWeight: 500 }}>
                            <FaWeightHanging className="me-1" size={10} />
                            {t.weight} kg
                          </Badge>
                        </td>
                        <td className="py-2 text-center">
                          <Badge bg={getTypeBadgeColor(t.type)} className="px-2 py-1 rounded-pill" style={{ fontSize: "11px", fontWeight: 500 }}>
                            <FaTag className="me-1" size={10} />
                            {t.type || "N/A"}
                          </Badge>
                        </td>
                        <td className="py-2 text-center">
                          {t.capacity_kg || t.capacityKg ? (
                            <Badge bg="info" className="px-2 py-1 rounded-pill" style={{ fontSize: "11px", fontWeight: 500 }}>
                              <FaBoxes className="me-1" size={10} />
                              {t.capacity_kg || t.capacityKg} kg
                            </Badge>
                          ) : (
                            <span className="text-muted" style={{ fontSize: "11px" }}>—</span>
                          )}
                        </td>
                        <td className="py-2 text-center">
                          <Badge bg="info" className="px-2 py-1 rounded-pill" style={{ fontSize: "11px", fontWeight: 500 }}>
                            <FaRupeeSign className="me-1" size={10} />
                            {formatPrice(t.price)}
                          </Badge>
                        </td>
                        <td className="py-2 text-center">{getStatusBadge(t.status)}</td>
                        <td className="py-2">
                          <small className="text-muted" style={{ fontSize: "11px" }}>
                            <FaCalendarAlt className="me-1" size={9} style={{ color: "#6c757d" }} />
                            {formatDate(t.created_at)}
                          </small>
                        </td>
                        <td className="py-2">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              size="sm"
                              variant="outline-info"
                              onClick={() => handleView(t)}
                              title="View Details"
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: "#0dcaf0", color: "#0dcaf0" }}
                            >
                              <FaEye size={12} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-warning"
                              onClick={() => handleEditOpen(t)}
                              title="Edit Cylinder Type"
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: "#ffc107", color: "#ffc107" }}
                            >
                              <FaEdit size={12} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => handleToggleStatus(t)}
                              title={t.status === 1 ? "Deactivate" : "Activate"}
                              disabled={toggleLoading}
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: t.status === 1 ? "#dc3545" : "#198754", color: t.status === 1 ? "#dc3545" : "#198754" }}
                            >
                              {toggleLoading ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : t.status === 1 ? (
                                <FaToggleOn size={12} />
                              ) : (
                                <FaToggleOff size={12} />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(t.id, t.name)}
                              title="Delete Cylinder Type"
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
          {!loading && filteredTypes.length > 0 && totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top mt-2">
              <div className="text-muted" style={{ fontSize: "11px" }}>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTypes.length)} of {filteredTypes.length} entries
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
            <FaPlus className="me-2" style={{ color: "#1e3a6f", fontSize: "14px" }} /> Add New Cylinder Type
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          <Form>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Cylinder Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter cylinder name (e.g., Domestic Cylinder, Commercial Cylinder)"
                value={formData.name}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Weight (kg) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="weight"
                placeholder="Enter weight in kg (e.g., 14.2, 19, 47.5)"
                value={formData.weight}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Cylinder Type <span className="text-danger">*</span></Form.Label>
              <Form.Select name="type" value={formData.type} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }}>
                <option value="">Select cylinder type</option>
                <option value="domestic">Domestic</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
              </Form.Select>
              <Form.Text className="text-muted" style={{ fontSize: "11px" }}>Select the cylinder category type</Form.Text>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Capacity (kg)</Form.Label>
              <Form.Control
                type="number"
                name="capacity_kg"
                step="0.01"
                placeholder="Enter capacity in kg"
                value={formData.capacity_kg}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              />
              <Form.Text className="text-muted" style={{ fontSize: "11px" }}>Optional - leave blank if same as weight</Form.Text>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Price (₹) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                name="price"
                placeholder="Enter price in rupees"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="rounded-3"
                style={{ fontSize: "13px" }}
              />
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
          <Button variant="primary" onClick={handleAdd} className="rounded-pill px-3" style={{ background: "#1e3a6f", fontSize: "12px" }}>Save Cylinder Type</Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={viewShow} onHide={() => setViewShow(false)} centered size="lg">
        <Modal.Header closeButton className="bg-white border-0 pt-3 px-4">
          <Modal.Title className="fw-bold" style={{ fontSize: "1.1rem" }}>
            <FaEye className="me-2" style={{ color: "#0dcaf0", fontSize: "14px" }} /> Cylinder Type Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          {currentType && (
            <>
              <div className="text-center mb-3">
                <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2" style={{ width: "60px", height: "60px", background: "transparent" }}>
                  <FaCube size={30} style={{ color: "#667eea" }} />
                </div>
                <h4 className="mb-0" style={{ fontSize: "1.2rem" }}>{currentType.name}</h4>
                <Badge bg="secondary" className="mt-1" style={{ fontSize: "11px" }}>ID: #{currentType.id}</Badge>
              </div>
              <hr className="my-2" />
              <div className="row" style={{ fontSize: "12px" }}>
                <div className="col-md-6 mb-2">
                  <strong>Cylinder Name:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{currentType.name}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Weight:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{currentType.weight} kg</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Cylinder Type:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{currentType.type || "N/A"}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Capacity:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{currentType.capacity_kg || currentType.capacityKg ? `${currentType.capacity_kg || currentType.capacityKg} kg` : "N/A"}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Price:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{formatPrice(currentType.price)}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Status:</strong>
                  <div className="mt-1">{getStatusBadge(currentType.status)}</div>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Created At:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{formatDate(currentType.created_at)}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Last Updated:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{formatDate(currentType.updated_at)}</p>
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
            <FaEdit className="me-2" style={{ color: "#ffc107", fontSize: "14px" }} /> Edit Cylinder Type
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          <Form>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Cylinder Name <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Weight (kg) <span className="text-danger">*</span></Form.Label>
              <Form.Control type="number" step="0.01" name="weight" value={formData.weight} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Cylinder Type <span className="text-danger">*</span></Form.Label>
              <Form.Select name="type" value={formData.type} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }}>
                <option value="">Select cylinder type</option>
                <option value="domestic">Domestic</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Capacity (kg)</Form.Label>
              <Form.Control type="number" name="capacity_kg" step="0.01" placeholder="Enter capacity in kg" value={formData.capacity_kg} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Price (₹) <span className="text-danger">*</span></Form.Label>
              <Form.Control type="number" name="price" value={formData.price} onChange={handleChange} min="0" step="0.01" className="rounded-3" style={{ fontSize: "13px" }} />
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
          <Button variant="warning" onClick={handleUpdate} className="rounded-pill px-3" style={{ fontSize: "12px" }}>Update Cylinder Type</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CylinderTypes;