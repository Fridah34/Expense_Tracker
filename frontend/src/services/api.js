import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

//Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if(token) {
        config.headers.Authorization = `BEarer ${token}`;
    }
    return config;
});

//Handle expired tokens globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status ===401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href= '/login';
        }
         return Promise.reject(error);
    }
);

//  Auth
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
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
    getAll : () => api.get('/categories'),
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