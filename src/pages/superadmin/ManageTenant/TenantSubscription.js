// components/superadmin/TenantSubscription.js
import React, { useState, useEffect } from 'react';
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
} from 'react-bootstrap';
import {
  FaEye,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaPlus,
  FaSearch,
  FaSync,
  FaChevronLeft,
  FaChevronRight,
  FaRupeeSign,
  FaCalendarAlt,
  FaUsers,
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import { planApi } from '../../../api/superadmin/masterData.api';
import apiClient from '../../../api/client';

const TenantSubscription = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewShow, setViewShow] = useState(false);
  const [createShow, setCreateShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [stats, setStats] = useState({});
  const [plans, setPlans] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [formData, setFormData] = useState({
    tenantId: '',
    planId: '',
    startDate: '',
    endDate: '',
    amount: '',
    status: 'active'
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
    fetchPlans();
    fetchTenants();
  }, []);

  useEffect(() => {
    let filtered = subscriptions;
    
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.plan_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedStatus) {
      filtered = filtered.filter(sub => sub.status === selectedStatus);
    }
    
    if (selectedPlan) {
      filtered = filtered.filter(sub => sub.plan_id === parseInt(selectedPlan));
    }
    
    if (selectedTenant) {
      filtered = filtered.filter(sub => sub.tenant_id === parseInt(selectedTenant));
    }
    
    setFilteredSubscriptions(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedPlan, selectedTenant, subscriptions]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      // Note: Update this endpoint based on your actual subscription API
      const response = await apiClient.get('/superadmin/subscriptions');
      setSubscriptions(response.data.data.data || []);
      setFilteredSubscriptions(response.data.data.data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      // If subscription API doesn't exist yet, you can use tenant data
      // For now, let's use tenant data as fallback
      const tenantsResponse = await apiClient.get('/superadmin/tenants');
      const tenantData = tenantsResponse.data.data.data || [];
      
      // Transform tenant data to subscription format
      const transformedData = tenantData.map(tenant => ({
        id: tenant.id,
        tenant_id: tenant.id,
        tenant_name: tenant.name,
        email: tenant.email,
        plan_name: tenant.plan_name || 'No Plan',
        amount: tenant.plan_price || 0,
        start_date: tenant.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        end_date: tenant.subscription_end_date?.split('T')[0] || 'N/A',
        status: tenant.subscription_status || 'active',
        created_at: tenant.created_at,
        updated_at: tenant.updated_at
      }));
      
      setSubscriptions(transformedData);
      setFilteredSubscriptions(transformedData);
      
      Swal.fire({
        icon: 'info',
        title: 'Info',
        text: 'Using tenant data (subscription API not configured)',
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/superadmin/tenants');
      const tenants = response.data.data.data || [];
      
      const activeSubscriptions = tenants.filter(t => t.subscription_status === 'active').length;
      const expiredSubscriptions = tenants.filter(t => t.subscription_status === 'expired').length;
      const activeTenants = tenants.filter(t => t.status === 'active').length;
      const monthlyRevenue = tenants.reduce((sum, t) => sum + (parseFloat(t.plan_price) || 0), 0);
      
      setStats({
        active_subscriptions: activeSubscriptions,
        expired_subscriptions: expiredSubscriptions,
        active_tenants: activeTenants,
        monthly_revenue: monthlyRevenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await planApi.getAll();
      let plansData = [];
      if (response.data && response.data.success) {
        if (response.data.data && response.data.data.data) {
          plansData = response.data.data.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          plansData = response.data.data;
        }
      }
      setPlans(plansData);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await apiClient.get('/superadmin/tenants');
      setTenants(response.data.data.data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const handleView = (subscription) => {
    setCurrentSubscription(subscription);
    setViewShow(true);
  };

  const handleCancelSubscription = async (subscription) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You want to cancel subscription for "${subscription.tenant_name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!',
    });

    if (result.isConfirmed) {
      try {
        // Update tenant subscription status
        await apiClient.put(`/superadmin/tenants/${subscription.tenant_id}`, {
          subscription_status: 'cancelled'
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Cancelled!',
          text: 'Subscription has been cancelled successfully',
          timer: 1500,
          showConfirmButton: false,
        });
        fetchSubscriptions();
        fetchStats();
      } catch (error) {
        console.error('Error cancelling subscription:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to cancel subscription',
        });
      }
    }
  };

  const handleCreateSubscription = async () => {
    if (!formData.tenantId || !formData.planId || !formData.startDate || !formData.endDate || !formData.amount) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill all required fields',
      });
      return;
    }

    try {
      const selectedPlanObj = plans.find(p => p.id === parseInt(formData.planId));
      
      // Update tenant with subscription details
      await apiClient.put(`/superadmin/tenants/${formData.tenantId}`, {
        plan_id: parseInt(formData.planId),
        subscription_start_date: formData.startDate,
        subscription_end_date: formData.endDate,
        subscription_status: formData.status,
        plan_name: selectedPlanObj?.name,
        plan_price: parseFloat(formData.amount)
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Subscription created successfully',
        timer: 1500,
        showConfirmButton: false,
      });
      setCreateShow(false);
      setFormData({
        tenantId: '',
        planId: '',
        startDate: '',
        endDate: '',
        amount: '',
        status: 'active'
      });
      fetchSubscriptions();
      fetchStats();
    } catch (error) {
      console.error('Error creating subscription:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to create subscription',
      });
    }
  };

  const handleDeleteSubscription = async (subscription) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete subscription for "${subscription.tenant_name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        // Clear subscription details from tenant
        await apiClient.put(`/superadmin/tenants/${subscription.tenant_id}`, {
          plan_id: null,
          subscription_start_date: null,
          subscription_end_date: null,
          subscription_status: 'expired',
          plan_name: null,
          plan_price: null
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Subscription has been deleted successfully',
          timer: 1500,
          showConfirmButton: false,
        });
        fetchSubscriptions();
        fetchStats();
      } catch (error) {
        console.error('Error deleting subscription:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to delete subscription',
        });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'success', icon: <FaCheckCircle size={10} className="me-1" />, text: 'Active' },
      expired: { bg: 'danger', icon: <FaTimesCircle size={10} className="me-1" />, text: 'Expired' },
      cancelled: { bg: 'warning', icon: <FaTimesCircle size={10} className="me-1" />, text: 'Cancelled' },
      trial: { bg: 'info', icon: <FaHourglassHalf size={10} className="me-1" />, text: 'Trial' },
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <Badge bg={config.bg} className="px-2 py-1 rounded-pill" style={{ fontSize: '11px', fontWeight: 500 }}>
        {config.icon} {config.text}
      </Badge>
    );
  };

  const formatPrice = (price) => {
    if (!price) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate || endDate === 'N/A') return 0;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate amount when plan is selected
  const handlePlanSelect = (planId) => {
    const selectedPlanObj = plans.find(p => p.id === parseInt(planId));
    if (selectedPlanObj) {
      setFormData(prev => ({
        ...prev,
        planId: planId,
        amount: selectedPlanObj.price
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        planId: planId,
        amount: ''
      }));
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubscriptions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedPlan('');
    setSelectedTenant('');
  };

  return (
    <div className="p-4" style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.5rem' }}>
          <FaBuilding className="me-2" style={{ color: '#dc3545', fontSize: '1.3rem' }} />
          Tenant Subscriptions
        </h3>
        <p className="text-muted mb-0" style={{ fontSize: '13px' }}>Manage all tenant subscriptions</p>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Active Subscriptions</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: '1.8rem' }}>{stats.active_subscriptions || 0}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#d1fae5', width: '36px', height: '36px' }}>
                  <FaCheckCircle size={16} style={{ color: '#10b981' }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Expired Subscriptions</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: '1.8rem' }}>{stats.expired_subscriptions || 0}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#fee2e2', width: '36px', height: '36px' }}>
                  <FaTimesCircle size={16} style={{ color: '#ef4444' }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Active Tenants</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: '1.8rem' }}>{stats.active_tenants || 0}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#e3f2fd', width: '36px', height: '36px' }}>
                  <FaUsers size={16} style={{ color: '#3085d6' }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Monthly Revenue</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: '1.5rem' }}>{formatPrice(stats.monthly_revenue || 0)}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#fff3e0', width: '36px', height: '36px' }}>
                  <FaRupeeSign size={16} style={{ color: '#f59e0b' }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-sm border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
        <Card.Header className="bg-white border-0 py-3 px-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h5 className="mb-0 fw-bold" style={{ fontSize: '1rem' }}>Subscriptions Database</h5>
              <p className="text-muted small mb-0" style={{ fontSize: '11px' }}>Manage and monitor tenant subscriptions</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={() => setCreateShow(true)} className="rounded-pill px-3" style={{ fontSize: '12px', padding: '5px 12px', background: '#1e3a6f', border: 'none' }}>
                <FaPlus className="me-1" size={12} /> Add Subscription
              </Button>
              <Button variant="outline-secondary" onClick={fetchSubscriptions} className="rounded-pill px-3" style={{ fontSize: '12px', padding: '5px 12px' }}>
                <FaSync className="me-1" size={12} /> Refresh
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {/* Search and Filter Bar */}
          <div className="px-4 pt-3 pb-2">
            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
              <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
                <InputGroup className="rounded-pill overflow-hidden shadow-sm">
                  <InputGroup.Text className="bg-white border-end-0" style={{ fontSize: '12px' }}>
                    <FaSearch className="text-muted" size={12} />
                  </InputGroup.Text>
                  <FormControl
                    placeholder="Search by tenant, plan or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                    style={{ fontSize: '13px' }}
                  />
                </InputGroup>
              </div>
              <div className="d-flex gap-2">
                <Form.Select
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  className="rounded-pill px-3"
                  style={{ width: '180px', fontSize: '12px' }}
                >
                  <option value="">All Tenants</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                  ))}
                </Form.Select>
                <Form.Select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="rounded-pill px-3"
                  style={{ width: '150px', fontSize: '12px' }}
                >
                  <option value="">All Plans</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                  ))}
                </Form.Select>
                <Form.Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-pill px-3"
                  style={{ width: '130px', fontSize: '12px' }}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="trial">Trial</option>
                </Form.Select>
                {(searchTerm || selectedStatus || selectedPlan || selectedTenant) && (
                  <Button variant="outline-secondary" onClick={clearFilters} className="rounded-pill px-3" style={{ fontSize: '12px' }}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: '2rem', height: '2rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted" style={{ fontSize: '13px' }}>Loading subscriptions...</p>
            </div>
          )}

          {/* Modern Table */}
          {!loading && (
            <div className="table-responsive px-4">
              <Table className="align-middle mb-0" style={{ minWidth: '1100px', fontSize: '12px' }}>
                <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
                  <tr className="text-muted">
                    <th className="py-2 ps-3" style={{ width: '60px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>#</th>
                    <th className="py-2" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Tenant</th>
                    <th className="py-2" style={{ width: '150px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Plan</th>
                    <th className="py-2" style={{ width: '100px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>Amount</th>
                    <th className="py-2" style={{ width: '130px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>Period</th>
                    <th className="py-2" style={{ width: '100px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                    <th className="py-2" style={{ width: '100px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Days Left</th>
                    <th className="py-2 text-center" style={{ width: '150px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <div className="text-muted">
                          <FaBuilding size={36} className="mb-2 opacity-25" />
                          <p style={{ fontSize: '13px' }}>No subscriptions found</p>
                          <Button variant="primary" size="sm" onClick={() => setCreateShow(true)} className="rounded-pill" style={{ fontSize: '11px' }}>
                            <FaPlus className="me-1" size={10} /> Add your first subscription
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((sub, i) => {
                      const daysRemaining = getDaysRemaining(sub.end_date);
                      return (
                        <tr key={sub.id} className="border-bottom" style={{ borderBottom: '1px solid #f0f2f8' }}>
                          <td className="py-2 ps-3 text-center fw-bold text-muted" style={{ fontSize: '12px' }}>{indexOfFirstItem + i + 1}</td>
                          <td className="py-2">
                            <div>
                              <div className="fw-semibold" style={{ fontSize: '13px' }}>{sub.tenant_name}</div>
                              <div className="small text-muted" style={{ fontSize: '10px' }}>{sub.email}</div>
                            </div>
                          </td>
                          <td className="py-2">
                            <Badge bg="info" className="px-2 py-1 rounded-pill" style={{ fontSize: '11px', fontWeight: 500 }}>
                              {sub.plan_name || 'No Plan'}
                            </Badge>
                          </td>
                          <td className="py-2 text-center">
                            <span className="fw-semibold" style={{ fontSize: '12px' }}>{formatPrice(sub.amount)}</span>
                          </td>
                          <td className="py-2 text-center">
                            <div style={{ fontSize: '11px' }}>
                              <div>{formatDate(sub.start_date)}</div>
                              <div>to</div>
                              <div>{formatDate(sub.end_date)}</div>
                            </div>
                          </td>
                          <td className="py-2 text-center">{getStatusBadge(sub.status)}</td>
                          <td className="py-2 text-center">
                            {sub.status === 'active' && daysRemaining > 0 ? (
                              <Badge bg={daysRemaining <= 7 ? 'warning' : 'secondary'} className="px-2 py-1 rounded-pill" style={{ fontSize: '11px', fontWeight: 500 }}>
                                {daysRemaining} days
                              </Badge>
                            ) : sub.status === 'active' && daysRemaining <= 0 ? (
                              <Badge bg="danger" className="px-2 py-1 rounded-pill" style={{ fontSize: '11px', fontWeight: 500 }}>
                                Expired
                              </Badge>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td className="py-2">
                            <div className="d-flex gap-2 justify-content-center">
                              <Button
                                size="sm"
                                variant="outline-info"
                                onClick={() => handleView(sub)}
                                title="View Details"
                                className="rounded-circle d-inline-flex align-items-center justify-content-center"
                                style={{ width: '28px', height: '28px', padding: '0', borderColor: '#0dcaf0', color: '#0dcaf0' }}
                              >
                                <FaEye size={12} />
                              </Button>
                              {sub.status === 'active' && (
                                <Button
                                  size="sm"
                                  variant="outline-warning"
                                  onClick={() => handleCancelSubscription(sub)}
                                  title="Cancel Subscription"
                                  className="rounded-circle d-inline-flex align-items-center justify-content-center"
                                  style={{ width: '28px', height: '28px', padding: '0', borderColor: '#ffc107', color: '#ffc107' }}
                                >
                                  <FaTimesCircle size={12} />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDeleteSubscription(sub)}
                                title="Delete Subscription"
                                className="rounded-circle d-inline-flex align-items-center justify-content-center"
                                style={{ width: '28px', height: '28px', padding: '0', borderColor: '#dc3545', color: '#dc3545' }}
                              >
                                <FaTrash size={12} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredSubscriptions.length > 0 && totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top mt-2">
              <div className="text-muted" style={{ fontSize: '11px' }}>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSubscriptions.length)} of {filteredSubscriptions.length} entries
              </div>
              <Pagination className="mb-0" style={{ fontSize: '12px' }}>
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
                    <Pagination.Item key={pageNum} active={pageNum === currentPage} onClick={() => paginate(pageNum)} className="mx-1" style={{ fontSize: '12px', minWidth: '30px', textAlign: 'center' }}>
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

      {/* View Modal */}
      <Modal show={viewShow} onHide={() => setViewShow(false)} centered size="lg">
        <Modal.Header closeButton className="bg-white border-0 pt-3 px-4">
          <Modal.Title className="fw-bold" style={{ fontSize: '1.1rem' }}>
            <FaEye className="me-2" style={{ color: '#0dcaf0', fontSize: '14px' }} /> Subscription Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          {currentSubscription && (
            <>
              <div className="text-center mb-3">
                <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2" style={{ width: '60px', height: '60px', background: 'transparent' }}>
                  <FaBuilding size={30} style={{ color: '#667eea' }} />
                </div>
                <h4 className="mb-0" style={{ fontSize: '1.2rem' }}>{currentSubscription.tenant_name}</h4>
                <p className="text-muted mb-0" style={{ fontSize: '12px' }}>{currentSubscription.email}</p>
              </div>

              <hr className="my-2" />

              <div className="row" style={{ fontSize: '12px' }}>
                <div className="col-md-6 mb-2">
                  <strong>Subscription ID:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: '12px' }}>#{currentSubscription.id}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Plan:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: '12px' }}>{currentSubscription.plan_name || 'No Plan'}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Amount:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: '12px' }}>{formatPrice(currentSubscription.amount)}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Status:</strong>
                  <div className="mt-1">{getStatusBadge(currentSubscription.status)}</div>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Start Date:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: '12px' }}>{formatDate(currentSubscription.start_date)}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>End Date:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: '12px' }}>{formatDate(currentSubscription.end_date)}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Created At:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: '12px' }}>{formatDate(currentSubscription.created_at)}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Last Updated:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: '12px' }}>{formatDate(currentSubscription.updated_at)}</p>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pb-3 px-4">
          <Button variant="secondary" onClick={() => setViewShow(false)} className="rounded-pill px-3" style={{ fontSize: '12px' }}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Create Subscription Modal */}
      <Modal show={createShow} onHide={() => setCreateShow(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-white border-0 pt-3 px-4">
          <Modal.Title className="fw-bold" style={{ fontSize: '1.1rem' }}>
            <FaPlus className="me-2" style={{ color: '#1e3a6f', fontSize: '14px' }} /> Create New Subscription
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          <Form>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: '12px' }}>Tenant <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="tenantId"
                value={formData.tenantId}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: '13px' }}
              >
                <option value="">Select Tenant</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>{tenant.name} ({tenant.email})</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: '12px' }}>Plan <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="planId"
                value={formData.planId}
                onChange={(e) => handlePlanSelect(e.target.value)}
                className="rounded-3"
                style={{ fontSize: '13px' }}
              >
                <option value="">Select Plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>{plan.name} - {formatPrice(plan.price)}/month</option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label className="fw-semibold" style={{ fontSize: '12px' }}>Start Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="rounded-3"
                    style={{ fontSize: '13px' }}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label className="fw-semibold" style={{ fontSize: '12px' }}>End Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="rounded-3"
                    style={{ fontSize: '13px' }}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: '12px' }}>Amount (₹) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                className="rounded-3"
                style={{ fontSize: '13px' }}
                readOnly
              />
              <Form.Text className="text-muted" style={{ fontSize: '11px' }}>Amount auto-populated from selected plan</Form.Text>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: '12px' }}>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: '13px' }}
              >
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="trial">Trial</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pb-3 px-4">
          <Button variant="light" onClick={() => setCreateShow(false)} className="rounded-pill px-3" style={{ fontSize: '12px' }}>Cancel</Button>
          <Button variant="primary" onClick={handleCreateSubscription} className="rounded-pill px-3" style={{ background: '#1e3a6f', fontSize: '12px' }}>
            Create Subscription
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TenantSubscription;