import axios from 'axios';
import { useEnvironment } from '../contexts';
// Setup global csrf token
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';

// Setup global interceptor to redirect and handle 403 unauth issue 
axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (error.response.status === 403) {
        window.location.href = window.location.origin + '/frontend'
    }
    return Promise.reject(error)
})

export const Api = () => {
    const { helxAppstoreUrl } = useEnvironment();

    const loadApp = () => {
        return axios.get(`${helxAppstoreUrl}/api/v1/apps`)
    }

    const loadInstance = () => {
        return axios.get(`${helxAppstoreUrl}/api/v1/instances`)
    }

    const launchApp = (app_id, cpu, gpu, memory) => {
        const params = {
            app_id: app_id,
            cpus: cpu,
            memory: memory,
            gpu: gpu
        };
        return axios.post(`${helxAppstoreUrl}/api/v1/instances/`, params);
    }

    const stopInstance = (app_id) => {
        return axios.delete(`${helxAppstoreUrl}/api/v1/instances/${app_id}`);
    }

}