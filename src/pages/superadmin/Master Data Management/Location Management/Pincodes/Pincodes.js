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
  FaMapMarkerAlt,
  FaCity,
  FaBuilding,
  FaLocationArrow,
  FaMapPin,
  FaCalendarAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
  pincodeApi,
  stateApi,
  cityApi,
} from "../../../../../api/superadmin/masterData.api";

const Pincodes = () => {
  const [pincodes, setPincodes] = useState([]);
  const [filteredPincodes, setFilteredPincodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [viewShow, setViewShow] = useState(false);
  const [editShow, setEditShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [editCities, setEditCities] = useState([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [editCitiesLoading, setEditCitiesLoading] = useState(false);

  const [currentPincode, setCurrentPincode] = useState(null);

  const [dropdownFormData, setDropdownFormData] = useState({
    code: "",
    stateId: "",
    cityId: "",
    status: 1,
  });

  const [editFormData, setEditFormData] = useState({
    code: "",
    stateId: "",
    cityId: "",
    status: 1,
  });

  const totalPincodes = filteredPincodes.length;
  const activePincodes = filteredPincodes.filter((p) => p.status === 1).length;
  const inactivePincodes = filteredPincodes.filter((p) => p.status === 0).length;
  const uniqueStates = new Set(filteredPincodes.map((p) => p.state)).size;

  useEffect(() => {
    fetchStates();
    fetchCities();
  }, []);

  useEffect(() => {
    if (dropdownFormData.stateId) {
      const filtered = allCities.filter(
        (city) => city.state_id === parseInt(dropdownFormData.stateId),
      );
      setCities(filtered);
      setDropdownFormData((prev) => ({ ...prev, cityId: "" }));
    } else {
      setCities([]);
    }
  }, [dropdownFormData.stateId]);

  useEffect(() => {
    if (editFormData.stateId) {
      const filtered = allCities.filter(
        (city) => city.state_id === parseInt(editFormData.stateId),
      );
      setEditCities(filtered);
    } else {
      setEditCities([]);
    }
  }, [editFormData.stateId]);

  useEffect(() => {
    fetchPincodes();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredPincodes(pincodes);
    } else {
      const filtered = pincodes.filter(
        (pincode) =>
          (pincode.code &&
            pincode.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (pincode.city &&
            pincode.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (pincode.state &&
            pincode.state.toLowerCase().includes(searchTerm.toLowerCase())),
      );
      setFilteredPincodes(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, pincodes]);

  const [allCities, setAllCities] = useState([]);

  const fetchStates = async () => {
    setStatesLoading(true);
    try {
      const response = await stateApi.getAll();
      let statesData = [];

      if (response?.data?.success && response?.data?.data) {
        statesData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        statesData = response.data;
      } else if (Array.isArray(response)) {
        statesData = response;
      }

      setStates(statesData || []);
      console.log("States loaded:", statesData);
    } catch (error) {
      console.error("Error fetching states:", error);
      setStates([]);
    } finally {
      setStatesLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await cityApi.getAll();
      let citiesData = [];

      if (response?.data?.success && response?.data?.data) {
        citiesData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        citiesData = response.data;
      } else if (Array.isArray(response)) {
        citiesData = response;
      }

      setAllCities(citiesData || []);
      console.log("Cities loaded:", citiesData);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setAllCities([]);
    }
  };

  const fetchPincodes = async () => {
    setLoading(true);
    try {
      const response = await pincodeApi.getAll();
      console.log("Pincodes API Response:", response);

      let pincodesData = [];

      if (response?.data?.success && response?.data?.data) {
        pincodesData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        pincodesData = response.data;
      } else if (Array.isArray(response)) {
        pincodesData = response;
      }

      const formattedData = pincodesData.map((item) => ({
        id: item.id,
        code: item.pincode,
        city: item.city_name,
        state: item.state_name,
        country: item.country_name,
        city_id: item.city_id,
        state_id: item.state_id,
        country_id: item.country_id,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      console.log("Formatted pincodes:", formattedData);
      setPincodes(formattedData);
      setFilteredPincodes(formattedData);
    } catch (error) {
      console.error("Error fetching pincodes:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to fetch pincodes",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByCode = async () => {
    if (!searchTerm) {
      fetchPincodes();
      return;
    }

    setLoading(true);
    try {
      const response = await pincodeApi.search(searchTerm);
      let pincodesData = [];

      if (response?.data?.success && response?.data?.data) {
        pincodesData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        pincodesData = response.data;
      } else if (Array.isArray(response)) {
        pincodesData = response;
      }

      const formattedData = pincodesData.map((item) => ({
        ...item,
        code: item.code || item.pincode,
      }));

      setPincodes(formattedData || []);
      setFilteredPincodes(formattedData || []);
    } catch (error) {
      console.error("Error searching pincodes:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to search pincodes",
      });
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPincodes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPincodes.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    setDropdownFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddWithDropdown = async () => {
    if (!dropdownFormData.code || !dropdownFormData.cityId || !dropdownFormData.stateId) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill all required fields",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        city_id: parseInt(dropdownFormData.cityId),
        pincode: dropdownFormData.code,
        status: dropdownFormData.status || 1,
      };

      console.log("Sending payload:", payload);
      const response = await pincodeApi.create(payload);
      console.log("Create response:", response);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Pincode added successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      setDropdownFormData({ code: "", stateId: "", cityId: "", status: 1 });
      setShow(false);
      await fetchPincodes();
    } catch (error) {
      console.error("Error adding pincode:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to add pincode",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, code) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete pincode "${code}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await pincodeApi.delete(id);

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Pincode has been deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });

        await fetchPincodes();
      } catch (error) {
        console.error("Error deleting pincode:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Failed to delete pincode",
        });
      }
    }
  };

  const handleView = (pincode) => {
    setCurrentPincode(pincode);
    setViewShow(true);
  };

  const handleEditOpen = (pincode) => {
    setCurrentPincode(pincode);

    let stateId = "";
    if (pincode.state && states.length > 0) {
      const foundState = states.find(
        (s) => s.name?.toLowerCase() === pincode.state?.toLowerCase(),
      );
      if (foundState) {
        stateId = foundState.id;
      }
    }

    setEditFormData({
      code: pincode.code || "",
      stateId: stateId || pincode.state_id || "",
      cityId: pincode.city_id || "",
      status: pincode.status !== undefined ? pincode.status : 1,
    });

    setEditShow(true);
  };

  const handleUpdate = async () => {
    if (!editFormData.code || !editFormData.cityId || !editFormData.stateId) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill all required fields",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        city_id: parseInt(editFormData.cityId),
        pincode: editFormData.code,
        status: parseInt(editFormData.status),
      };

      console.log("Updating payload:", payload);
      await pincodeApi.update(currentPincode.id, payload);

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Pincode has been updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      setEditShow(false);
      setEditFormData({ code: "", stateId: "", cityId: "", status: 1 });
      await fetchPincodes();
    } catch (error) {
      console.error("Error updating pincode:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to update pincode",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (pincode) => {
    const isActive = pincode.status === 1;
    const action = isActive ? "deactivate" : "activate";
    const newStatus = isActive ? 0 : 1;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to ${action} pincode "${pincode.code}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${action} it!`,
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await pincodeApi.update(pincode.id, {
          city_id: pincode.city_id,
          pincode: pincode.code,
          status: newStatus,
        });

        Swal.fire({
          icon: "success",
          title: `${action.charAt(0).toUpperCase() + action.slice(1)}d!`,
          text: `Pincode has been ${action}d successfully`,
          timer: 1500,
          showConfirmButton: false,
        });

        await fetchPincodes();
      } catch (error) {
        console.error("Error toggling status:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || `Failed to ${action} pincode`,
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    const isActive = status === 1;
    return (
      <Badge bg={isActive ? "success" : "danger"} className="px-2 py-1 rounded-pill" style={{ fontSize: "11px", fontWeight: 500 }}>
        <span className="me-1">{isActive ? "●" : "○"}</span>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStateColor = (state) => {
    const colors = ["primary", "success", "danger", "warning", "info", "secondary", "dark"];
    const index = state ? state.length % colors.length : 0;
    return colors[index];
  };

  return (
    <div className="p-4" style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: "#1e293b", fontSize: "1.5rem" }}>
          <FaMapMarkerAlt className="me-2" style={{ color: "#dc3545", fontSize: "1.3rem" }} />
          Pincodes
        </h3>
        <p className="text-muted mb-0" style={{ fontSize: "13px" }}>Manage your pincode database</p>
      </div>

      {/* Statistics Cards - Reduced Font Sizes */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Total Pincodes</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{totalPincodes}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#e3f2fd", width: "36px", height: "36px" }}>
                  <FaMapPin size={16} style={{ color: "#3085d6" }} />
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
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Active Pincodes</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{activePincodes}</h4>
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
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Inactive Pincodes</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{inactivePincodes}</h4>
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
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Unique States</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{uniqueStates}</h4>
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
              <h5 className="mb-0 fw-bold" style={{ fontSize: "1rem" }}>Pincodes Database</h5>
              <p className="text-muted small mb-0" style={{ fontSize: "11px" }}>Manage, edit, and monitor pincode information</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={fetchPincodes} className="rounded-pill px-3" style={{ fontSize: "12px", padding: "5px 12px" }}>
                <FaSync className="me-1" size={12} /> Refresh
              </Button>
              <Button variant="primary" onClick={() => setShow(true)} className="rounded-pill px-4" style={{ background: "#1e3a6f", border: "none", fontSize: "12px", padding: "5px 16px" }}>
                <FaPlus className="me-2" size={12} /> Add New Pincode
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
                    placeholder="Search by pincode, city or state..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearchByCode()}
                    className="border-start-0"
                    style={{ fontSize: "13px" }}
                  />
                  <Button variant="primary" onClick={handleSearchByCode} style={{ background: "#1e3a6f", border: "none", fontSize: "12px", padding: "5px 16px" }} className="rounded-end-pill">
                    Search
                  </Button>
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
              <p className="mt-3 text-muted" style={{ fontSize: "13px" }}>Loading pincodes...</p>
            </div>
          )}

          {/* Modern Table - Reduced Font Sizes */}
          {!loading && (
            <div className="table-responsive px-4">
              <Table className="align-middle mb-0" style={{ minWidth: "1000px", fontSize: "12px" }}>
                <thead style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                  <tr className="text-muted">
                    <th className="py-2 ps-3" style={{ width: "60px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>#</th>
                    <th className="py-2" style={{ width: "170px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Pincode</th>
                    <th className="py-2" style={{ width: "180px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>City</th>
                    <th className="py-2" style={{ width: "180px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>State</th>
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
                          <FaLocationArrow size={36} className="mb-2 opacity-25" />
                          <p style={{ fontSize: "13px" }}>No pincodes found</p>
                          <Button variant="primary" size="sm" onClick={() => setShow(true)} className="rounded-pill" style={{ fontSize: "11px" }}>
                            <FaPlus className="me-1" size={10} /> Add your first pincode
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((p, i) => (
                      <tr key={p.id} className="border-bottom" style={{ borderBottom: "1px solid #f0f2f8" }}>
                        <td className="py-2 ps-3 text-center fw-bold text-muted" style={{ fontSize: "12px" }}>{indexOfFirstItem + i + 1}</td>
                        <td className="py-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
                              <FaMapPin size={14} />
                            </div>
                            <div>
                              <div className="fw-semibold" style={{ fontSize: "13px" }}>{p.code}</div>
                              <div className="small text-muted" style={{ fontSize: "10px" }}>ID: {p.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2">
                          <div className="d-flex align-items-center gap-1">
                            <FaCity className="flex-shrink-0" size={11} style={{ color: "#6c757d" }} />
                            <span style={{ fontSize: "12px" }}>{p.city || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-2">
                          <Badge bg={getStateColor(p.state)} className="px-2 py-1 rounded-pill" style={{ fontSize: "11px", fontWeight: 500 }}>
                            <FaBuilding className="me-1" size={10} />
                            {p.state || 'N/A'}
                          </Badge>
                        </td>
                        <td className="py-2 text-center">{getStatusBadge(p.status)}</td>
                        <td className="py-2">
                          <small className="text-muted" style={{ fontSize: "11px" }}>
                            <FaCalendarAlt className="me-1" size={9} style={{ color: "#6c757d" }} />
                            {formatDate(p.created_at)}
                          </small>
                        </td>
                        <td className="py-2">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button size="sm" variant="outline-info" onClick={() => handleView(p)} className="rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: "28px", height: "28px", padding: "0", borderColor: "#0dcaf0", color: "#0dcaf0", fontSize: "12px" }}>
                              <FaEye size={12} />
                            </Button>
                            <Button size="sm" variant="outline-warning" onClick={() => handleEditOpen(p)} className="rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: "28px", height: "28px", padding: "0", borderColor: "#ffc107", color: "#ffc107", fontSize: "12px" }}>
                              <FaEdit size={12} />
                            </Button>
                            <Button size="sm" variant="outline-secondary" onClick={() => handleToggleStatus(p)} className="rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: "28px", height: "28px", padding: "0", borderColor: p.status === 1 ? "#dc3545" : "#198754", color: p.status === 1 ? "#dc3545" : "#198754", fontSize: "12px" }}>
                              {p.status === 1 ? <FaToggleOn size={12} /> : <FaToggleOff size={12} />}
                            </Button>
                            <Button size="sm" variant="outline-danger" onClick={() => handleDelete(p.id, p.code)} className="rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: "28px", height: "28px", padding: "0", borderColor: "#dc3545", color: "#dc3545", fontSize: "12px" }}>
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

          {/* Pagination - Reduced Font Sizes */}
          {!loading && filteredPincodes.length > 0 && totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top mt-2">
              <div className="text-muted" style={{ fontSize: "11px" }}>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPincodes.length)} of {filteredPincodes.length} entries
              </div>
              <Pagination className="mb-0" style={{ fontSize: "12px" }}>
                <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="rounded-circle mx-1" style={{ fontSize: "12px" }}>
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
                <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="rounded-circle mx-1" style={{ fontSize: "12px" }}>
                  <FaChevronRight size={10} />
                </Pagination.Next>
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Modal - Reduced Font Sizes */}
      <Modal show={show} onHide={() => setShow(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-white border-0 pt-3 px-4">
          <Modal.Title className="fw-bold" style={{ fontSize: "1.1rem" }}>
            <FaPlus className="me-2" style={{ color: "#1e3a6f", fontSize: "14px" }} /> Add New Pincode
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          <Form>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Pincode <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" name="code" placeholder="Enter pincode (e.g., 400022)" value={dropdownFormData.code} onChange={handleDropdownChange} maxLength="6" className="rounded-3" style={{ fontSize: "13px" }} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>State <span className="text-danger">*</span></Form.Label>
              <Form.Select name="stateId" value={dropdownFormData.stateId} onChange={handleDropdownChange} disabled={statesLoading} className="rounded-3" style={{ fontSize: "13px" }}>
                <option value="">{statesLoading ? "Loading states..." : "Select State"}</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>City <span className="text-danger">*</span></Form.Label>
              <Form.Select name="cityId" value={dropdownFormData.cityId} onChange={handleDropdownChange} disabled={!dropdownFormData.stateId} className="rounded-3" style={{ fontSize: "13px" }}>
                <option value="">{!dropdownFormData.stateId ? "Select a state first" : "Select City"}</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Status</Form.Label>
              <Form.Select name="status" value={dropdownFormData.status} onChange={handleDropdownChange} className="rounded-3" style={{ fontSize: "13px" }}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pb-3 px-4">
          <Button variant="light" onClick={() => setShow(false)} className="rounded-pill px-3" style={{ fontSize: "12px" }}>Cancel</Button>
          <Button variant="primary" onClick={handleAddWithDropdown} disabled={loading} className="rounded-pill px-3" style={{ background: "#1e3a6f", fontSize: "12px" }}>
            {loading ? "Saving..." : "Save Pincode"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal - Reduced Font Sizes */}
      <Modal show={viewShow} onHide={() => setViewShow(false)} centered size="lg">
        <Modal.Header closeButton className="bg-white border-0 pt-3 px-4">
          <Modal.Title className="fw-bold" style={{ fontSize: "1.1rem" }}>
            <FaEye className="me-2" style={{ color: "#0dcaf0", fontSize: "14px" }} /> Pincode Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          {currentPincode && (
            <>
              <div className="text-center mb-3">
                <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2" style={{ width: "60px", height: "60px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
                  <FaMapPin size={24} />
                </div>
                <h4 className="mb-0" style={{ fontSize: "1.2rem" }}>{currentPincode.code}</h4>
                <Badge bg={getStateColor(currentPincode.state)} className="mt-1" style={{ fontSize: "11px" }}>
                  <FaBuilding className="me-1" size={10} /> {currentPincode.state}
                </Badge>
              </div>
              <hr className="my-2" />
              <div className="row" style={{ fontSize: "12px" }}>
                <div className="col-md-6 mb-2">
                  <strong>ID:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>#{currentPincode.id}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>City:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}><FaCity className="me-1" size={10} /> {currentPincode.city}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>State:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}><FaBuilding className="me-1" size={10} /> {currentPincode.state}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Status:</strong>
                  <div className="mt-1">{getStatusBadge(currentPincode.status)}</div>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Created At:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{formatDate(currentPincode.created_at)}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Last Updated:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{formatDate(currentPincode.updated_at)}</p>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pb-3 px-4">
          <Button variant="secondary" onClick={() => setViewShow(false)} className="rounded-pill px-3" style={{ fontSize: "12px" }}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal - Reduced Font Sizes */}
      <Modal show={editShow} onHide={() => setEditShow(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-white border-0 pt-3 px-4">
          <Modal.Title className="fw-bold" style={{ fontSize: "1.1rem" }}>
            <FaEdit className="me-2" style={{ color: "#ffc107", fontSize: "14px" }} /> Edit Pincode
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          <Form>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Pincode <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" name="code" value={editFormData.code} onChange={handleEditChange} maxLength="6" className="rounded-3" style={{ fontSize: "13px" }} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>State <span className="text-danger">*</span></Form.Label>
              <Form.Select name="stateId" value={editFormData.stateId} onChange={handleEditChange} disabled={statesLoading} className="rounded-3" style={{ fontSize: "13px" }}>
                <option value="">{statesLoading ? "Loading states..." : "Select State"}</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>City <span className="text-danger">*</span></Form.Label>
              <Form.Select name="cityId" value={editFormData.cityId} onChange={handleEditChange} disabled={!editFormData.stateId} className="rounded-3" style={{ fontSize: "13px" }}>
                <option value="">{!editFormData.stateId ? "Select a state first" : "Select City"}</option>
                {editCities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Status</Form.Label>
              <Form.Select name="status" value={editFormData.status} onChange={handleEditChange} className="rounded-3" style={{ fontSize: "13px" }}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pb-3 px-4">
          <Button variant="light" onClick={() => setEditShow(false)} className="rounded-pill px-3" style={{ fontSize: "12px" }}>Cancel</Button>
          <Button variant="warning" onClick={handleUpdate} disabled={loading} className="rounded-pill px-3" style={{ fontSize: "12px" }}>
            {loading ? "Updating..." : "Update Pincode"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Pincodes;