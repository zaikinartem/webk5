import axios from 'axios';

/**
 * Настроенный экземпляр Axios для взаимодействия с бэкендом.
 * baseURL '/api' перенаправляется через прокси Vite на Tomcat.
 * withCredentials: true позволяет передавать куки сессии (JSESSIONID).
 */
const api = axios.create({
    baseURL: '/api',
    withCredentials: true
});

export default api;