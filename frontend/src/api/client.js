import axios from 'axios';

/**
 * REST API Client configuration following the principles from:
 * https://www.souysoeng.com/2026/02/stop-designing-rest-apis-wrong.html
 */

// Step 4: API Versioning
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Step 6: Authentication & Authorization
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Step 2, 3, 11: HTTP Status Codes, Consistent JSON, and Error Structure
apiClient.interceptors.response.use(
  (response) => {
    // Professional APIs return consistent data structures
    // Usually { data: ..., meta: ... } or just the data if standardized
    return response;
  },
  (error) => {
    const { response } = error;

    if (response) {
      const { status, data } = response;
      
      // Step 2 & 11: Handle specific status codes and error structures
      switch (status) {
        case 400:
          console.error('Bad Request:', data.message || 'Validation failed');
          break;
        case 401:
          console.error('Unauthorized: Redirecting to login...');
          // localStorage.removeItem('auth_token');
          // window.location.href = '/login';
          break;
        case 403:
          console.error('Forbidden: You do not have permission.');
          break;
        case 404:
          console.error('Not Found:', data.message || 'Resource not found');
          break;
        case 422:
          console.error('Validation Errors:', data.errors);
          break;
        case 500:
          console.error('Internal Server Error:', data.message || 'Something went wrong on the server');
          break;
        default:
          console.error(`Error ${status}:`, data.message || 'An unknown error occurred');
      }
    } else {
      console.error('Network Error: Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
