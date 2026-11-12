import axios from 'axios';
import { api_url } from '@/constants';
import authHeader from '@/services/auth-header';

// 🔥 زيادة الـ timeout إلى 60 ثانية للملفات الكبيرة
const apiRequest = axios.create({
  baseURL: api_url,
  timeout: 120000, // 120 ثانية
  maxContentLength: 50 * 1024 * 1024, // 50 MB
  maxBodyLength: 50 * 1024 * 1024, // 50 MB
});

// Header
apiRequest.interceptors.request.use(
  (config) => {
    const csrfToken = localStorage.getItem('csrf-token');
    
    // ✅ ✅ ✅ إذا كان المسار يبدأ بـ /storage/، استخدمه كما هو (الـ proxy سيتعامل معه)
    // لا نضيف storage_url لأن Vite proxy يتعامل مع /storage
    let finalUrl = config.url;
    let finalBaseURL = config.baseURL;
    
    // ✅ إذا كان المسار يبدأ بـ /storage/، نتركه كما هو (الـ proxy سيتعامل معه)
    if (config.url && config.url.startsWith('/storage/')) {
      // ✅ لا نغير المسار، الـ proxy سيتعامل معه
      console.log('📤 Storage Request (via proxy):', config.url);
      // ✅ نضبط baseURL إلى '' لتجنب إضافة api_url
      finalBaseURL = '';
    }
    
    const headers = {
      ...config.headers,
      ...authHeader(),
      'accept': '*/*',
      'X-CSRF-TOKEN': csrfToken || '',
      'X-Requested-With': 'XMLHttpRequest',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };
    
    // 🔥 إذا كانت البيانات FormData، لا نضيف Content-Type
    if (config.data instanceof FormData) {
      delete headers['Content-Type'];
      console.log('📤 FormData detected, removing Content-Type header');
    }
    
    config.headers = headers;
    
    // ✅ تحديث config إذا تغير شيء
    if (finalBaseURL !== config.baseURL) {
      config.baseURL = finalBaseURL;
    }
    
    console.log('📤 API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data instanceof FormData ? 'FormData' : config.data,
      params: config.params,
      timeout: config.timeout,
      baseURL: config.baseURL
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Show Errors
apiRequest.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      url: response.config?.url
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('❌ API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        config: error.config,
        url: error.config?.url
      });
    } else if (error.request) {
      console.error('❌ API No Response:', {
        request: error.request,
        config: error.config,
        message: error.message,
        url: error.config?.url
      });
    } else {
      console.error('❌ API Config Error:', {
        message: error.message,
        config: error.config
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiRequest;