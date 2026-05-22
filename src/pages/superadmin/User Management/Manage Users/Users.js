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
  FaUsers,
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaUserTag,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { userApi } from '../../../../api/superadmin/user.api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [viewShow, setViewShow] = useState(false);
  const [editShow, setEditShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedRole, setSelectedRole] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",  // Changed from 'phone' to 'mobile' to match backend
    role: "user",
    status: "active",  // Changed from 1/0 to 'active'/'inactive' strings
    password: "", // Added for create
  });

  // Fetch users on component mount and when page/role changes
  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedRole]);

  // Filter users based on search term (frontend search)
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.mobile?.includes(searchTerm)
      );
      setFilteredUsers(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, users]);

  // Fetch all users with pagination and filters
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);
      if (selectedRole) params.append('role', selectedRole);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await userApi.getAll(params);
      console.log("Users response:", response.data);
      
      // Handle your backend response structure
      // Your backend returns: { data: [...], pagination: {...} }
      let usersData = [];
      let paginationData = {};
      
      if (response.data) {
        // Case 1: Direct response with data array and pagination
        if (response.data.data && Array.isArray(response.data.data)) {
          usersData = response.data.data;
          paginationData = response.data.pagination || {};
        }
        // Case 2: Response wrapped in success
        else if (response.data.success && response.data.data) {
          if (Array.isArray(response.data.data)) {
            usersData = response.data.data;
          } else if (response.data.data.data && Array.isArray(response.data.data.data)) {
            usersData = response.data.data.data;
            paginationData = response.data.data.pagination || {};
          }
        }
        // Case 3: Direct array
        else if (Array.isArray(response.data)) {
          usersData = response.data;
        }
      }
      
      console.log("Extracted users:", usersData);
      setUsers(usersData);
      setFilteredUsers(usersData);
      
      // Update pagination state
      if (paginationData) {
        setPagination({
          page: paginationData.page || currentPage,
          limit: paginationData.limit || itemsPerPage,
          total: paginationData.total || usersData.length,
          totalPages: paginationData.totalPages || Math.ceil(usersData.length / itemsPerPage)
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to fetch users',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get random color for badges
  const getBadgeColor = (text) => {
    const colors = ['primary', 'success', 'danger', 'warning', 'info', 'secondary', 'dark'];
    const index = text ? text.length % colors.length : 0;
    return colors[index];
  };

  // Get role badge
  const getRoleBadge = (role) => {
    const roleColors = {
      admin: 'danger',
      manager: 'warning',
      user: 'info',
      superadmin: 'dark'
    };
    return (
      <Badge bg={roleColors[role] || 'secondary'} className="px-3 py-2 rounded-pill">
        <FaUserTag className="me-1" size={12} />
        {role?.toUpperCase() || 'USER'}
      </Badge>
    );
  };

  // Add User
  const handleAdd = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.mobile) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill all required fields (Name, Email, Mobile)',
      });
      return;
    }

    if (!formData.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter a password for the user',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Email',
        text: 'Please enter a valid email address',
      });
      return;
    }

    // Mobile validation (10 digits)
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Mobile',
        text: 'Please enter a valid 10-digit mobile number',
      });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        role: formData.role,
        status: formData.status,
        password: formData.password
      };
      
      console.log("Creating user with payload:", payload);
      const response = await userApi.create(payload);
      console.log("Create response:", response.data);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'User added successfully',
        timer: 1500,
        showConfirmButton: false
      });
      
      // Reset form
      setFormData({ 
        name: "", 
        email: "", 
        mobile: "", 
        role: "user", 
        status: "active",
        password: "" 
      });
      setShow(false);
      
      // Refresh the list
      await fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to add user',
      });
    }
  };

  // Delete User
  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${name}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await userApi.delete(id);
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'User has been deleted successfully',
          timer: 1500,
          showConfirmButton: false
        });
        
        await fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to delete user',
        });
      }
    }
  };

  // View User
  const handleView = async (user) => {
    try {
      const response = await userApi.getById(user.id);
      let fullData = user;
      if (response.data && response.data.data) {
        fullData = response.data.data;
      } else if (response.data) {
        fullData = response.data;
      }
      setCurrentUser(fullData);
      setViewShow(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setCurrentUser(user);
      setViewShow(true);
    }
  };

  // Edit Open
  const handleEditOpen = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role || "user",
      status: user.status,
      password: "" // Don't populate password
    });
    setEditShow(true);
  };

  // Update User
  const handleUpdate = async () => {
    if (!formData.name || !formData.email || !formData.mobile) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill all required fields (Name, Email, Mobile)',
      });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        role: formData.role,
        status: formData.status
      };
      
      // Only include password if provided
      if (formData.password) {
        payload.password = formData.password;
      }
      
      console.log("Updating user ID:", currentUser.id);
      console.log("Updating user with payload:", payload);
      
      const response = await userApi.update(currentUser.id, payload);
      console.log("Update response:", response.data);
      
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'User has been updated successfully',
        timer: 1500,
        showConfirmButton: false
      });
      
      setEditShow(false);
      setFormData({ 
        name: "", 
        email: "", 
        mobile: "", 
        role: "user", 
        status: "active",
        password: "" 
      });
      
      // Refresh the list to show updated data
      await fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to update user',
      });
    }
  };

  // Toggle status
  const handleToggleStatus = async (user) => {
    const isActive = user.status === 'active';
    const action = isActive ? 'deactivate' : 'activate';
    const newStatus = isActive ? 'inactive' : 'active';
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You want to ${action} "${user.name}"?`,
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
        await userApi.update(user.id, { status: newStatus });
        
        Swal.fire({
          icon: 'success',
          title: `${action.charAt(0).toUpperCase() + action.slice(1)}d!`,
          text: `User has been ${action}d successfully`,
          timer: 1500,
          showConfirmButton: false
        });
        
        await fetchUsers();
      } catch (error) {
        console.error("Error toggling status:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.data?.message || `Failed to ${action} user`,
        });
      } finally {
        setToggleLoading(false);
      }
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const isActive = status === 'active';
    return (
      <Badge bg={isActive ? 'success' : 'danger'} className="px-3 py-2 rounded-pill">
        <span className="me-1">
          {isActive ? '●' : '○'}
        </span>
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

  // Clear filters
  const clearFilters = () => {
    setSelectedRole("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const totalPages = pagination.totalPages;

  return (
    <div className="p-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-0 py-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h3 className="mb-1 fw-bold">👥 User Management</h3>
              <p className="text-muted mb-0">Manage system users and their access permissions</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={fetchUsers} title="Refresh">
                <FaSync className="me-1" /> Refresh
              </Button>
              <Button variant="primary" onClick={() => setShow(true)}>
                <FaPlus className="me-2" /> Add New User
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          {/* Search and Filter Bar */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
              <InputGroup>
                <InputGroup.Text className="bg-white">
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search by name, email, or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
              </InputGroup>
            </div>
            <div className="d-flex gap-2">
              <Form.Select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ width: '180px' }}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
                <option value="superadmin">Super Admin</option>
              </Form.Select>
              {(selectedRole || searchTerm) && (
                <Button variant="outline-secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading users...</p>
            </div>
          )}

          {/* Statistics Cards */}
          {!loading && users.length > 0 && (
            <div className="row mb-4">
              <div className="col-md-3 mb-3">
                <Card className="bg-primary text-white border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <h2 className="mb-0">{pagination.total || users.length}</h2>
                    <small>Total Users</small>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3 mb-3">
                <Card className="bg-success text-white border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <h2 className="mb-0">{users.filter(u => u.status === 'active').length}</h2>
                    <small>Active Users</small>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3 mb-3">
                <Card className="bg-danger text-white border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <h2 className="mb-0">{users.filter(u => u.status === 'inactive').length}</h2>
                    <small>Inactive Users</small>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3 mb-3">
                <Card className="bg-info text-white border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <h2 className="mb-0">{users.filter(u => u.role === 'admin').length}</h2>
                    <small>Admin Users</small>
                  </Card.Body>
                </Card>
              </div>
            </div>
          )}

          {/* Modern Table */}
          {!loading && (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <tr>
                    <th className="py-3 px-4" style={{ width: '60px' }}>#</th>
                    <th className="py-3">User</th>
                    <th className="py-3">Contact Information</th>
                    <th className="py-3">Role</th>
                    <th className="py-3" style={{ width: '120px' }}>Status</th>
                    <th className="py-3" style={{ width: '120px' }}>Created</th>
                    <th className="py-3 text-center" style={{ width: '180px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div className="text-muted">
                          <FaUsers size={48} className="mb-3 opacity-25" />
                          <p>No users found</p>
                          <Button variant="primary" size="sm" onClick={() => setShow(true)}>
                            <FaPlus className="me-1" /> Add your first user
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((u, i) => (
                      <tr key={u.id} className="border-bottom">
                        <td className="px-4 py-3 fw-bold text-muted">
                          {((currentPage - 1) * itemsPerPage) + i + 1}
                        </td>
                        <td className="py-3">
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              <div className="rounded-circle bg-light p-2" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaUserCircle size={20} className="text-primary" />
                              </div>
                            </div>
                            <div>
                              <div className="fw-semibold">{u.name}</div>
                              <small className="text-muted">ID: {u.id}</small>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div>
                            <div className="mb-1">
                              <FaEnvelope className="text-muted me-2" size={12} />
                              <span className="small">{u.email}</span>
                            </div>
                            <div>
                              <FaPhone className="text-muted me-2" size={12} />
                              <span className="small">{u.mobile}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">{getRoleBadge(u.role)}</td>
                        <td className="py-3">{getStatusBadge(u.status)}</td>
                        <td className="py-3">
                          <small className="text-muted">{formatDate(u.created_at)}</small>
                        </td>
                        <td className="py-3">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button 
                              size="sm" 
                              variant="outline-info" 
                              onClick={() => handleView(u)}
                              title="View Details"
                              className="rounded-circle"
                              style={{ width: '32px', height: '32px', padding: '0' }}
                            >
                              <FaEye />
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline-warning" 
                              onClick={() => handleEditOpen(u)}
                              title="Edit User"
                              className="rounded-circle"
                              style={{ width: '32px', height: '32px', padding: '0' }}
                            >
                              <FaEdit />
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant={u.status === 'active' ? "outline-secondary" : "outline-success"}
                              onClick={() => handleToggleStatus(u)}
                              title={u.status === 'active' ? "Deactivate" : "Activate"}
                              disabled={toggleLoading}
                              className="rounded-circle"
                              style={{ width: '32px', height: '32px', padding: '0' }}
                            >
                              {toggleLoading ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                u.status === 'active' ? <FaToggleOn /> : <FaToggleOff />
                              )}
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline-danger" 
                              onClick={() => handleDelete(u.id, u.name)}
                              title="Delete User"
                              className="rounded-circle"
                              style={{ width: '32px', height: '32px', padding: '0' }}
                            >
                              <FaTrash />
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
          {!loading && totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
              <div className="text-muted small">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} entries
              </div>
              <Pagination className="mb-0">
                <Pagination.Prev 
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft />
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
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}
                
                <Pagination.Next 
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <FaChevronRight />
                </Pagination.Next>
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Modal */}
      <Modal show={show} onHide={() => setShow(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mobile Number <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="tel"
                name="mobile"
                placeholder="Enter 10-digit mobile number"
                value={formData.mobile}
                onChange={handleChange}
                maxLength={10}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAdd}>
            Save User
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={viewShow} onHide={() => setViewShow(false)} centered>
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentUser && (
            <>
              <div className="text-center mb-4">
                <div className="rounded-circle bg-light d-inline-flex p-3 mb-3">
                  <FaUserCircle size={48} className="text-primary" />
                </div>
                <h4 className="mb-0">{currentUser.name}</h4>
                {getRoleBadge(currentUser.role)}
              </div>
              
              <hr />
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <strong>ID:</strong>
                  <p className="text-muted mb-0">#{currentUser.id}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Status:</strong>
                  <div className="mt-1">{getStatusBadge(currentUser.status)}</div>
                </div>
                <div className="col-md-12 mb-3">
                  <strong>Email Address:</strong>
                  <p className="text-muted mb-0">
                    <FaEnvelope className="me-2" />
                    {currentUser.email}
                  </p>
                </div>
                <div className="col-md-12 mb-3">
                  <strong>Mobile Number:</strong>
                  <p className="text-muted mb-0">
                    <FaPhone className="me-2" />
                    {currentUser.mobile}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Last Login:</strong>
                  <p className="text-muted mb-0">{formatDate(currentUser.last_login)}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Created At:</strong>
                  <p className="text-muted mb-0">{formatDate(currentUser.created_at)}</p>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewShow(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={editShow} onHide={() => setEditShow(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-warning">
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mobile Number <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                maxLength={10}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password (Leave blank to keep current)</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditShow(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleUpdate}>
            Update User
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Users;