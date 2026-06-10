// src/pages/companysetting/CompanySetting.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Tabs,
  Tab,
  Row,
  Col,
  Form,
  Button,
  Image,
  Alert,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  FaBuilding,
  FaImage,
  FaUniversity,
  FaFileInvoiceDollar,
  FaSave,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaUndo,
} from "react-icons/fa";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../api/client";

const CompanySetting = () => {
  const [activeTab, setActiveTab] = useState("branding");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);
  const [error, setError] = useState("");
  const [isNewRecord, setIsNewRecord] = useState(true); // Track if it's a new record

  // Store original data for reset functionality
  const [originalData, setOriginalData] = useState({
    branding: null,
    companyInfo: null,
    bankDetails: null,
    taxInfo: null,
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    company_name: "",
    email: "",
    phone: "",
    alternate_phone: "",
    pincode: "",
    website: "",
    gst_number: "",
    pan_number: "",
    tan_number: "",
    ifsc_code: "",
    account_number: "",
    bank_name: "",
    account_holder_name: "",
    branch_name: "",
    upi_id: "",
  });

  // Form data state for each tab
  const [brandingData, setBrandingData] = useState({
    companyName: "",
    tagline: "",
    primaryColor: "#1e3a6f",
    website: "",
  });

  const [companyInfoData, setCompanyInfoData] = useState({
    companyName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [bankDetailsData, setBankDetailsData] = useState({
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    upiId: "",
  });

  const [taxInfoData, setTaxInfoData] = useState({
    gstNumber: "",
    panNumber: "",
    tanNumber: "",
    businessType: "",
    taxAddress: "",
  });

  // Validation functions
  const validateEmail = (email) => {
    if (!email) return { isValid: true, message: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      return { isValid: true, message: "" };
    }
    return { isValid: false, message: "Invalid email format" };
  };

  const validatePhone = (phone) => {
    if (!phone) return { isValid: true, message: "" };
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return {
        isValid: false,
        message: "Phone number must be exactly 10 digits (0-9 only)",
      };
    }
    const firstDigit = phone.charAt(0);
    if (!["6", "7", "8", "9"].includes(firstDigit)) {
      return {
        isValid: false,
        message: "Phone number must start with 6, 7, 8, or 9",
      };
    }
    return { isValid: true, message: "" };
  };

  const validateAlternatePhone = (alternatePhone, primaryPhone) => {
    if (!alternatePhone) return { isValid: true, message: "" };
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(alternatePhone)) {
      return {
        isValid: false,
        message: "Alternate phone must be exactly 10 digits (0-9 only)",
      };
    }
    const firstDigit = alternatePhone.charAt(0);
    if (!["6", "7", "8", "9"].includes(firstDigit)) {
      return {
        isValid: false,
        message: "Alternate phone must start with 6, 7, 8, or 9",
      };
    }
    if (alternatePhone === primaryPhone) {
      return {
        isValid: false,
        message: "Alternate phone cannot be same as primary phone number",
      };
    }
    return { isValid: true, message: "" };
  };

  const validateGST = (gstNumber) => {
    if (!gstNumber) return { isValid: true, message: "" };
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    if (gstRegex.test(gstNumber.toUpperCase())) {
      return { isValid: true, message: "" };
    }
    return {
      isValid: false,
      message: "Invalid GST format (e.g., 22ABCDE1234F1Z5)",
    };
  };

  const validatePAN = (panNumber) => {
    if (!panNumber) return { isValid: true, message: "" };
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (panRegex.test(panNumber.toUpperCase())) {
      return { isValid: true, message: "" };
    }
    return { isValid: false, message: "Invalid PAN format (e.g., ABCDE1234F)" };
  };

  const validateTAN = (tanNumber) => {
    if (!tanNumber) return { isValid: true, message: "" };
    const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;
    if (tanRegex.test(tanNumber.toUpperCase())) {
      return { isValid: true, message: "" };
    }
    return { isValid: false, message: "Invalid TAN format (e.g., ABCD12345E)" };
  };

  const validateIFSC = (ifscCode) => {
    if (!ifscCode) return { isValid: true, message: "" };
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (ifscRegex.test(ifscCode.toUpperCase())) {
      return { isValid: true, message: "" };
    }
    return {
      isValid: false,
      message: "Invalid IFSC format (e.g., SBIN0001234)",
    };
  };

  const validatePincode = (pincode) => {
    if (!pincode) return { isValid: true, message: "" };
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (pincodeRegex.test(pincode)) {
      return { isValid: true, message: "" };
    }
    return { isValid: false, message: "Pincode must be 6 digits" };
  };

  const validateWebsite = (website) => {
    if (!website) return { isValid: true, message: "" };
    const websiteRegex =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (websiteRegex.test(website)) {
      return { isValid: true, message: "" };
    }
    return { isValid: false, message: "Invalid website URL" };
  };

  const validateAccountNumber = (accountNumber) => {
    if (!accountNumber) return { isValid: true, message: "" };
    if (accountNumber.length >= 9 && accountNumber.length <= 18) {
      return { isValid: true, message: "" };
    }
    return {
      isValid: false,
      message: "Account number must be between 9-18 digits",
    };
  };

  const validateBankName = (bankName) => {
    if (!bankName) return { isValid: true, message: "" };
    if (bankName.trim().length < 2) {
      return {
        isValid: false,
        message: "Bank name must be at least 2 characters",
      };
    }
    if (bankName.trim().length > 100) {
      return {
        isValid: false,
        message: "Bank name cannot exceed 100 characters",
      };
    }
    return { isValid: true, message: "" };
  };

  const validateAccountHolderName = (name) => {
    if (!name) return { isValid: true, message: "" };
    if (name.trim().length < 3) {
      return {
        isValid: false,
        message: "Account holder name must be at least 3 characters",
      };
    }
    if (name.trim().length > 100) {
      return {
        isValid: false,
        message: "Account holder name cannot exceed 100 characters",
      };
    }
    const nameRegex = /^[a-zA-Z\s\.]+$/;
    if (!nameRegex.test(name.trim())) {
      return {
        isValid: false,
        message:
          "Account holder name should contain only letters, spaces, and dots",
      };
    }
    return { isValid: true, message: "" };
  };

  const validateBranchName = (branchName) => {
    if (!branchName) return { isValid: true, message: "" };
    if (branchName.trim().length < 2) {
      return {
        isValid: false,
        message: "Branch name must be at least 2 characters",
      };
    }
    if (branchName.trim().length > 100) {
      return {
        isValid: false,
        message: "Branch name cannot exceed 100 characters",
      };
    }
    return { isValid: true, message: "" };
  };

  const validateUPIId = (upiId) => {
    if (!upiId) return { isValid: true, message: "" };
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{3,}$/;
    if (upiRegex.test(upiId)) {
      return { isValid: true, message: "" };
    }
    return {
      isValid: false,
      message: "Invalid UPI ID format (e.g., username@bankname)",
    };
  };

  const getValidationIcon = (fieldValue, validationError) => {
    if (!fieldValue) {
      return <FaInfoCircle className="text-secondary ms-2" size={14} />;
    }
    if (!validationError) {
      return <FaCheckCircle className="text-success ms-2" size={14} />;
    }
    return (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={`tooltip-${fieldValue}`}>{validationError}</Tooltip>
        }
      >
        <span className="text-danger ms-2" style={{ cursor: "pointer" }}>
          <FaExclamationTriangle size={14} />
        </span>
      </OverlayTrigger>
    );
  };

  // Load company settings on mount
  useEffect(() => {
    loadCompanySettings();
  }, []);

  const loadCompanySettings = async () => {
    setLoading(true);
    try {
      const tenantId = localStorage.getItem("tenantId");

      const response = await apiClient.get("/company-settings", {
        headers: {
          "x-tenant-id": tenantId || "14",
        },
      });

      const data = response.data?.data || response.data;

      if (data && data.id) {
        setIsNewRecord(false); // Existing record found
        const branding = {
          companyName: data.company_name || "",
          tagline: data.brand_tagline || "",
          primaryColor: data.primary_color || "#1e3a6f",
          website: data.website || "",
        };

        const companyInfo = {
          companyName: data.company_name || "",
          email: data.company_email || "",
          phone: data.company_phone || "",
          alternatePhone: data.alternate_phone || "",
          address: data.company_address || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
        };

        const bankDetails = {
          bankName: data.bank_name || "",
          accountHolderName: data.account_holder_name || "",
          accountNumber: data.account_number || "",
          ifscCode: data.ifsc_code || "",
          branchName: data.branch_name || "",
          upiId: data.upi_id || "",
        };

        const taxInfo = {
          gstNumber: data.gst_number || "",
          panNumber: data.pan_number || "",
          tanNumber: data.tan_number || "",
          businessType: data.business_type || "",
          taxAddress: data.tax_address || "",
        };

        setBrandingData(branding);
        setCompanyInfoData(companyInfo);
        setBankDetailsData(bankDetails);
        setTaxInfoData(taxInfo);

        setOriginalData({ branding, companyInfo, bankDetails, taxInfo });

        if (data.logo) {
          setExistingLogo(data.logo);
          setLogoPreview(data.logo);
        }
      } else {
        setIsNewRecord(true); // No record found, will be a new record
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      if (error.response?.status === 404) {
        setIsNewRecord(true); // Not found, will be a new record
      } else if (error.response?.status !== 404) {
        toast.error("Failed to load company settings", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
          transition: Bounce,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset functions for each tab
  const resetBranding = () => {
    if (originalData.branding) {
      setBrandingData(originalData.branding);
      setLogoPreview(originalData.branding.logo || existingLogo);
      setLogoFile(null);
      setValidationErrors((prev) => ({ ...prev, website: "" }));
      toast.info("Branding settings reset to saved values!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
        transition: Bounce,
      });
    }
  };

  const resetCompanyInfo = () => {
    if (originalData.companyInfo) {
      setCompanyInfoData(originalData.companyInfo);
      setValidationErrors((prev) => ({
        ...prev,
        email: "",
        phone: "",
        alternate_phone: "",
        pincode: "",
      }));
      toast.info("Company information reset to saved values!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
        transition: Bounce,
      });
    }
  };

  const resetBankDetails = () => {
    if (originalData.bankDetails) {
      setBankDetailsData(originalData.bankDetails);
      setValidationErrors((prev) => ({
        ...prev,
        ifsc_code: "",
        account_number: "",
        bank_name: "",
        account_holder_name: "",
        branch_name: "",
        upi_id: "",
      }));
      toast.info("Bank details reset to saved values!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
        transition: Bounce,
      });
    }
  };

  const resetTaxInfo = () => {
    if (originalData.taxInfo) {
      setTaxInfoData(originalData.taxInfo);
      setValidationErrors((prev) => ({
        ...prev,
        gst_number: "",
        pan_number: "",
        tan_number: "",
      }));
      toast.info("Tax information reset to saved values!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
        transition: Bounce,
      });
    }
  };

  const compressImage = (base64String, maxSize = 500 * 1024) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.src = base64String;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;

        const maxDimension = 800;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.7;
        let compressed = canvas.toDataURL("image/jpeg", quality);

        while (compressed.length > maxSize && quality > 0.1) {
          quality -= 0.1;
          compressed = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(compressed);
      };
      img.onerror = (error) => {
        reject(error);
      };
    });
  };

  // Handle input changes with validation
  const handleBrandingChange = (e) => {
    const { name, value } = e.target;
    setBrandingData((prev) => ({ ...prev, [name]: value }));

    if (name === "website") {
      const validation = validateWebsite(value);
      setValidationErrors((prev) => ({
        ...prev,
        website: validation.isValid ? "" : validation.message,
      }));
    }
  };

  const handleCompanyInfoChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;
    if (name === "phone" || name === "alternatePhone") {
      processedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setCompanyInfoData((prev) => ({ ...prev, [name]: processedValue }));

    if (name === "email") {
      const validation = validateEmail(processedValue);
      setValidationErrors((prev) => ({
        ...prev,
        email: validation.isValid ? "" : validation.message,
      }));
    } else if (name === "phone") {
      const validation = validatePhone(processedValue);
      setValidationErrors((prev) => ({
        ...prev,
        phone: validation.isValid ? "" : validation.message,
      }));

      if (companyInfoData.alternatePhone) {
        const altValidation = validateAlternatePhone(
          companyInfoData.alternatePhone,
          processedValue,
        );
        setValidationErrors((prev) => ({
          ...prev,
          alternate_phone: altValidation.isValid ? "" : altValidation.message,
        }));
      }
    } else if (name === "alternatePhone") {
      const validation = validateAlternatePhone(
        processedValue,
        companyInfoData.phone,
      );
      setValidationErrors((prev) => ({
        ...prev,
        alternate_phone: validation.isValid ? "" : validation.message,
      }));
    } else if (name === "pincode") {
      const validation = validatePincode(processedValue);
      setValidationErrors((prev) => ({
        ...prev,
        pincode: validation.isValid ? "" : validation.message,
      }));
    }
  };

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    setBankDetailsData((prev) => ({ ...prev, [name]: value }));

    if (name === "bankName") {
      const validation = validateBankName(value);
      setValidationErrors((prev) => ({
        ...prev,
        bank_name: validation.isValid ? "" : validation.message,
      }));
    } else if (name === "accountHolderName") {
      const validation = validateAccountHolderName(value);
      setValidationErrors((prev) => ({
        ...prev,
        account_holder_name: validation.isValid ? "" : validation.message,
      }));
    } else if (name === "accountNumber") {
      const validation = validateAccountNumber(value);
      setValidationErrors((prev) => ({
        ...prev,
        account_number: validation.isValid ? "" : validation.message,
      }));
    } else if (name === "ifscCode") {
      const validation = validateIFSC(value);
      setValidationErrors((prev) => ({
        ...prev,
        ifsc_code: validation.isValid ? "" : validation.message,
      }));
    } else if (name === "branchName") {
      const validation = validateBranchName(value);
      setValidationErrors((prev) => ({
        ...prev,
        branch_name: validation.isValid ? "" : validation.message,
      }));
    } else if (name === "upiId") {
      const validation = validateUPIId(value);
      setValidationErrors((prev) => ({
        ...prev,
        upi_id: validation.isValid ? "" : validation.message,
      }));
    }
  };

  const handleTaxInfoChange = (e) => {
    const { name, value } = e.target;
    setTaxInfoData((prev) => ({ ...prev, [name]: value }));

    if (name === "gstNumber") {
      const validation = validateGST(value);
      setValidationErrors((prev) => ({
        ...prev,
        gst_number: validation.isValid ? "" : validation.message,
      }));
    } else if (name === "panNumber") {
      const validation = validatePAN(value);
      setValidationErrors((prev) => ({
        ...prev,
        pan_number: validation.isValid ? "" : validation.message,
      }));
    } else if (name === "tanNumber") {
      const validation = validateTAN(value);
      setValidationErrors((prev) => ({
        ...prev,
        tan_number: validation.isValid ? "" : validation.message,
      }));
    }
  };

  // Handle logo upload
  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
      ];
      const maxSize = 2 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPEG, PNG, WEBP images are allowed", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
          transition: Bounce,
        });
        return;
      }
      if (file.size > maxSize) {
        toast.error("Image size must be less than 2MB", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
          transition: Bounce,
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressedLogo = await compressImage(reader.result);
        setLogoFile(compressedLogo);
        setLogoPreview(compressedLogo);
        toast.success("Logo uploaded successfully!", {
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
          transition: Bounce,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate Bank Details before save
  const validateBankDetailsForm = () => {
    const bankNameValidation = validateBankName(bankDetailsData.bankName);
    const accountHolderValidation = validateAccountHolderName(
      bankDetailsData.accountHolderName,
    );
    const ifscValidation = validateIFSC(bankDetailsData.ifscCode);
    const accountValidation = validateAccountNumber(
      bankDetailsData.accountNumber,
    );
    const branchValidation = validateBranchName(bankDetailsData.branchName);
    const upiValidation = validateUPIId(bankDetailsData.upiId);

    if (bankDetailsData.bankName && !bankNameValidation.isValid) {
      toast.error(bankNameValidation.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      return false;
    }
    if (bankDetailsData.accountHolderName && !accountHolderValidation.isValid) {
      toast.error(accountHolderValidation.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      return false;
    }
    if (bankDetailsData.ifscCode && !ifscValidation.isValid) {
      toast.error(ifscValidation.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      return false;
    }
    if (bankDetailsData.accountNumber && !accountValidation.isValid) {
      toast.error(accountValidation.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      return false;
    }
    if (bankDetailsData.branchName && !branchValidation.isValid) {
      toast.error(branchValidation.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      return false;
    }
    if (bankDetailsData.upiId && !upiValidation.isValid) {
      toast.error(upiValidation.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      return false;
    }

    return true;
  };

  // Save Branding
  const handleSaveBranding = async () => {
    if (brandingData.website) {
      const websiteValidation = validateWebsite(brandingData.website);
      if (!websiteValidation.isValid) {
        toast.error(websiteValidation.message, {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
          transition: Bounce,
        });
        return;
      }
    }

    setSaving(true);
    const loadingToast = toast.loading("Saving branding settings...", {
      position: "top-right",
      theme: "colored",
    });

    try {
      const tenantId = localStorage.getItem("tenantId");

      const payload = {
        company_name: brandingData.companyName,
        brand_tagline: brandingData.tagline || null,
        primary_color: brandingData.primaryColor,
        website: brandingData.website || null,
        logo: logoFile || existingLogo || null,
      };

      await apiClient.put("/company-settings", payload, {
        headers: {
          "x-tenant-id": tenantId || "14",
        },
      });

      const successMessage = isNewRecord 
        ? "✅ Logo & Branding added successfully!" 
        : "✅ Logo & Branding updated successfully!";
      
      const toastMessage = isNewRecord
        ? "🎉 Branding settings have been added successfully!"
        : "🎉 Branding settings have been updated successfully!";

      toast.update(loadingToast, {
        render: successMessage,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      toast.success(toastMessage, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });

      await loadCompanySettings();
      setLogoFile(null);
    } catch (error) {
      console.error("Error saving branding:", error);
      toast.update(loadingToast, {
        render: error.response?.data?.message || "❌ Failed to save branding data",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  // Save Company Info
  const handleSaveCompanyInfo = async () => {
    const emailValidation = validateEmail(companyInfoData.email);
    const phoneValidation = validatePhone(companyInfoData.phone);
    const altPhoneValidation = validateAlternatePhone(
      companyInfoData.alternatePhone,
      companyInfoData.phone,
    );
    const pincodeValidation = validatePincode(companyInfoData.pincode);

    if (companyInfoData.email && !emailValidation.isValid) {
      toast.error(emailValidation.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      return;
    }
    if (companyInfoData.phone && !phoneValidation.isValid) {
      toast.error(phoneValidation.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      return;
    }
    if (companyInfoData.alternatePhone && !altPhoneValidation.isValid) {
      toast.error(altPhoneValidation.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      return;
    }
    if (companyInfoData.pincode && !pincodeValidation.isValid) {
      toast.error(pincodeValidation.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading("Saving company information...", {
      position: "top-right",
      theme: "colored",
    });

    try {
      const tenantId = localStorage.getItem("tenantId");

      const payload = {
        company_name: companyInfoData.companyName,
        company_email: companyInfoData.email || null,
        company_phone: companyInfoData.phone || null,
        alternate_phone: companyInfoData.alternatePhone || null,
        company_address: companyInfoData.address || null,
        city: companyInfoData.city || null,
        state: companyInfoData.state || null,
        pincode: companyInfoData.pincode || null,
      };

      await apiClient.put("/company-settings", payload, {
        headers: {
          "x-tenant-id": tenantId || "14",
        },
      });

      const successMessage = isNewRecord 
        ? "✅ Company Information added successfully!" 
        : "✅ Company Information updated successfully!";
      
      const toastMessage = isNewRecord
        ? "🏢 Company information has been added successfully!"
        : "🏢 Company information has been updated successfully!";

      toast.update(loadingToast, {
        render: successMessage,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      toast.success(toastMessage, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });

      await loadCompanySettings();
    } catch (error) {
      console.error("Error saving company info:", error);
      toast.update(loadingToast, {
        render: error.response?.data?.message || "❌ Failed to save company information",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  // Save Bank Details
  const handleSaveBankDetails = async () => {
    if (!validateBankDetailsForm()) return;

    setSaving(true);
    const loadingToast = toast.loading("Saving bank details...", {
      position: "top-right",
      theme: "colored",
    });

    try {
      const tenantId = localStorage.getItem("tenantId");

      const payload = {
        bank_name: bankDetailsData.bankName || null,
        account_holder_name: bankDetailsData.accountHolderName || null,
        account_number: bankDetailsData.accountNumber || null,
        ifsc_code: bankDetailsData.ifscCode || null,
        branch_name: bankDetailsData.branchName || null,
        upi_id: bankDetailsData.upiId || null,
      };

      await apiClient.put("/company-settings", payload, {
        headers: {
          "x-tenant-id": tenantId || "14",
        },
      });

      const successMessage = isNewRecord 
        ? "✅ Bank Details added successfully!" 
        : "✅ Bank Details updated successfully!";
      
      const toastMessage = isNewRecord
        ? "🏦 Bank details have been added successfully!"
        : "🏦 Bank details have been updated successfully!";

      toast.update(loadingToast, {
        render: successMessage,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      toast.success(toastMessage, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });

      await loadCompanySettings();
    } catch (error) {
      console.error("Error saving bank details:", error);
      toast.update(loadingToast, {
        render: error.response?.data?.message || "❌ Failed to save bank details",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  // Save Tax Info
  const handleSaveTaxInfo = async () => {
    const gstValidation = validateGST(taxInfoData.gstNumber);
    const panValidation = validatePAN(taxInfoData.panNumber);
    const tanValidation = validateTAN(taxInfoData.tanNumber);

    if (taxInfoData.gstNumber && !gstValidation.isValid) {
      toast.error(gstValidation.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      return;
    }
    if (taxInfoData.panNumber && !panValidation.isValid) {
      toast.error(panValidation.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      return;
    }
    if (taxInfoData.tanNumber && !tanValidation.isValid) {
      toast.error(tanValidation.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading("Saving tax information...", {
      position: "top-right",
      theme: "colored",
    });

    try {
      const tenantId = localStorage.getItem("tenantId");

      const payload = {
        gst_number: taxInfoData.gstNumber || null,
        pan_number: taxInfoData.panNumber || null,
        tan_number: taxInfoData.tanNumber || null,
        business_type: taxInfoData.businessType || null,
        tax_address: taxInfoData.taxAddress || null,
      };

      await apiClient.put("/company-settings", payload, {
        headers: {
          "x-tenant-id": tenantId || "14",
        },
      });

      const successMessage = isNewRecord 
        ? "✅ Tax Information added successfully!" 
        : "✅ Tax Information updated successfully!";
      
      const toastMessage = isNewRecord
        ? "📋 Tax information has been added successfully!"
        : "📋 Tax information has been updated successfully!";

      toast.update(loadingToast, {
        render: successMessage,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      toast.success(toastMessage, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });

      await loadCompanySettings();
    } catch (error) {
      console.error("Error saving tax info:", error);
      toast.update(loadingToast, {
        render: error.response?.data?.message || "❌ Failed to save tax information",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container
        fluid
        className="px-4 py-3"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
      >
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h4 className="mt-3">Loading company settings...</h4>
        </div>
      </Container>
    );
  }

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

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Header className="bg-white border-0 pt-3 px-4">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="border-0 gap-2"
          >
            <Tab
              eventKey="branding"
              title={
                <span className="fw-semibold">
                  <FaImage className="me-2" /> Logo & Branding
                </span>
              }
            />
            <Tab
              eventKey="companyinfo"
              title={
                <span className="fw-semibold">
                  <FaBuilding className="me-2" /> Company Info
                </span>
              }
            />
            <Tab
              eventKey="bankdetails"
              title={
                <span className="fw-semibold">
                  <FaUniversity className="me-2" /> Bank Details
                </span>
              }
            />
            <Tab
              eventKey="taxinfo"
              title={
                <span className="fw-semibold">
                  <FaFileInvoiceDollar className="me-2" /> Tax Info
                </span>
              }
            />
          </Tabs>
        </Card.Header>

        <Card.Body className="p-4">
          {/* Logo & Branding Tab */}
          {activeTab === "branding" && (
            <div>
              <Row>
                <Col md={4} className="text-center">
                  <div className="mb-3">
                    {logoPreview ? (
                      <Image
                        src={logoPreview}
                        rounded
                        fluid
                        style={{
                          width: "180px",
                          height: "180px",
                          objectFit: "contain",
                          border: "1px solid #ddd",
                          padding: "10px",
                          backgroundColor: "#fff",
                        }}
                      />
                    ) : (
                      <div
                        className="d-flex justify-content-center align-items-center bg-light rounded"
                        style={{
                          width: "180px",
                          height: "180px",
                          margin: "auto",
                          border: "1px dashed #aaa",
                          backgroundColor: "#fff",
                        }}
                      >
                        <span className="text-muted">No Logo</span>
                      </div>
                    )}
                  </div>

                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Upload Company Logo
                    </Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      size="sm"
                    />
                    <Form.Text className="text-muted">
                      JPEG, PNG, WEBP (Max 2MB)
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={8}>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Company Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="companyName"
                          value={brandingData.companyName}
                          onChange={handleBrandingChange}
                          placeholder="Enter company name"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Brand Tagline</Form.Label>
                        <Form.Control
                          type="text"
                          name="tagline"
                          value={brandingData.tagline}
                          onChange={handleBrandingChange}
                          placeholder="Enter tagline"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Primary Color</Form.Label>
                        <div className="d-flex align-items-center gap-2">
                          <Form.Control
                            type="color"
                            name="primaryColor"
                            value={brandingData.primaryColor}
                            onChange={handleBrandingChange}
                            style={{ width: "60px", height: "38px" }}
                          />
                          <Form.Control
                            type="text"
                            value={brandingData.primaryColor}
                            onChange={handleBrandingChange}
                            name="primaryColor"
                            placeholder="#1e3a6f"
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Website</Form.Label>
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="text"
                            name="website"
                            value={brandingData.website}
                            onChange={handleBrandingChange}
                            placeholder="https://example.com"
                            isInvalid={
                              !!validationErrors.website &&
                              !!brandingData.website
                            }
                            className="flex-grow-1"
                          />
                          {getValidationIcon(
                            brandingData.website,
                            validationErrors.website,
                          )}
                        </div>
                        {validationErrors.website && brandingData.website && (
                          <Form.Text className="text-danger">
                            {validationErrors.website}
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-3 mt-4">
                <Button
                  onClick={resetBranding}
                  variant="outline-secondary"
                  style={{
                    borderRadius: "30px",
                    padding: "10px 28px",
                    fontWeight: "600",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaUndo className="me-2" /> Reset
                </Button>
                <Button
                  onClick={handleSaveBranding}
                  disabled={saving}
                  style={{
                    backgroundColor: "rgb(30, 58, 111)",
                    border: "none",
                    borderRadius: "30px",
                    padding: "10px 28px",
                    fontWeight: "600",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 6px rgba(30, 58, 111, 0.25)",
                  }}
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="me-2" /> Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Company Info Tab */}
          {activeTab === "companyinfo" && (
            <div>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Company Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="companyName"
                      value={companyInfoData.companyName}
                      onChange={handleCompanyInfoChange}
                      placeholder="Enter company name"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Email Address</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="email"
                        name="email"
                        value={companyInfoData.email}
                        onChange={handleCompanyInfoChange}
                        placeholder="Enter email"
                        isInvalid={
                          !!validationErrors.email && !!companyInfoData.email
                        }
                        className="flex-grow-1"
                      />
                      {getValidationIcon(
                        companyInfoData.email,
                        validationErrors.email,
                      )}
                    </div>
                    {validationErrors.email && companyInfoData.email && (
                      <Form.Text className="text-danger">
                        {validationErrors.email}
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Phone Number</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="text"
                        name="phone"
                        value={companyInfoData.phone}
                        onChange={handleCompanyInfoChange}
                        placeholder="Enter phone number"
                        isInvalid={
                          !!validationErrors.phone && !!companyInfoData.phone
                        }
                        className="flex-grow-1"
                      />
                      {getValidationIcon(
                        companyInfoData.phone,
                        validationErrors.phone,
                      )}
                    </div>
                    {validationErrors.phone && companyInfoData.phone && (
                      <Form.Text className="text-danger">
                        {validationErrors.phone}
                      </Form.Text>
                    )}
                    <Form.Text className="text-muted">
                      Exactly 10 digits, starts with 6-9
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Alternate Number</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="text"
                        name="alternatePhone"
                        value={companyInfoData.alternatePhone}
                        onChange={handleCompanyInfoChange}
                        placeholder="Enter alternate number"
                        isInvalid={
                          !!validationErrors.alternate_phone &&
                          !!companyInfoData.alternatePhone
                        }
                        className="flex-grow-1"
                      />
                      {getValidationIcon(
                        companyInfoData.alternatePhone,
                        validationErrors.alternate_phone,
                      )}
                    </div>
                    {validationErrors.alternate_phone &&
                      companyInfoData.alternatePhone && (
                        <Form.Text className="text-danger">
                          {validationErrors.alternate_phone}
                        </Form.Text>
                      )}
                  </Form.Group>
                </Col>

                <Col md={12} className="mb-3">
                  <Form.Group>
                    <Form.Label>Company Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="address"
                      value={companyInfoData.address}
                      onChange={handleCompanyInfoChange}
                      placeholder="Enter company address"
                    />
                  </Form.Group>
                </Col>

                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={companyInfoData.city}
                      onChange={handleCompanyInfoChange}
                      placeholder="Enter city"
                    />
                  </Form.Group>
                </Col>

                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={companyInfoData.state}
                      onChange={handleCompanyInfoChange}
                      placeholder="Enter state"
                    />
                  </Form.Group>
                </Col>

                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>Pincode</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="text"
                        name="pincode"
                        value={companyInfoData.pincode}
                        onChange={handleCompanyInfoChange}
                        placeholder="Enter pincode"
                        isInvalid={
                          !!validationErrors.pincode &&
                          !!companyInfoData.pincode
                        }
                        className="flex-grow-1"
                      />
                      {getValidationIcon(
                        companyInfoData.pincode,
                        validationErrors.pincode,
                      )}
                    </div>
                    {validationErrors.pincode && companyInfoData.pincode && (
                      <Form.Text className="text-danger">
                        {validationErrors.pincode}
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-3 mt-4">
                <Button
                  onClick={resetCompanyInfo}
                  variant="outline-secondary"
                  style={{
                    borderRadius: "30px",
                    padding: "10px 28px",
                    fontWeight: "600",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaUndo className="me-2" /> Reset
                </Button>
                <Button
                  onClick={handleSaveCompanyInfo}
                  disabled={saving}
                  style={{
                    backgroundColor: "rgb(30, 58, 111)",
                    border: "none",
                    borderRadius: "30px",
                    padding: "10px 28px",
                    fontWeight: "600",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 6px rgba(30, 58, 111, 0.25)",
                  }}
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="me-2" /> Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Bank Details Tab */}
          {activeTab === "bankdetails" && (
            <div>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Bank Name</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="text"
                        name="bankName"
                        value={bankDetailsData.bankName}
                        onChange={handleBankDetailsChange}
                        placeholder="Enter bank name"
                        isInvalid={
                          !!validationErrors.bank_name &&
                          !!bankDetailsData.bankName
                        }
                        className="flex-grow-1"
                      />
                      {getValidationIcon(
                        bankDetailsData.bankName,
                        validationErrors.bank_name,
                      )}
                    </div>
                    {validationErrors.bank_name && bankDetailsData.bankName && (
                      <Form.Text className="text-danger">
                        {validationErrors.bank_name}
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Account Holder Name</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="text"
                        name="accountHolderName"
                        value={bankDetailsData.accountHolderName}
                        onChange={handleBankDetailsChange}
                        placeholder="Enter account holder name"
                        isInvalid={
                          !!validationErrors.account_holder_name &&
                          !!bankDetailsData.accountHolderName
                        }
                        className="flex-grow-1"
                      />
                      {getValidationIcon(
                        bankDetailsData.accountHolderName,
                        validationErrors.account_holder_name,
                      )}
                    </div>
                    {validationErrors.account_holder_name &&
                      bankDetailsData.accountHolderName && (
                        <Form.Text className="text-danger">
                          {validationErrors.account_holder_name}
                        </Form.Text>
                      )}
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Account Number</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="text"
                        name="accountNumber"
                        value={bankDetailsData.accountNumber}
                        onChange={handleBankDetailsChange}
                        placeholder="Enter account number"
                        isInvalid={
                          !!validationErrors.account_number &&
                          !!bankDetailsData.accountNumber
                        }
                        className="flex-grow-1"
                      />
                      {getValidationIcon(
                        bankDetailsData.accountNumber,
                        validationErrors.account_number,
                      )}
                    </div>
                    {validationErrors.account_number &&
                      bankDetailsData.accountNumber && (
                        <Form.Text className="text-danger">
                          {validationErrors.account_number}
                        </Form.Text>
                      )}
                    <Form.Text className="text-muted">
                      Account number must be between 9-18 digits
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>IFSC Code</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="text"
                        name="ifscCode"
                        value={bankDetailsData.ifscCode}
                        onChange={handleBankDetailsChange}
                        placeholder="Enter IFSC code"
                        isInvalid={
                          !!validationErrors.ifsc_code &&
                          !!bankDetailsData.ifscCode
                        }
                        className="flex-grow-1"
                      />
                      {getValidationIcon(
                        bankDetailsData.ifscCode,
                        validationErrors.ifsc_code,
                      )}
                    </div>
                    {validationErrors.ifsc_code && bankDetailsData.ifscCode && (
                      <Form.Text className="text-danger">
                        {validationErrors.ifsc_code}
                      </Form.Text>
                    )}
                    <Form.Text className="text-muted">
                      Format: 4 letters + 0 + 6 characters (e.g., SBIN0001234)
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Branch Name</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="text"
                        name="branchName"
                        value={bankDetailsData.branchName}
                        onChange={handleBankDetailsChange}
                        placeholder="Enter branch name"
                        isInvalid={
                          !!validationErrors.branch_name &&
                          !!bankDetailsData.branchName
                        }
                        className="flex-grow-1"
                      />
                      {getValidationIcon(
                        bankDetailsData.branchName,
                        validationErrors.branch_name,
                      )}
                    </div>
                    {validationErrors.branch_name &&
                      bankDetailsData.branchName && (
                        <Form.Text className="text-danger">
                          {validationErrors.branch_name}
                        </Form.Text>
                      )}
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>UPI ID</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="text"
                        name="upiId"
                        value={bankDetailsData.upiId}
                        onChange={handleBankDetailsChange}
                        placeholder="Enter UPI ID"
                        isInvalid={
                          !!validationErrors.upi_id && !!bankDetailsData.upiId
                        }
                        className="flex-grow-1"
                      />
                      {getValidationIcon(
                        bankDetailsData.upiId,
                        validationErrors.upi_id,
                      )}
                    </div>
                    {validationErrors.upi_id && bankDetailsData.upiId && (
                      <Form.Text className="text-danger">
                        {validationErrors.upi_id}
                      </Form.Text>
                    )}
                    <Form.Text className="text-muted">
                      Format: yourname@bankname (e.g., username@okhdfcbank)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-3 mt-4">
                <Button
                  onClick={resetBankDetails}
                  variant="outline-secondary"
                  style={{
                    borderRadius: "30px",
                    padding: "10px 28px",
                    fontWeight: "600",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaUndo className="me-2" /> Reset
                </Button>
                <Button
                  onClick={handleSaveBankDetails}
                  disabled={saving}
                  style={{
                    backgroundColor: "rgb(30, 58, 111)",
                    border: "none",
                    borderRadius: "30px",
                    padding: "10px 28px",
                    fontWeight: "600",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 6px rgba(30, 58, 111, 0.25)",
                  }}
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="me-2" /> Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Tax Info Tab */}
          {activeTab === "taxinfo" && (
            <div>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>GST Number</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="text"
                        name="gstNumber"
                        value={taxInfoData.gstNumber}
                        onChange={handleTaxInfoChange}
                        placeholder="Enter GST number"
                        isInvalid={
                          !!validationErrors.gst_number &&
                          !!taxInfoData.gstNumber
                        }
                        className="flex-grow-1"
                      />
                      {getValidationIcon(
                        taxInfoData.gstNumber,
                        validationErrors.gst_number,
                      )}
                    </div>
                    {validationErrors.gst_number && taxInfoData.gstNumber && (
                      <Form.Text className="text-danger">
                        {validationErrors.gst_number}
                      </Form.Text>
                    )}
                    <Form.Text className="text-muted">
                      Format: 22ABCDE1234F1Z5 (15 characters)
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>PAN Number</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="text"
                        name="panNumber"
                        value={taxInfoData.panNumber}
                        onChange={handleTaxInfoChange}
                        placeholder="Enter PAN number"
                        isInvalid={
                          !!validationErrors.pan_number &&
                          !!taxInfoData.panNumber
                        }
                        className="flex-grow-1"
                      />
                      {getValidationIcon(
                        taxInfoData.panNumber,
                        validationErrors.pan_number,
                      )}
                    </div>
                    {validationErrors.pan_number && taxInfoData.panNumber && (
                      <Form.Text className="text-danger">
                        {validationErrors.pan_number}
                      </Form.Text>
                    )}
                    <Form.Text className="text-muted">
                      Format: ABCDE1234F (10 characters)
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>TAN Number</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="text"
                        name="tanNumber"
                        value={taxInfoData.tanNumber}
                        onChange={handleTaxInfoChange}
                        placeholder="Enter TAN number"
                        isInvalid={
                          !!validationErrors.tan_number &&
                          !!taxInfoData.tanNumber
                        }
                        className="flex-grow-1"
                      />
                      {getValidationIcon(
                        taxInfoData.tanNumber,
                        validationErrors.tan_number,
                      )}
                    </div>
                    {validationErrors.tan_number && taxInfoData.tanNumber && (
                      <Form.Text className="text-danger">
                        {validationErrors.tan_number}
                      </Form.Text>
                    )}
                    <Form.Text className="text-muted">
                      Format: ABCD12345E (10 characters)
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Business Type</Form.Label>
                    <Form.Select
                      name="businessType"
                      value={taxInfoData.businessType}
                      onChange={handleTaxInfoChange}
                    >
                      <option value="">Select Business Type</option>
                      <option value="Private Limited">Private Limited</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Sole Proprietorship">
                        Sole Proprietorship
                      </option>
                      <option value="LLP">LLP</option>
                      <option value="Public Limited">Public Limited</option>
                      <option value="Trust">Trust</option>
                      <option value="Society">Society</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={12} className="mb-3">
                  <Form.Group>
                    <Form.Label>Tax Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="taxAddress"
                      value={taxInfoData.taxAddress}
                      onChange={handleTaxInfoChange}
                      placeholder="Enter tax address"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-3 mt-4">
                <Button
                  onClick={resetTaxInfo}
                  variant="outline-secondary"
                  style={{
                    borderRadius: "30px",
                    padding: "10px 28px",
                    fontWeight: "600",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaUndo className="me-2" /> Reset
                </Button>
                <Button
                  onClick={handleSaveTaxInfo}
                  disabled={saving}
                  style={{
                    backgroundColor: "rgb(30, 58, 111)",
                    border: "none",
                    borderRadius: "30px",
                    padding: "10px 28px",
                    fontWeight: "600",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 6px rgba(30, 58, 111, 0.25)",
                  }}
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="me-2" /> Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <style>{`
        .nav-tabs {
          border-bottom: none !important;
        }
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          padding: 10px 20px;
          font-size: 14px;
          transition: all 0.2s;
          border-radius: 30px;
          margin-right: 8px;
        }
        .nav-tabs .nav-link:hover {
          color: rgb(30, 58, 111);
          background: #f1f5f9;
        }
        .nav-tabs .nav-link.active {
          color: rgb(30, 58, 111);
          background: #eef2ff;
          border: none;
        }
        .rounded-3 {
          border-radius: 12px !important;
        }
        .form-control:focus, .form-select:focus {
          border-color: rgb(30, 58, 111);
          box-shadow: 0 0 0 0.2rem rgba(30, 58, 111, 0.25);
        }
      `}</style>
    </Container>
  );
};

export default CompanySetting;