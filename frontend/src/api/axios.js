import axios from 'axios';
import { auth } from '../config/firebase';

const cache = new Map();
const CACHE_TTL = 30000;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get') {
      const key = response.config.url + JSON.stringify(response.config.params || {});
      cache.set(key, { data: response.data, timestamp: Date.now() });
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

const originalGet = api.get;
api.get = async (url, config) => {
  const key = url + JSON.stringify(config?.params || {});
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { data: cached.data, status: 200, statusText: 'OK', headers: {}, config: {} };
  }
  const response = await originalGet(url, config);
  return response;
};

export default api;
