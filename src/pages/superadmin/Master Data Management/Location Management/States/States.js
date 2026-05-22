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
  FaBuilding,
  FaGlobe,
  FaCode,
  FaCalendarAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
  stateApi,
  countryApi,
} from "../../../../../api/superadmin/masterData.api";

const States = () => {
  const [states, setStates] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [viewShow, setViewShow] = useState(false);
  const [editShow, setEditShow] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedCountry, setSelectedCountry] = useState("");

  const [currentState, setCurrentState] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    countryId: "",
    status: 1,
  });

  // Calculate summary stats
  const totalStates = filteredStates.length;
  const activeStates = filteredStates.filter(s => s.status === 1).length;
  const inactiveStates = filteredStates.filter(s => s.status === 0).length;

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch states when selected country changes
  useEffect(() => {
    fetchStates();
  }, [selectedCountry]);

  // Filter states based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredStates(states);
    } else {
      const filtered = states.filter(
        (state) =>
          (state.name &&
            state.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (state.code &&
            state.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (state.country_name &&
            state.country_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())),
      );
      setFilteredStates(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, states]);

  // Fetch all countries with cache clearing
  const fetchCountries = async () => {
    setCountriesLoading(true);
    try {
      const response = await countryApi.getAll();
      console.log("Countries response:", response.data);

      let countriesData = [];

      if (response.data && response.data.success) {
        if (response.data.data && response.data.data.data) {
          countriesData = response.data.data.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          countriesData = response.data.data;
        } else if (Array.isArray(response.data.data)) {
          countriesData = response.data.data;
        }
      } else if (response.data && Array.isArray(response.data)) {
        countriesData = response.data;
      } else if (Array.isArray(response)) {
        countriesData = response;
      }

      console.log("Extracted countries:", countriesData);
      setCountries([...countriesData]);
    } catch (error) {
      console.error("Error fetching countries:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch countries",
      });
    } finally {
      setCountriesLoading(false);
    }
  };

  // Fetch all states
  const fetchStates = async () => {
    setLoading(true);
    try {
      const params = selectedCountry ? { countryId: selectedCountry } : {};
      console.log("Fetching states with params:", params);
      const response = await stateApi.getAll(params);
      console.log("States response:", response.data);

      let statesData = [];

      if (response.data && response.data.success) {
        if (response.data.data && Array.isArray(response.data.data)) {
          statesData = response.data.data;
        } else if (Array.isArray(response.data.data)) {
          statesData = response.data.data;
        }
      } else if (response.data && Array.isArray(response.data)) {
        statesData = response.data;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        statesData = response.data.data;
      }

      console.log("Extracted states:", statesData);

      const statesWithCountryNames = statesData.map((state) => ({
        ...state,
        country_name: getCountryNameFromList(state.country_id),
      }));

      setStates(statesWithCountryNames);
      setFilteredStates(statesWithCountryNames);
    } catch (error) {
      console.error("Error fetching states:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to fetch states",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get country name from current countries list
  const getCountryNameFromList = (countryId) => {
    const country = countries.find((c) => c.id === Number(countryId));
    return country ? country.name : null;
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStates.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Get country name by ID
  const getCountryName = (countryId) => {
    const country = countries.find((c) => c.id === Number(countryId));
    return country ? country.name : "N/A";
  };

  // Get country code by ID
  const getCountryCode = (countryId) => {
    const country = countries.find((c) => c.id === Number(countryId));
    return country ? country.code : "";
  };

  // Get country flag
  const getCountryFlag = (countryCode) => {
    const flags = {
      IN: "🇮🇳",
      US: "🇺🇸",
      GB: "🇬🇧",
      CA: "🇨🇦",
      AU: "🇦🇺",
      FR: "🇫🇷",
      DE: "🇩🇪",
      JP: "🇯🇵",
      CN: "🇨🇳",
      BR: "🇧🇷",
      RU: "🇷🇺",
      ZA: "🇿🇦",
    };
    return flags[countryCode] || "🌍";
  };

  // Add State
  const handleAdd = async () => {
    if (!formData.name || !formData.code || !formData.countryId) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill all required fields (Name, Code, Country)",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        countryId: parseInt(formData.countryId),
        status: parseInt(formData.status),
      };

      console.log("Creating state with payload:", payload);
      const response = await stateApi.create(payload);
      console.log("Create response:", response.data);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "State added successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      setFormData({ name: "", code: "", countryId: "", status: 1 });
      setShow(false);

      await fetchCountries();
      await fetchStates();
    } catch (error) {
      console.error("Error adding state:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to add state",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete State
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
        await stateApi.delete(id);

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "State has been deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });

        await fetchStates();
      } catch (error) {
        console.error("Error deleting state:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Failed to delete state",
        });
      }
    }
  };

  // View State
  const handleView = (state) => {
    setCurrentState(state);
    setViewShow(true);
  };

  // Edit Open
  const handleEditOpen = (state) => {
    setCurrentState(state);
    setFormData({
      name: state.name,
      code: state.code || "",
      countryId: state.country_id,
      status: state.status,
    });
    setEditShow(true);
  };

  // Update State
  const handleUpdate = async () => {
    if (!formData.name || !formData.code || !formData.countryId) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill all required fields (Name, Code, Country)",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        countryId: parseInt(formData.countryId),
        status: parseInt(formData.status),
      };

      console.log("Updating state ID:", currentState.id);
      console.log("Updating state with payload:", payload);

      const response = await stateApi.update(currentState.id, payload);
      console.log("Update response:", response.data);

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "State has been updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      setEditShow(false);
      setFormData({ name: "", code: "", countryId: "", status: 1 });

      await fetchCountries();
      await fetchStates();
    } catch (error) {
      console.error("Error updating state:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to update state",
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (state) => {
    const isActive = state.status === 1;
    const action = isActive ? "deactivate" : "activate";

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to ${action} "${state.name}"?`,
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
          ...state,
          status: isActive ? 0 : 1,
        };
        await stateApi.update(state.id, payload);

        Swal.fire({
          icon: "success",
          title: `${action.charAt(0).toUpperCase() + action.slice(1)}d!`,
          text: `State has been ${action}d successfully`,
          timer: 1500,
          showConfirmButton: false,
        });

        await fetchStates();
      } catch (error) {
        console.error("Error toggling status:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || `Failed to ${action} state`,
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
    setSelectedCountry("");
    setSearchTerm("");
  };

  return (
    <div className="p-4" style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: "#1e293b", fontSize: "1.5rem" }}>
          <FaBuilding className="me-2" style={{ color: "#dc3545", fontSize: "1.3rem" }} />
          States
        </h3>
        <p className="text-muted mb-0" style={{ fontSize: "13px" }}>Manage your state database</p>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Total States</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{totalStates}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#e3f2fd", width: "36px", height: "36px" }}>
                  <FaBuilding size={16} style={{ color: "#3085d6" }} />
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
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Active States</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{activeStates}</h4>
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
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Inactive States</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{inactiveStates}</h4>
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
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Total Countries</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{countries.length}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#fff3e0", width: "36px", height: "36px" }}>
                  <FaGlobe size={16} style={{ color: "#f59e0b" }} />
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
              <h5 className="mb-0 fw-bold" style={{ fontSize: "1rem" }}>States Database</h5>
              <p className="text-muted small mb-0" style={{ fontSize: "11px" }}>Manage, edit, and monitor state information</p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  fetchCountries();
                  fetchStates();
                }}
                className="rounded-pill px-3"
                style={{ fontSize: "12px", padding: "5px 12px" }}
              >
                <FaSync className="me-1" size={12} /> Refresh
              </Button>
              <Button
                variant="primary"
                onClick={() => setShow(true)}
                className="rounded-pill px-4"
                style={{ background: "#1e3a6f", border: "none", fontSize: "12px", padding: "5px 16px" }}
              >
                <FaPlus className="me-2" size={12} /> Add New State
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
                    placeholder="Search by state name, code or country..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                    style={{ fontSize: "13px" }}
                  />
                </InputGroup>
              </div>
              <div className="d-flex gap-2">
                <Form.Select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="rounded-pill px-3"
                  style={{ width: "220px", fontSize: "12px" }}
                >
                  <option value="">All Countries</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {getCountryFlag(country.code)} {country.name}
                    </option>
                  ))}
                </Form.Select>
                {(selectedCountry || searchTerm) && (
                  <Button
                    variant="outline-secondary"
                    onClick={clearFilters}
                    className="rounded-pill px-3"
                    style={{ fontSize: "12px" }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Loading Spinner */}
          {(loading || countriesLoading) && (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
                style={{ width: "2rem", height: "2rem" }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted" style={{ fontSize: "13px" }}>Loading states...</p>
            </div>
          )}

          {/* Modern Table */}
          {!loading && (
            <div className="table-responsive px-4">
              <Table className="align-middle mb-0" style={{ minWidth: "900px", fontSize: "12px" }}>
                <thead style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                  <tr className="text-muted">
                    <th className="py-2 ps-3" style={{ width: "60px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>#</th>
                    <th className="py-2" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>State Name</th>
                    <th className="py-2" style={{ width: "100px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Code</th>
                    <th className="py-2" style={{ width: "180px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Country</th>
                    <th className="py-2" style={{ width: "100px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>Status</th>
                    <th className="py-2" style={{ width: "110px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Created</th>
                    <th className="py-2 text-center" style={{ width: "170px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <div className="text-muted">
                          <FaBuilding size={36} className="mb-2 opacity-25" />
                          <p style={{ fontSize: "13px" }}>No states found</p>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setShow(true)}
                            className="rounded-pill"
                            style={{ fontSize: "11px" }}
                          >
                            <FaPlus className="me-1" size={10} /> Add your first state
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((s, i) => (
                      <tr key={s.id} className="border-bottom" style={{ borderBottom: "1px solid #f0f2f8" }}>
                        <td className="py-2 ps-3 text-center fw-bold text-muted" style={{ fontSize: "12px" }}>{indexOfFirstItem + i + 1}</td>
                        <td className="py-2">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: "32px", height: "32px", background: "transparent" }}
                            >
                              <FaBuilding size={14} style={{ color: "#667eea" }} />
                            </div>
                            <div>
                              <div className="fw-semibold" style={{ fontSize: "13px" }}>{s.name}</div>
                              <div className="small text-muted" style={{ fontSize: "10px" }}>ID: {s.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2">
                          <Badge
                            bg="secondary"
                            className="px-2 py-1 rounded-pill"
                            style={{ fontSize: "11px", fontWeight: 500 }}
                          >
                            <FaCode className="me-1" size={10} />
                            {s.code}
                          </Badge>
                        </td>
                        <td className="py-2">
                          <Badge bg="info" className="px-2 py-1 rounded-pill" style={{ fontSize: "11px", fontWeight: 500, background: "#0dcaf0" }}>
                            <span className="me-1">{getCountryFlag(getCountryCode(s.country_id))}</span>
                            {s.country_name || getCountryName(s.country_id)}
                          </Badge>
                        </td>
                        <td className="py-2 text-center">{getStatusBadge(s.status)}</td>
                        <td className="py-2">
                          <small className="text-muted" style={{ fontSize: "11px" }}>
                            <FaCalendarAlt className="me-1" size={9} style={{ color: "#6c757d" }} />
                            {formatDate(s.created_at)}
                          </small>
                        </td>
                        <td className="py-2">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              size="sm"
                              variant="outline-info"
                              onClick={() => handleView(s)}
                              title="View Details"
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: "#0dcaf0", color: "#0dcaf0" }}
                            >
                              <FaEye size={12} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-warning"
                              onClick={() => handleEditOpen(s)}
                              title="Edit State"
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: "#ffc107", color: "#ffc107" }}
                            >
                              <FaEdit size={12} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => handleToggleStatus(s)}
                              title={s.status === 1 ? "Deactivate" : "Activate"}
                              disabled={toggleLoading}
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: s.status === 1 ? "#dc3545" : "#198754", color: s.status === 1 ? "#dc3545" : "#198754" }}
                            >
                              {toggleLoading ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : s.status === 1 ? (
                                <FaToggleOn size={12} />
                              ) : (
                                <FaToggleOff size={12} />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(s.id, s.name)}
                              title="Delete State"
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
          {!loading && filteredStates.length > 0 && totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top mt-2">
              <div className="text-muted" style={{ fontSize: "11px" }}>
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredStates.length)} of{" "}
                {filteredStates.length} entries
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
            <FaPlus className="me-2" style={{ color: "#1e3a6f", fontSize: "14px" }} /> Add New State
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          <Form>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>
                State Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter state name (e.g., Maharashtra)"
                value={formData.name}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>
                State Code <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="code"
                placeholder="Enter state code (e.g., MH)"
                value={formData.code}
                onChange={handleChange}
                maxLength="3"
                style={{ textTransform: "uppercase", fontSize: "13px" }}
                className="rounded-3"
              />
              <Form.Text className="text-muted" style={{ fontSize: "11px" }}>
                2-3 character state code (e.g., MH, DL, KA)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>
                Country <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="countryId"
                value={formData.countryId}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getCountryFlag(c.code)} {c.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pb-3 px-4">
          <Button variant="light" onClick={() => setShow(false)} className="rounded-pill px-3" style={{ fontSize: "12px" }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAdd} disabled={loading} className="rounded-pill px-3" style={{ background: "#1e3a6f", fontSize: "12px" }}>
            {loading ? "Saving..." : "Save State"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={viewShow} onHide={() => setViewShow(false)} centered>
        <Modal.Header closeButton className="bg-white border-0 pt-3 px-4">
          <Modal.Title className="fw-bold" style={{ fontSize: "1.1rem" }}>
            <FaEye className="me-2" style={{ color: "#0dcaf0", fontSize: "14px" }} /> State Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          {currentState && (
            <>
              <div className="text-center mb-3">
                <div
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2"
                  style={{ width: "60px", height: "60px", background: "transparent" }}
                >
                  <FaBuilding size={30} style={{ color: "#667eea" }} />
                </div>
                <h4 className="mb-0" style={{ fontSize: "1.2rem" }}>{currentState.name}</h4>
                <Badge bg="secondary" className="mt-1" style={{ fontSize: "11px" }}>
                  <FaCode className="me-1" size={10} /> Code: {currentState.code}
                </Badge>
              </div>
              <hr className="my-2" />
              <div className="row" style={{ fontSize: "12px" }}>
                <div className="col-md-6 mb-2">
                  <strong>ID:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>#{currentState.id}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Country:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                    {getCountryFlag(getCountryCode(currentState.country_id))}{" "}
                    {currentState.country_name || getCountryName(currentState.country_id)}
                  </p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Status:</strong>
                  <div className="mt-1">{getStatusBadge(currentState.status)}</div>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Created At:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{formatDate(currentState.created_at)}</p>
                </div>
                <div className="col-md-12 mb-2">
                  <strong>Last Updated:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{formatDate(currentState.updated_at)}</p>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pb-3 px-4">
          <Button variant="secondary" onClick={() => setViewShow(false)} className="rounded-pill px-3" style={{ fontSize: "12px" }}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={editShow} onHide={() => setEditShow(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-white border-0 pt-3 px-4">
          <Modal.Title className="fw-bold" style={{ fontSize: "1.1rem" }}>
            <FaEdit className="me-2" style={{ color: "#ffc107", fontSize: "14px" }} /> Edit State
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          <Form>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>
                State Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>
                State Code <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                maxLength="3"
                style={{ textTransform: "uppercase", fontSize: "13px" }}
                className="rounded-3"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>
                Country <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="countryId"
                value={formData.countryId}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getCountryFlag(c.code)} {c.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pb-3 px-4">
          <Button variant="light" onClick={() => setEditShow(false)} className="rounded-pill px-3" style={{ fontSize: "12px" }}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleUpdate} disabled={loading} className="rounded-pill px-3" style={{ fontSize: "12px" }}>
            {loading ? "Updating..." : "Update State"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default States;