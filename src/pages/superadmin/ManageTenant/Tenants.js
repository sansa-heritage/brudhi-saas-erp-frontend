import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Badge,
  Form,
  Row,
  Col,
  InputGroup,
  Spinner,
  Modal,
} from "react-bootstrap";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaBuilding,
  FaFilter,
  FaTimes,
  FaDatabase,
  FaCheckCircle,
  FaBan,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getTenants,
  deleteTenant,
  backupTenant,
} from "../../../api/superadmin/tenant.api";

const Tenants = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const response = await getTenants();
      console.log("Full response:", response);
      
      // ✅ FIXED: Extract data correctly from nested structure
      // Your API returns: { data: { data: { data: [...], pagination: {...} } } }
      let tenantsData = [];
      
      // Check different possible response structures
      if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
        // Structure: response.data.data.data (array of tenants)
        tenantsData = response.data.data.data;
        console.log("Found tenants in response.data.data.data:", tenantsData.length);
      } 
      else if (response?.data?.data && Array.isArray(response.data.data)) {
        // Structure: response.data.data (array of tenants)
        tenantsData = response.data.data;
        console.log("Found tenants in response.data.data:", tenantsData.length);
      }
      else if (response?.data && Array.isArray(response.data)) {
        // Structure: response.data (array of tenants)
        tenantsData = response.data;
        console.log("Found tenants in response.data:", tenantsData.length);
      }
      else if (Array.isArray(response)) {
        // Structure: response (array of tenants)
        tenantsData = response;
        console.log("Found tenants in response:", tenantsData.length);
      }
      
      // Ensure tenantsData is always an array
      setTenants(Array.isArray(tenantsData) ? tenantsData : []);
    } catch (error) {
      console.error("Failed to load tenants:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to load tenants",
      });
      setTenants([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete tenant "${name}". This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteTenant(id);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Tenant has been deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        loadTenants();
      } catch (error) {
        console.error("Failed to delete tenant:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Failed to delete tenant",
        });
      }
    }
  };

  const handleBackup = async (id, name) => {
    const result = await Swal.fire({
      title: "Backup Tenant",
      text: `Create a backup for "${name}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Backup!",
    });

    if (result.isConfirmed) {
      try {
        await backupTenant(id);
        Swal.fire({
          icon: "success",
          title: "Backup Created!",
          text: "Tenant backup has been created successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Failed to backup tenant:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Failed to backup tenant",
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: "success", text: "Active" },
      inactive: { bg: "secondary", text: "Inactive" },
      suspended: { bg: "danger", text: "Suspended" },
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <Badge bg={config.bg} className="rounded-pill px-3 py-2">
        {config.text}
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

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // ✅ Safely filter tenants (ensure it's an array)
  const filteredTenants = Array.isArray(tenants) ? tenants.filter((tenant) => {
    const matchesSearch =
      searchTerm === "" ||
      tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.subdomain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || tenant.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) : [];

  const stats = {
    total: Array.isArray(tenants) ? tenants.length : 0,
    active: Array.isArray(tenants) ? tenants.filter((t) => t.status === "active").length : 0,
    inactive: Array.isArray(tenants) ? tenants.filter((t) => t.status === "inactive").length : 0,
  };

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <h4 className="mt-3">Loading tenants...</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 bg-light" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FaBuilding className="me-2 text-primary" /> Tenant Management
          </h2>
          <p className="text-muted">Manage all multi-tenant organizations</p>
        </div>
        <Button variant="primary" onClick={() => navigate("/superadmin/tenants/create")}>
          <FaPlus className="me-2" /> Add Tenant
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">Total Tenants</small>
                <h3 className="mb-0 fw-bold">{stats.total}</h3>
              </div>
              <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                <FaBuilding size={24} className="text-primary" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">Active Tenants</small>
                <h3 className="mb-0 fw-bold text-success">{stats.active}</h3>
              </div>
              <div className="bg-success bg-opacity-10 rounded-circle p-3">
                <FaCheckCircle size={24} className="text-success" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">Inactive</small>
                <h3 className="mb-0 fw-bold text-secondary">{stats.inactive}</h3>
              </div>
              <div className="bg-secondary bg-opacity-10 rounded-circle p-3">
                <FaBan size={24} className="text-secondary" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name, subdomain or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
                    <FaTimes />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </Form.Select>
            </Col>
            <Col md={1}>
              <Button variant="outline-secondary" onClick={clearFilters} className="w-100">
                <FaFilter />
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tenants Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Tenant Name</th>
                  <th>Subdomain</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.length > 0 ? (
                  filteredTenants.map((tenant) => (
                    <tr key={tenant.id}>
                      <td className="fw-semibold">{tenant.id}</td>
                      <td>
                        <div className="fw-semibold">{tenant.name}</div>
                        <small className="text-muted">ID: {tenant.id}</small>
                      </td>
                      <td><code>{tenant.subdomain}.yourdomain.com</code></td>
                      <td>{tenant.email}</td>
                      <td>{tenant.phone || "N/A"}</td>
                      <td>{getStatusBadge(tenant.status)}</td>
                      <td>{formatDate(tenant.created_at)}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-info"
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setShowViewModal(true);
                          }}
                          className="me-1 rounded-circle"
                          style={{ width: "32px", height: "32px", padding: "0" }}
                          title="View Details"
                        >
                          <FaEye />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => navigate(`/superadmin/tenants/edit/${tenant.id}`)}
                          className="me-1 rounded-circle"
                          style={{ width: "32px", height: "32px", padding: "0" }}
                          title="Edit"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => handleBackup(tenant.id, tenant.name)}
                          className="me-1 rounded-circle"
                          style={{ width: "32px", height: "32px", padding: "0" }}
                          title="Backup"
                        >
                          <FaDatabase />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(tenant.id, tenant.name)}
                          className="rounded-circle"
                          style={{ width: "32px", height: "32px", padding: "0" }}
                          title="Delete"
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <FaBuilding size={50} className="text-muted mb-3" />
                      <h5 className="text-muted">No tenants found</h5>
                      <Button variant="primary" onClick={() => navigate("/superadmin/tenants/create")}>
                        Create First Tenant
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* View Tenant Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white rounded-top-3 border-0">
          <Modal.Title className="fw-bold">
            <FaBuilding className="me-2" /> Tenant Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedTenant && (
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">ID</small>
                  <p className="fw-semibold">{selectedTenant.id}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">Name</small>
                  <p className="fw-semibold">{selectedTenant.name}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">Subdomain</small>
                  <p><code>{selectedTenant.subdomain}.yourdomain.com</code></p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">Email</small>
                  <p>{selectedTenant.email}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">Phone</small>
                  <p>{selectedTenant.phone || "N/A"}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">Status</small>
                  <p>{getStatusBadge(selectedTenant.status)}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">Plan</small>
                  <p><strong>{selectedTenant.plan_name}</strong> - ₹{parseFloat(selectedTenant.plan_price || 0).toLocaleString()}/month</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">Subscription End Date</small>
                  <p>{formatDate(selectedTenant.subscription_end_date)}</p>
                </div>
              </Col>
              <Col md={12}>
                <div className="mb-3">
                  <small className="text-muted">Created At</small>
                  <p>{formatDate(selectedTenant.created_at)}</p>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light rounded-bottom-3 border-0">
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
          <Button variant="primary" onClick={() => {
            setShowViewModal(false);
            navigate(`/superadmin/tenants/edit/${selectedTenant?.id}`);
          }}>
            <FaEdit className="me-2" /> Edit Tenant
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .rounded-3 {
          border-radius: 0.75rem !important;
        }
        .table tbody tr:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </Container>
  );
};

export default Tenants;