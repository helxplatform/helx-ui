import axios from 'axios';

export const logoutHandler = (helxAppstoreUrl) => {
    return axios.post(`${helxAppstoreUrl}/api/v1/users/logout/`)
        .then(r =>
            global.window && (global.window.location.href = `${helxAppstoreUrl}/helx`))
}

export const getUser = async (helxAppstoreUrl) => {
    try {
        const res = await axios.get(`${helxAppstoreUrl}/api/v1/users`);
        /** { REMOTE_USER, ACCESS_TOKEN, SESSION_TIMEOUT } */
        // Return a crude response for now, since this api isn't really extensive nor well-supported.
        return res.data;
    } catch (error) {
        // Request is rejected if invalid credentials are provided, i.e. the user is logged out
        // or their credentials have expired/been invalidated for whatever reason. Thus, there
        // is not a current user.
        return null;
    }
}