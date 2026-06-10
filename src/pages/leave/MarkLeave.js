import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaSave,
  FaTimes,
  FaUser,
  FaCalendarAlt,
  FaInfoCircle,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { markLeave } from "../../api/tenant/leave.api";
import { getStaff } from "../../components/services/staffService";

const MarkLeave = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    staff_id: "",
    leave_date: new Date().toISOString().split("T")[0],
    leave_type: "casual",
    reason: "",
  });

  useEffect(() => {
    loadStaffList();
  }, []);

  const loadStaffList = async () => {
    setLoadingStaff(true);
    try {
      const response = await getStaff();
      let staffArray = [];
      if (response?.data?.data) {
        staffArray = response.data.data;
      } else if (response?.data) {
        staffArray = response.data;
      } else if (Array.isArray(response)) {
        staffArray = response;
      }
      setStaffList(staffArray);
    } catch (error) {
      console.error("Failed to load staff:", error);
      toast.error("Failed to load staff list", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.staff_id) {
      newErrors.staff_id = "Please select a staff member";
    }

    if (!formData.leave_date) {
      newErrors.leave_date = "Leave date is required";
    } else {
      const selectedDate = new Date(formData.leave_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        newErrors.leave_date = "Leave date cannot be in the future";
      }
    }

    if (!formData.leave_type) {
      newErrors.leave_type = "Please select leave type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedStaff = staffList.find(
      (s) => s.id === parseInt(formData.staff_id),
    );

    setLoading(true);
    try {
      const submitData = {
        staff_id: parseInt(formData.staff_id),
        leave_date: formData.leave_date,
        leave_type: formData.leave_type,
        reason: formData.reason || null,
      };

      console.log("Marking leave:", submitData);
      await markLeave(submitData);

      toast.success(
        `✅ Leave marked for ${selectedStaff?.first_name} ${selectedStaff?.last_name} on ${formData.leave_date}!`,
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
          transition: Bounce,
        },
      );

      setTimeout(() => {
        navigate("/staff/leave-history");
      }, 1500);
    } catch (error) {
      console.error("Failed to mark leave:", error);
      toast.error(error.response?.data?.message || "Failed to mark leave", {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  const leaveTypes = [
    { value: "casual", label: "Casual Leave", color: "#17a2b8" },
    { value: "sick", label: "Sick Leave", color: "#dc3545" },
    { value: "annual", label: "Annual Leave", color: "#28a745" },
    { value: "unpaid", label: "Unpaid Leave", color: "#6c757d" },
    { value: "emergency", label: "Emergency Leave", color: "#fd7e14" },
  ];

  return (
    <Container
      fluid
      className="px-4 py-3"
      style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />

      {/* Breadcrumb Navigation */}
      {/* <div className="mb-4">
        <Button
          variant="link"
          onClick={() => navigate("/staff/leave-history")}
          className="text-decoration-none p-0 mb-2"
          style={{ color: "rgb(30, 58, 111)" }}
        >
          <FaArrowLeft className="me-1" size={14} />
          Back to Leave History
        </Button>
        <div>
          <h3 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
            Mark Staff Leave
          </h3>
          <p className="text-muted mb-0">Record leave for staff members</p>
        </div>
      </div> */}

      <Form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm rounded-3">
          <Card.Header
            className="bg-white border-bottom-0 pt-4 px-4"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <div className="d-flex align-items-center gap-2">
              <FaCalendarAlt size={20} style={{ color: "rgb(30, 58, 111)" }} />
              <h5
                className="fw-bold mb-0"
                style={{ color: "rgb(30, 58, 111)" }}
              >
                Leave Information
              </h5>
            </div>
          </Card.Header>

          <Card.Body className="p-4">
            <Row>
              <Col lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaUser className="me-1" /> Select Staff Member *
                  </Form.Label>
                  <Form.Select
                    name="staff_id"
                    value={formData.staff_id}
                    onChange={handleChange}
                    isInvalid={!!errors.staff_id}
                    disabled={loadingStaff}
                  >
                    <option value="">-- Select Staff Member --</option>
                    {staffList.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.first_name} {staff.last_name} -{" "}
                        {staff.staff_code}
                      </option>
                    ))}
                  </Form.Select>
                  {loadingStaff && (
                    <Form.Text className="text-muted">
                      <Spinner animation="border" size="sm" /> Loading staff...
                    </Form.Text>
                  )}
                  {errors.staff_id && (
                    <Form.Text className="text-danger">
                      {errors.staff_id}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>

              <Col lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaCalendarAlt className="me-1" /> Leave Date *
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="leave_date"
                    value={formData.leave_date}
                    onChange={handleChange}
                    isInvalid={!!errors.leave_date}
                  />
                  {errors.leave_date && (
                    <Form.Text className="text-danger">
                      {errors.leave_date}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>

              <Col lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Leave Type *</Form.Label>
                  <Form.Select
                    name="leave_type"
                    value={formData.leave_type}
                    onChange={handleChange}
                    isInvalid={!!errors.leave_type}
                  >
                    {leaveTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.leave_type && (
                    <Form.Text className="text-danger">
                      {errors.leave_type}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>

              <Col lg={12}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaInfoCircle className="me-1" /> Reason (Optional)
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Enter reason for leave..."
                  />
                  <Form.Text className="text-muted">
                    Provide additional details about the leave
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Leave Types Info */}
            <Row className="mt-3">
              <Col lg={12}>
                <div className="bg-light p-3 rounded-3">
                  <h6 className="fw-bold mb-2">Leave Types Information</h6>
                  <div className="d-flex flex-wrap gap-3">
                    {leaveTypes.map((type) => (
                      <div
                        key={type.value}
                        className="d-flex align-items-center gap-2"
                      >
                        <span
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor: type.color,
                          }}
                        ></span>
                        <small>{type.label}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>

          {/* Action Buttons inside Card Footer */}
          <Card.Footer className="bg-white border-top-0 pb-4 px-4">
            <div className="d-flex justify-content-between gap-3">
              <Button
                onClick={() => navigate("/staff/leave-history")}
                style={{
                  backgroundColor: "#6c757d",
                  border: "none",
                  borderRadius: "30px",
                  padding: "10px 24px",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#fff",
                }}
              >
                <FaTimes size={14} /> Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: "rgb(30, 58, 111)",
                  border: "none",
                  borderRadius: "30px",
                  padding: "10px 24px",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 6px rgba(30, 58, 111, 0.25)",
                }}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Marking...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="me-2" /> Mark Leave
                  </>
                )}
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </Form>

      <style>{`
        .rounded-3 {
          border-radius: 12px !important;
        }
        .bg-light {
          background-color: #f8f9fa !important;
        }
      `}</style>
    </Container>
  );
};

export default MarkLeave;
