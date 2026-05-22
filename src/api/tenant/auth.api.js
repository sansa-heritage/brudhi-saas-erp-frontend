import apiClient from "../client";

export const login = (data) => apiClient.post('/auth/login', data);
export const logout = () => apiClient.post('/auth/logout');
export const getProfile = () => apiClient.get('/auth/profile');
// export const updateProfile = (data) => apiClient.put('/auth/profile', data);
export const updateProfile = async (profileData, imageFile = null) => {
  console.log("📤 Updating profile with image:", !!imageFile);
  
  const formData = new FormData();
  
  // Add text fields
  if (profileData.name) formData.append('name', profileData.name);
  if (profileData.mobile) formData.append('mobile', profileData.mobile);
  if (profileData.email) formData.append('email', profileData.email);
  
  // Add image if provided
  if (imageFile) {
    formData.append('profile_image', imageFile);
  }
  
  // Log FormData contents
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }
  
  // Send as FormData - let browser set Content-Type
  return apiClient.put('/auth/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
export const changePassword = (data) => apiClient.post('/auth/change-password', data);
export const forgotPassword = (data) => apiClient.post('/auth/forgot-password', data);
export const verifyOTP = (data) => apiClient.post('/auth/verify-otp', data);
export const resetPassword = (data) => apiClient.post('/auth/reset-password', data);