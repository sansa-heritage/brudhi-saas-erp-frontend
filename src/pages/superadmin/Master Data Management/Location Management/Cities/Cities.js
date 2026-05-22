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
  FaCity,
  FaBuilding,
  FaCalendarAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { cityApi } from "../../../../../api/superadmin/masterData.api";
import { stateApi } from "../../../../../api/superadmin/masterData.api";

const Cities = () => {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [viewShow, setViewShow] = useState(false);
  const [editShow, setEditShow] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedState, setSelectedState] = useState("");

  const [currentCity, setCurrentCity] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    stateId: "",
    status: 1,
  });

  // Calculate summary stats
  const totalCities = filteredCities.length;
  const activeCities = filteredCities.filter(c => c.status === 1).length;
  const inactiveCities = filteredCities.filter(c => c.status === 0).length;

  // Fetch states on component mount
  useEffect(() => {
    fetchStates();
  }, []);

  // Fetch cities when selected state changes
  useEffect(() => {
    fetchCities();
  }, [selectedState]);

  // Filter cities based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredCities(cities);
    } else {
      const filtered = cities.filter(
        (city) =>
          city.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (city.state_name &&
            city.state_name.toLowerCase().includes(searchTerm.toLowerCase())),
      );
      setFilteredCities(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, cities]);

  // Fetch all states
  const fetchStates = async () => {
    setStatesLoading(true);
    try {
      const response = await stateApi.getAll();
      console.log("States response:", response.data);

      let statesData = [];

      if (response.data && response.data.success) {
        if (response.data.data && response.data.data.data) {
          statesData = response.data.data.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          statesData = response.data.data;
        } else if (Array.isArray(response.data.data)) {
          statesData = response.data.data;
        }
      } else if (response.data && Array.isArray(response.data)) {
        statesData = response.data;
      }
      console.log("Extracted states:", statesData);
      setStates(statesData);
    } catch (error) {
      console.error("Error fetching states:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch states",
      });
    } finally {
      setStatesLoading(false);
    }
  };

  // Fetch all cities
  const fetchCities = async () => {
    setLoading(true);
    try {
      let response;
      if (selectedState) {
        response = await cityApi.getDropdown(selectedState);
      } else {
        response = await cityApi.getAll();
      }

      console.log("Cities response:", response.data);

      let citiesData = [];

      if (response.data && response.data.success) {
        if (response.data.data && response.data.data.data) {
          citiesData = response.data.data.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          citiesData = response.data.data;
        } else if (Array.isArray(response.data.data)) {
          citiesData = response.data.data;
        }
      } else if (response.data && Array.isArray(response.data)) {
        citiesData = response.data;
      }
      console.log("Extracted cities:", citiesData);
      setCities(citiesData);
      setFilteredCities(citiesData);
    } catch (error) {
      console.error("Error fetching cities:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to fetch cities",
      });
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCities.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Get state name by ID
  const getStateName = (stateId) => {
    const state = states.find((s) => s.id === Number(stateId));
    return state ? state.name : "N/A";
  };

  // Get random color for badges
  const getBadgeColor = (text) => {
    const colors = [
      "primary",
      "success",
      "danger",
      "warning",
      "info",
      "secondary",
      "dark",
    ];
    const index = text ? text.length % colors.length : 0;
    return colors[index];
  };

  // Add City
  const handleAdd = async () => {
    if (!formData.name || !formData.stateId) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill all required fields (Name, State)",
      });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        stateId: parseInt(formData.stateId),
        status: parseInt(formData.status),
      };

      console.log("Creating city with payload:", payload);
      const response = await cityApi.create(payload);
      console.log("Create response:", response.data);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "City added successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      setFormData({ name: "", stateId: "", status: 1 });
      setShow(false);
      await fetchCities();
    } catch (error) {
      console.error("Error adding city:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to add city",
      });
    }
  };

  // Delete City
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
        await cityApi.delete(id);

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "City has been deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });

        await fetchCities();
      } catch (error) {
        console.error("Error deleting city:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Failed to delete city",
        });
      }
    }
  };

  // View City
  const handleView = async (city) => {
    try {
      const response = await cityApi.getById(city.id);
      let fullData = city;
      if (response.data && response.data.data) {
        fullData = response.data.data;
      } else if (response.data) {
        fullData = response.data;
      }
      setCurrentCity(fullData);
      setViewShow(true);
    } catch (error) {
      console.error("Error fetching city details:", error);
      setCurrentCity(city);
      setViewShow(true);
    }
  };

  // Edit Open
  const handleEditOpen = (city) => {
    setCurrentCity(city);
    setFormData({
      name: city.name,
      stateId: city.state_id,
      status: city.status,
    });
    setEditShow(true);
  };

  // Update City
  const handleUpdate = async () => {
    if (!formData.name || !formData.stateId) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill all required fields (Name, State)",
      });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        stateId: parseInt(formData.stateId),
        status: parseInt(formData.status),
      };

      console.log("Updating city ID:", currentCity.id);
      console.log("Updating city with payload:", payload);

      const response = await cityApi.update(currentCity.id, payload);
      console.log("Update response:", response.data);

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "City has been updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      setEditShow(false);
      setFormData({ name: "", stateId: "", status: 1 });
      await fetchCities();
    } catch (error) {
      console.error("Error updating city:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to update city",
      });
    }
  };

  // Toggle status
  const handleToggleStatus = async (city) => {
    const isActive = city.status === 1;
    const action = isActive ? "deactivate" : "activate";

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to ${action} "${city.name}"?`,
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
          ...city,
          status: isActive ? 0 : 1,
        };
        await cityApi.update(city.id, payload);

        Swal.fire({
          icon: "success",
          title: `${action.charAt(0).toUpperCase() + action.slice(1)}d!`,
          text: `City has been ${action}d successfully`,
          timer: 1500,
          showConfirmButton: false,
        });

        await fetchCities();
      } catch (error) {
        console.error("Error toggling status:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || `Failed to ${action} city`,
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

  // Clear filters
  const clearFilters = () => {
    setSelectedState("");
    setSearchTerm("");
  };

  return (
    <div className="p-4" style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: "#1e293b", fontSize: "1.5rem" }}>
          <FaCity className="me-2" style={{ color: "#dc3545", fontSize: "1.3rem" }} />
          Cities
        </h3>
        <p className="text-muted mb-0" style={{ fontSize: "13px" }}>Manage your city database</p>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Total Cities</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{totalCities}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#e3f2fd", width: "36px", height: "36px" }}>
                  <FaCity size={16} style={{ color: "#3085d6" }} />
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
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Active Cities</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{activeCities}</h4>
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
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Total States</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{states.length}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#fff3e0", width: "36px", height: "36px" }}>
                  <FaBuilding size={16} style={{ color: "#f59e0b" }} />
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
              <h5 className="mb-0 fw-bold" style={{ fontSize: "1rem" }}>Cities Database</h5>
              <p className="text-muted small mb-0" style={{ fontSize: "11px" }}>Manage, edit, and monitor city information</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={fetchCities} className="rounded-pill px-3" style={{ fontSize: "12px", padding: "5px 12px" }}>
                <FaSync className="me-1" size={12} /> Refresh
              </Button>
              <Button variant="primary" onClick={() => setShow(true)} className="rounded-pill px-4" style={{ background: "#1e3a6f", border: "none", fontSize: "12px", padding: "5px 16px" }}>
                <FaPlus className="me-2" size={12} /> Add New City
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {/* Search and Filter Bar */}
          <div className="px-4 pt-3 pb-2">
            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
              <div className="flex-grow-1" style={{ maxWidth: "400px" }}>
                <InputGroup className="rounded-pill overflow-hidden shadow-sm">
                  <InputGroup.Text className="bg-white border-end-0" style={{ fontSize: "12px" }}>
                    <FaSearch className="text-muted" size={12} />
                  </InputGroup.Text>
                  <FormControl
                    placeholder="Search cities by name or state..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                    style={{ fontSize: "13px" }}
                  />
                </InputGroup>
              </div>
              <div className="d-flex gap-2">
                <Form.Select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="rounded-pill px-3"
                  style={{ width: "200px", fontSize: "12px" }}
                >
                  <option value="">All States</option>
                  {states.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </Form.Select>
                {(selectedState || searchTerm) && (
                  <Button variant="outline-secondary" onClick={clearFilters} className="rounded-pill px-3" style={{ fontSize: "12px" }}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Loading Spinner */}
          {(loading || statesLoading) && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: "2rem", height: "2rem" }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted" style={{ fontSize: "13px" }}>Loading cities...</p>
            </div>
          )}

          {/* Modern Table */}
          {!loading && (
            <div className="table-responsive px-4">
              <Table className="align-middle mb-0" style={{ minWidth: "900px", fontSize: "12px" }}>
                <thead style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                  <tr className="text-muted">
                    <th className="py-2 ps-3" style={{ width: "60px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>#</th>
                    <th className="py-2" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>City Name</th>
                    <th className="py-2" style={{ width: "200px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>State</th>
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
                          <FaCity size={36} className="mb-2 opacity-25" />
                          <p style={{ fontSize: "13px" }}>No cities found</p>
                          <Button variant="primary" size="sm" onClick={() => setShow(true)} className="rounded-pill" style={{ fontSize: "11px" }}>
                            <FaPlus className="me-1" size={10} /> Add your first city
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((c, i) => (
                      <tr key={c.id} className="border-bottom" style={{ borderBottom: "1px solid #f0f2f8" }}>
                        <td className="py-2 ps-3 text-center fw-bold text-muted" style={{ fontSize: "12px" }}>{indexOfFirstItem + i + 1}</td>
                        <td className="py-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "32px", height: "32px", background: "transparent" }}>
                              <FaCity size={14} style={{ color: "#667eea" }} />
                            </div>
                            <div>
                              <div className="fw-semibold" style={{ fontSize: "13px" }}>{c.name}</div>
                              <div className="small text-muted" style={{ fontSize: "10px" }}>ID: {c.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2">
                          <Badge bg={getBadgeColor(c.state_name)} className="px-2 py-1 rounded-pill" style={{ fontSize: "11px", fontWeight: 500 }}>
                            <FaBuilding className="me-1" size={10} />
                            {c.state_name || getStateName(c.state_id)}
                          </Badge>
                        </td>
                        <td className="py-2 text-center">{getStatusBadge(c.status)}</td>
                        <td className="py-2">
                          <small className="text-muted" style={{ fontSize: "11px" }}>
                            <FaCalendarAlt className="me-1" size={9} style={{ color: "#6c757d" }} />
                            {formatDate(c.created_at)}
                          </small>
                        </td>
                        <td className="py-2">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              size="sm"
                              variant="outline-info"
                              onClick={() => handleView(c)}
                              title="View Details"
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: "#0dcaf0", color: "#0dcaf0" }}
                            >
                              <FaEye size={12} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-warning"
                              onClick={() => handleEditOpen(c)}
                              title="Edit City"
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: "#ffc107", color: "#ffc107" }}
                            >
                              <FaEdit size={12} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => handleToggleStatus(c)}
                              title={c.status === 1 ? "Deactivate" : "Activate"}
                              disabled={toggleLoading}
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: c.status === 1 ? "#dc3545" : "#198754", color: c.status === 1 ? "#dc3545" : "#198754" }}
                            >
                              {toggleLoading ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : c.status === 1 ? (
                                <FaToggleOn size={12} />
                              ) : (
                                <FaToggleOff size={12} />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(c.id, c.name)}
                              title="Delete City"
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
          {!loading && filteredCities.length > 0 && totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top mt-2">
              <div className="text-muted" style={{ fontSize: "11px" }}>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCities.length)} of {filteredCities.length} entries
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
            <FaPlus className="me-2" style={{ color: "#1e3a6f", fontSize: "14px" }} /> Add New City
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          <Form>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>City Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter city name (e.g., Mumbai)"
                value={formData.name}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>State <span className="text-danger">*</span></Form.Label>
              <Form.Select name="stateId" value={formData.stateId} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }}>
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted" style={{ fontSize: "11px" }}>Select the state this city belongs to</Form.Text>
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
          <Button variant="primary" onClick={handleAdd} className="rounded-pill px-3" style={{ background: "#1e3a6f", fontSize: "12px" }}>Save City</Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={viewShow} onHide={() => setViewShow(false)} centered>
        <Modal.Header closeButton className="bg-white border-0 pt-3 px-4">
          <Modal.Title className="fw-bold" style={{ fontSize: "1.1rem" }}>
            <FaEye className="me-2" style={{ color: "#0dcaf0", fontSize: "14px" }} /> City Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          {currentCity && (
            <>
              <div className="text-center mb-3">
                <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2" style={{ width: "60px", height: "60px", background: "transparent" }}>
                  <FaCity size={30} style={{ color: "#667eea" }} />
                </div>
                <h4 className="mb-0" style={{ fontSize: "1.2rem" }}>{currentCity.name}</h4>
                <Badge bg="secondary" className="mt-1" style={{ fontSize: "11px" }}>{currentCity.state_name || getStateName(currentCity.state_id)}</Badge>
              </div>
              <hr className="my-2" />
              <div className="row" style={{ fontSize: "12px" }}>
                <div className="col-md-6 mb-2">
                  <strong>ID:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>#{currentCity.id}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>State ID:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{currentCity.state_id}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Status:</strong>
                  <div className="mt-1">{getStatusBadge(currentCity.status)}</div>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Created At:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{formatDate(currentCity.created_at)}</p>
                </div>
                <div className="col-md-12 mb-2">
                  <strong>Last Updated:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{formatDate(currentCity.updated_at)}</p>
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
            <FaEdit className="me-2" style={{ color: "#ffc107", fontSize: "14px" }} /> Edit City
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          <Form>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>City Name <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>State <span className="text-danger">*</span></Form.Label>
              <Form.Select name="stateId" value={formData.stateId} onChange={handleChange} className="rounded-3" style={{ fontSize: "13px" }}>
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Form.Select>
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
          <Button variant="warning" onClick={handleUpdate} className="rounded-pill px-3" style={{ fontSize: "12px" }}>Update City</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Cities;