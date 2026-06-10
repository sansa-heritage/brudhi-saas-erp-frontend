// src/pages/reports/SalesReport.js
import React, { useState, useEffect } from 'react';
import { 
  getSalesReport, 
  exportSalesReport 
} from '../../api/tenant/report.api';

const SalesReport = () => {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Fetch sales report data
  const fetchSalesReport = async () => {
    setLoading(true);
    try {
      const response = await getSalesReport(fromDate, toDate);
      if (response.success) {
        setSalesData(response.data);
        console.log(response.data)
      } else {
        alert(response.message || 'Failed to fetch sales report');
      }
    } catch (error) {
      console.error('Error fetching sales report:', error);
      alert('Failed to fetch sales report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesReport();
  }, [fromDate, toDate]);

  // Handle PDF Export
  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const response = await exportSalesReport('pdf', fromDate, toDate);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
          console.log("📦 Blob created, size:", blob.size, "bytes");

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales_report_${fromDate}_to_${toDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Show success message
      alert('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert(error.response?.data?.message || 'Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Handle CSV Export
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await exportSalesReport('csv', fromDate, toDate);
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales_report_${fromDate}_to_${toDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('CSV exported successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  // Handle Excel Export
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await exportSalesReport('xlsx', fromDate, toDate);
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales_report_${fromDate}_to_${toDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('Excel exported successfully!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Failed to export Excel');
    } finally {
      setExporting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get summary data
  const summary = salesData?.summary?.[0] || {
    total_sales: 0,
    total_gst: 0,
    total_invoices: 0,
    avg_invoice_value: 0,
    unique_customers: 0
  };

  return (
    <div className="container-fluid px-4 py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Sales Report</h2>
        <div className="d-flex gap-2">
          <input
            type="date"
            className="form-control"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ width: '150px' }}
          />
          <input
            type="date"
            className="form-control"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{ width: '150px' }}
          />
          <button 
            onClick={fetchSalesReport} 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="mb-4">
        <button 
          onClick={handleExportPDF} 
          className="btn btn-danger me-2"
          disabled={exporting || !salesData}
        >
          <i className="fas fa-file-pdf me-1"></i> 
          {exporting ? 'Exporting...' : 'Export PDF'}
        </button>
        <button 
          onClick={handleExportCSV} 
          className="btn btn-success me-2"
          disabled={exporting || !salesData}
        >
          <i className="fas fa-file-csv me-1"></i> 
          Export CSV
        </button>
        <button 
          onClick={handleExportExcel} 
          className="btn btn-success"
          disabled={exporting || !salesData}
        >
          <i className="fas fa-file-excel me-1"></i> 
          Export Excel
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : salesData ? (
        <>
          {/* Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card bg-primary text-white h-100">
                <div className="card-body">
                  <h6 className="card-title">Total Sales</h6>
                  <h3 className="mb-0">{formatCurrency(summary.total_sales)}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-success text-white h-100">
                <div className="card-body">
                  <h6 className="card-title">Total GST</h6>
                  <h3 className="mb-0">{formatCurrency(summary.total_gst)}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-info text-white h-100">
                <div className="card-body">
                  <h6 className="card-title">Total Invoices</h6>
                  <h3 className="mb-0">{summary.total_invoices}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-warning text-white h-100">
                <div className="card-body">
                  <h6 className="card-title">Avg Invoice Value</h6>
                  <h3 className="mb-0">{formatCurrency(summary.avg_invoice_value)}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Sales Table */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Monthly Sales Breakdown</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Month</th>
                      <th>Invoices</th>
                      <th>Total Sales</th>
                      <th>Total GST</th>
                      <th>Average Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.monthly_data && salesData.monthly_data[0]?.length > 0 ? (
                      salesData.monthly_data[0].map((month, index) => (
                        <tr key={index}>
                          <td>{month.month} {month.month_num}</td>
                          <td>{month.invoice_count}</td>
                          <td>{formatCurrency(month.total_sales)}</td>
                          <td>{formatCurrency(month.total_gst)}</td>
                          <td>{formatCurrency(month.average_invoice_value)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">No monthly data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Daily Sales Table */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Daily Sales Details</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Date</th>
                      <th>Day</th>
                      <th>Daily Sales</th>
                      <th>Invoice Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.daily_data && salesData.daily_data[0]?.length > 0 ? (
                      salesData.daily_data[0].map((day, index) => (
                        <tr key={index}>
                          <td>{new Date(day.date).toLocaleDateString()}</td>
                          <td>{day.day}</td>
                          <td>{formatCurrency(day.daily_sales)}</td>
                          <td>{day.invoice_count}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">No daily data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-info">No data available for the selected date range</div>
      )}
    </div>
  );
};

export default SalesReport;