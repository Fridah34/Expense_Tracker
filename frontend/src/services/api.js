import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials : true,
});


//Handle expired tokens globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ Don't retry on 429 - you're rate limited, retrying makes it worse
    if (error.response?.status === 429) {
      return Promise.reject(error);
    }

    // Handle 401 token refresh (only retry once)
    if (error.response?.status === 401 && !originalRequest._retry &&
        !originalRequest._skipRefresh &&   
        !originalRequest.url.includes('/auth/refresh') &&
        !originalRequest.url.includes('/auth/login') && 
        !originalRequest.url.includes('/auth/register') 
    ) {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(originalRequest);
      } catch (refreshError) {
        const authPages = ['/login', '/register'];
        const onAuthPage = authPages.some(p => window.location.pathname.includes(p));
        if (!onAuthPage) {
        window.location.href = '/login';  }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

//  Auth
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getProfile: (config = {}) => api.get('/auth/profile', config),
};

// Users
export const userAPI = {
    getMe : () => api.get('/users/me'),
    updateProfile : (data) => api.put('/users/me', data),
    changePassword : (data) => api.put('/users/me/password', data),
    deleteAccount : (data) => api.delete('/users/me', {data}),
}

//Categories
export const categoryAPI = {
    getAll : (params) => api.get('/categories', {params}),
    getOne : (id)=> api.get(`/categories/${id}`),
    create : (data)=> api.post('/categories', data),
    update : (id,data)=> api.put(`/categories/${id}`, data),
    delete : (id)=> api.delete(`/categories/${id}`),
};

//Expenses
export const expenseAPI = {
    getAll: (params) => api.get('/expenses', {params}),
    getOne: (id) => api.get(`/expenses/${id}`),
    getSummary: (params) => api.get('/expenses/summary', { params }),
    create: (data) => api.post('/expenses', data),
    update: (id , data) => api.put(`/expenses/${id}`, data),
    delete: (id) => api.delete(`/expenses/${id}`),
};

export default api;