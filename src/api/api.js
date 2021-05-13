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
        window.location.href = window.location.origin + '/helx/login'
    }
    return Promise.reject(error)
})

export const logoutHandler = (helxAppstoreUrl) => {
    return axios.post(`${helxAppstoreUrl}/api/v1/users/logout/`)
        .then(r =>
            global.window && (global.window.location.href = `${helxAppstoreUrl}/helx`))
}

export const userHandler = (helxAppstoreUrl) => {
    return axios.get(`${helxAppstoreUrl}/api/v1/users/`)
}

export const contextHandler = (helxAppstoreUrl) => {
    return axios.get(`${helxAppstoreUrl}/api/v1/context/`)
}