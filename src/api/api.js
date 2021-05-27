import axios from 'axios';

export const logoutHandler = (helxAppstoreUrl) => {
    return axios.post(`${helxAppstoreUrl}/api/v1/users/logout/`)
        .then(r =>
            global.window && (global.window.location.href = `${helxAppstoreUrl}/helx`))
}