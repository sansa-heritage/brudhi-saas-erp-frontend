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
  Modal,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaLock,
  FaUserShield,
  FaArrowLeft,
  FaHome,
  FaSave,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
} from "../../api/tenant/staff.api";

const RolePermissions = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    role_id: "",
    description: "",
    permissions: [],
    status: "active",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch roles and permissions in parallel
      const [rolesResponse, permissionsResponse] = await Promise.all([
        getRoles(),
        getAllPermissions(),
      ]);

      console.log("Roles response:", rolesResponse);
      console.log("Permissions response:", permissionsResponse);

      // Extract data from response
      let rolesData = [];
      let permissionsData = [];

      if (rolesResponse?.data?.data) rolesData = rolesResponse.data.data;
      else if (rolesResponse?.data) rolesData = rolesResponse.data;
      else if (Array.isArray(rolesResponse)) rolesData = rolesResponse;

      if (permissionsResponse?.data?.data) permissionsData = permissionsResponse.data.data;
      else if (permissionsResponse?.data) permissionsData = permissionsResponse.data;
      else if (Array.isArray(permissionsResponse)) permissionsData = permissionsResponse;

      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      setError(error.response?.data?.message || "Failed to load roles and permissions");
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to load roles and permissions',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Role name is required',
      });
      return;
    }

    try {
      const roleData = {
        name: formData.name,
        role_id: formData.role_id || formData.name.toUpperCase().replace(/\s/g, '_'),
        description: formData.description,
        permissions: formData.permissions,
        status: formData.status
      };

      if (selectedRole) {
        await updateRole(selectedRole.id, roleData);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Role updated successfully!',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await createRole(roleData);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Role created successfully!',
          timer: 1500,
          showConfirmButton: false
        });
      }
      
      await loadData();
      setShowModal(false);
      setSelectedRole(null);
      resetForm();
    } catch (error) {
      console.error("Failed to save role:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to save role',
      });
    }
  };

  const handleEdit = (role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name || '',
      role_id: role.role_id || '',
      description: role.description || '',
      permissions: role.permissions?.map(p => p.id || p) || [],
      status: role.status || 'active',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteRole(id);
      await loadData();
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Role deleted successfully!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Failed to delete role:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to delete role',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      role_id: "",
      description: "",
      permissions: [],
      status: "active",
    });
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const getPermissionsByCategory = () => {
    const grouped = {};
    permissions.forEach((perm) => {
      const category = perm.module || perm.category || 'General';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(perm);
    });
    return grouped;
  };

  const handleGoBack = () => {
    navigate("/staffs");
  };

  const groupedPermissions = getPermissionsByCategory();

  if (loading) {
    return (
      <Container fluid className="p-4 bg-light">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <h5 className="mt-3">Loading roles and permissions...</h5>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="p-4 bg-light">
        <Alert variant="danger" className="text-center">
          <h5>Error Loading Data</h5>
          <p>{error}</p>
          <Button variant="primary" onClick={loadData}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 bg-light">
      {/* Back Button */}
      <div className="mb-3 d-flex align-items-center gap-3">
        <Button
          variant="link"
          className="text-decoration-none p-0 d-flex align-items-center text-primary"
          onClick={handleGoBack}
        >
          <FaArrowLeft className="me-2" /> Back to Staff
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          className="rounded-pill"
          onClick={() => navigate("/staffs")}
        >
          <FaHome className="me-1" /> Staff
        </Button>
      </div>

      {/* Header */}
      <div className="bg-gradient-primary text-white rounded-3 p-4 mb-4 shadow">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">
              <FaUserShield className="me-2" /> Role & Permissions
            </h2>
            <p className="mb-0 opacity-75">
              Manage user roles and access permissions
            </p>
          </div>
          <Button
            variant="light"
            onClick={() => {
              setSelectedRole(null);
              resetForm();
              setShowModal(true);
            }}
            className="rounded-pill px-4"
          >
            <FaPlus className="me-2" /> Create Role
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Total Roles</small>
                  <h4 className="text-primary mb-0 fw-bold">{roles.length}</h4>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <FaUserShield className="text-primary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Total Permissions</small>
                  <h4 className="text-success mb-0 fw-bold">
                    {permissions.length}
                  </h4>
                </div>
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <FaLock className="text-success" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Active Roles</small>
                  <h4 className="text-info mb-0 fw-bold">
                    {roles.filter((r) => r.status === "active").length}
                  </h4>
                </div>
                <div className="bg-info bg-opacity-10 rounded-circle p-3">
                  <FaCheckCircle className="text-info" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Roles Table */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Role Name</th>
                  <th>Role ID</th>
                  <th>Description</th>
                  <th>Permissions</th>
                  <th>Staff Count</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td className="fw-semibold">{role.name}</td>
                    <td><code>{role.role_id}</code></td>
                    <td className="text-muted">{role.description}</td>
                    <td>
                      <Badge bg="info" className="rounded-pill">
                        {role.permissions?.length || 0} Permissions
                      </Badge>
                    </td>
                    <td>{role.staffCount || 0} staff</td>
                    <td>
                      <Badge
                        bg={role.status === "active" ? "success" : "danger"}
                        className="rounded-pill"
                      >
                        {role.status || 'active'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1 rounded-circle"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                        onClick={() => handleEdit(role)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="rounded-circle"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                        onClick={() => {
                          Swal.fire({
                            title: 'Are you sure?',
                            text: `Delete role "${role.name}"?`,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'Yes, delete it!'
                          }).then((result) => {
                            if (result.isConfirmed) {
                              handleDelete(role.id);
                            }
                          });
                        }}
                        disabled={role.staffCount > 0}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
                {roles.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <h5 className="text-muted">No roles found</h5>
                      <Button variant="primary" onClick={() => setShowModal(true)}>
                        Create First Role
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Role Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header
          closeButton
          className="bg-primary text-white rounded-top-3 border-0"
        >
          <Modal.Title className="fw-bold">
            {selectedRole ? "Edit Role" : "Create New Role"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Sales Manager"
                    className="rounded-2"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.role_id}
                    onChange={(e) =>
                      setFormData({ ...formData, role_id: e.target.value })
                    }
                    placeholder="e.g., SALES_MANAGER"
                    className="rounded-2"
                  />
                  <Form.Text className="text-muted">
                    Unique identifier (auto-generated if left empty)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="rounded-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the role and its responsibilities"
                className="rounded-2"
              />
            </Form.Group>

            <h6 className="fw-bold mb-3">Permissions</h6>
            <div
              className="border rounded-3 p-3"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              {Object.keys(groupedPermissions).length > 0 ? (
                Object.keys(groupedPermissions).map((category, idx) => (
                  <div key={category} className="mb-3">
                    <h6 className="fw-bold text-primary mb-2">{category}</h6>
                    <div className="ps-3">
                      {groupedPermissions[category].map((perm) => (
                        <Form.Check
                          key={perm.id}
                          type="checkbox"
                          id={`perm-${perm.id}`}
                          label={
                            <span>
                              <strong>{perm.name}</strong>
                              <br />
                              <small className="text-muted">
                                {perm.description}
                              </small>
                            </span>
                          }
                          checked={formData.permissions.includes(perm.id)}
                          onChange={() => handlePermissionToggle(perm.id)}
                          className="mb-2"
                        />
                      ))}
                    </div>
                    {idx !== Object.keys(groupedPermissions).length - 1 && <hr />}
                  </div>
                ))
              ) : (
                <p className="text-muted text-center">No permissions available</p>
              )}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light rounded-bottom-3 border-0">
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            className="rounded-pill px-4"
          >
            <FaTimes className="me-2" /> Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            className="rounded-pill px-4"
          >
            <FaSave className="me-2" />
            {selectedRole ? "Update Role" : "Create Role"}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .rounded-3 {
          border-radius: 0.75rem !important;
        }
      `}</style>
    </Container>
  );
};

export default RolePermissions;