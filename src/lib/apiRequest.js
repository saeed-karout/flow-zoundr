import axios from 'axios';
import { api_url } from '@/constants';
import authHeader from '@/services/auth-header';

const apiRequest = axios.create({
  baseURL: api_url,
});

// Header
apiRequest.interceptors.request.use(
  (config) => {
    const csrfToken = localStorage.getItem('csrf-token'); 
    config.headers = {
      ...config.headers,
      ...authHeader(), 
      accept: '*/*', 
      'X-CSRF-TOKEN': csrfToken || '', 'X-Requested-With': 'XMLHttpRequest',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Show Errors
apiRequest.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error); 
    return Promise.reject(error);
  }
);

export default apiRequest;