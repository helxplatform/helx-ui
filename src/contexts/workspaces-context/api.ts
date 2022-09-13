import _axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import deepmerge from 'deepmerge'
import {
    APIError, APIRequestError, APIResponseError,
    LoginResponse, SocialSignupResponse, LogoutResponse, UsersResponse,
    User,
    IWorkspacesAPI,
    ProvidersResponse,
    IAPIError,
    Throws400,
    Throws403,
    SAMLRejectedError,
    SAMLActiveError,
    WhitelistRequiredError,
    AvailableAppsResponse,
    AppInstancesResponse,
    EnvironmentContextResponse,
    UpdateAppInstanceResponse,
    SignupRequiredError,
    SocialSignupNotAuthorizedError
} from './api.types'

/** Typescript would not stop complaining about a declarations file for this package. */
const cookies = require('js-cookie')

/**
 * Note: for further reference, API design and some core functionalities are pulled from:
 * - https://github.com/frostyfan109/stem-extraction-ui/blob/master/web/src/api/api.ts 
 * - https://github.com/frostyfan109/stem-extraction-ui/blob/master/web/src/api/api-v1.ts
 */

/**
 * Facilitates authenticated interaction with the Appstore workspaces API.
 * 
 * Important note for using the API when developing:
 * - The API expects the Appstore server to keep track of sessionid and csrftoken cookies.
 *   These cookies are generated upon access of various Appstore views. So if you're working on
 *   the helx-ui dev server and running Appstore elsewhere, you'll need to get Appstore to generate
 *   a csrftoken cookie by visiting an appropriate Appstore view first.
 * Notes:
 * - The API expects you to only access authenticated endpoints when you are authenticated.
 *   It is not going to stop you if you aren't logged in; the request will throw an APIError.
 */
export class WorkspacesAPI implements IWorkspacesAPI {
    public onLoginStateChanged: (user: User | null, sessionTimeout: boolean) => void
    public onApiError: (error: APIError) => void
    // timeoutDelta: time delta in MS until the user is logged out 
    public onSessionTimeoutWarning: (timeoutDelta: number) => void

    private sessionTimeoutWarningSeconds: number

    private _user: User | null | undefined = undefined
    private axios: AxiosInstance
    private _samlWindows: { [id: string]: WindowProxy } = {}

    private lastActivityWarningTimeout: number | undefined = undefined
    private lastActivitySessionTimeout: number | undefined = undefined

    constructor({
        apiUrl,
        sessionTimeoutWarningSeconds=60,
        axiosConfig={},
        onLoginStateChanged=() => {},
        onApiError=(error: APIError) => {},
        onSessionTimeoutWarning=() => {}
    }: {
        apiUrl: string,
        sessionTimeoutWarningSeconds?: number,
        axiosConfig?: AxiosRequestConfig,
        onLoginStateChanged?: (user: User | null) => void,
        onApiError?: (error: APIError) => void,
        onSessionTimeoutWarning?: () => void
    }) {
        this.axios = _axios.create(
            deepmerge(
                axiosConfig,
                {
                    baseURL: apiUrl,
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    withCredentials: true
                }
            )
        )
        this.sessionTimeoutWarningSeconds = sessionTimeoutWarningSeconds
        this.onLoginStateChanged = onLoginStateChanged
        this.onApiError = onApiError
        this.onSessionTimeoutWarning = onSessionTimeoutWarning
        // this.updateLoginState()
    }

    private get apiUrl(): string {
        return this.axios.defaults.baseURL!
    }

    get user(): User | null | undefined {
        return this._user
    }
    
    protected updateLastActivity() {
        this.clearLastActivity()
        if (!this.user) return
        /**
         * Note: these are intervals, not timeout as the variable names may lead you to think.
         * There was a bug with timeouts where if the user sleeps their computer, the timeout
         * block would never run (or it would run with messed up timing).
         */
        const timeoutDelta = this.user.sessionTimeout * 1000 + 1000
        const timeoutTimestamp = new Date(
            Date.now() + timeoutDelta
        ).getTime()
        const timeoutWarningDelta = Math.max(0, this.user.sessionTimeout * 1000 - this.sessionTimeoutWarningSeconds * 1000)
        const timeoutWarningTimestamp = new Date(
            Date.now() + timeoutWarningDelta
        ).getTime()
        // console.log("start warning timeout", timeoutWarningDelta)
        this.lastActivityWarningTimeout = window.setInterval(() => {
            if (timeoutWarningTimestamp - Date.now() <= 0) {
                this.onSessionTimeoutWarning(timeoutTimestamp - timeoutWarningTimestamp)
                clearInterval(this.lastActivityWarningTimeout)
            }
        }, 50)
        // console.log("start full timeout", timeoutDelta)
        this.lastActivitySessionTimeout = window.setInterval(() => {
            if (timeoutTimestamp - Date.now() <= 0) {
                console.log("Timing out session")
                this._updateLoginState(null, true)
                clearInterval(this.lastActivitySessionTimeout)
            }
        }, 50)
    }
    protected clearLastActivity() {
        clearInterval(this.lastActivityWarningTimeout)
        this.lastActivityWarningTimeout = undefined
        clearInterval(this.lastActivitySessionTimeout)
        this.lastActivitySessionTimeout = undefined
    }

    protected handleError(error: APIError) {
        // This should really only be checking for 401 responses, since a 403 could mean the user
        // just doesn't have permission to view the resource, not necessarily that they've been logged out.
        // But Appstore is configured to send 403's for unauthorized requests, so we'll check both for now.
        if (error.status === 401 || error.status === 403) {
            // This is due to an inactive session timeout.
            this._updateLoginState(null, true)
        } else {
            this.onApiError(error)
        }
    }

    // Called once actual login state has been determined.
    async _updateLoginState(user: User | null | undefined, sessionTimeout: boolean=false) {
        this.clearLastActivity()
        const oldUser = this.user
        this._user = user
        if (this.user !== oldUser) this.onLoginStateChanged(this.user as User | null, sessionTimeout)
    }
    /**
     * The user will begin as undefined, i.e. the login state has not been loaded yet.
     * Once it has been loaded, it will always be User or null, where null indicates the user is logged out.
     */
    async updateLoginState(sessionTimeout: boolean=false) {
        let newUser: User | null | undefined
        try {
            const userData = await this.getActiveUser()
            newUser = {
                username: userData.REMOTE_USER,
                sessionTimeout: userData.SESSION_TIMEOUT,
                roles: 0
            }
        } catch (e: any) {
            if (e.status === 403) {
                newUser = null
            } else {
                // If we encounter an unexpected error when loading login state (e.g. the user has no connection)
                // then maintain the current state, unless this was the call to load initial state, in which we assume
                // that the user is logged out.
                // newUser = this.user !== undefined ? this.user : null
                newUser = undefined
            }
        }
        this._updateLoginState(newUser, sessionTimeout)
        // Weird hacky stuff happening here, where updateLastActivity is invoked by APIRequest
        // right after getActiveUser, but before this.user updates, so it doesn't run.
        this.updateLastActivity()
        
    }

    @APIRequest()
    async getLoginProviders(fetchOptions: AxiosRequestConfig={}): Promise<ProvidersResponse> {
        const res = await this.axios.get<ProvidersResponse>("/providers/", fetchOptions)
        return res.data
    }
    
    @APIRequest()
    async getEnvironmentContext(fetchOptions: AxiosRequestConfig={}): Promise<EnvironmentContextResponse> {
        const res = await this.axios.get<EnvironmentContextResponse>("/context/", fetchOptions)
        return res.data
    }

    @APIRequest(Throws403)
    async getActiveUser(fetchOptions: AxiosRequestConfig={}): Promise<UsersResponse> {
        /** Get information about the active (logged in) user */
        const res = await this.axios.get<UsersResponse>("/users/", fetchOptions)
        return res.data
        // try {
        // } catch (e: any) {
        //     /**
        //      * This endpoint throws a 403 if the user is not logged in.
        //      * This is not an error! A 403 for this endpoint is an actual API response,
        //      * so we need to handle it here instead of letting automatic error handling take over.
        //      * 
        //      * Also, yes, the design of this endpoint does not make a lot of sense.
        //      */
        //     if (e.isAxiosError && e.response.status === 403) return null
        //     throw e
        // }
    }

    /** Public endpoints */
    @APIRequest(Throws400)
    async login(
        username: string,
        password: string,
        fetchOptions: AxiosRequestConfig={}
    ): Promise<LoginResponse> {
        /** Log in via basic authentication */
        const csrfToken = cookies.get("csrftoken")!
        const formData = new FormData()
        formData.append("login", username)
        formData.append("password", password)
        formData.append("csrfmiddlewaretoken", csrfToken)
        const res = await this.axios.post("../../accounts/login/", formData, {
            ...fetchOptions,
            headers: {
                ...fetchOptions?.headers,
                Accept: "application/json"
            }
        })
        await this.updateLoginState()
        return null
    }

    @APIRequest()
    async socialSignupAllowed(fetchOptions: AxiosRequestConfig={}): Promise<boolean> {
        const res = await this.axios.get("../../accounts/social/signup/", {
            ...fetchOptions,
            headers: {
                ...fetchOptions?.headers,
                Accept: "application/json"
            }
        })
        if (new URL(res.request.responseURL).pathname === new URL(this.apiUrl + "../../accounts/login/").pathname) {
            return false
        }
        return true
    }

    @APIRequest(Throws400)
    async socialSignup(
        username: string,
        email: string,
        fetchOptions: AxiosRequestConfig={}
    ): Promise<SocialSignupResponse> {
        const csrfToken = cookies.get("csrftoken")!
        const formData = new FormData()
        formData.append("username", username)
        formData.append("email", email)
        formData.append("csrfmiddlewaretoken", csrfToken)
        const res = await this.axios.post("../../accounts/social/signup/", formData, {
            ...fetchOptions,
            headers: {
                ...fetchOptions?.headers,
                Accept: "application/json"
            }
        })
        if (new URL(res.request.responseURL).pathname === new URL(this.apiUrl + "../../accounts/login/").pathname) {
            throw new SocialSignupNotAuthorizedError()
        }
        await this.updateLoginState()
        return null
    }

    @APIRequest()
    private loginSAML(url: string, width: number, height: number): Promise<void> {
        // const left = (window.screen.width / 2) - (width / 2)
        // const top = (window.screen.height / 2) - (height / 2)
        const win = window.top || window
        const left = (win.outerWidth / 2) + win.screenX - (width / 2)
        const top = (win.outerHeight / 2) + win.screenY - (height / 2)
        const existingWindow = this._samlWindows[url]
        if (existingWindow && !existingWindow.closed) {
            existingWindow.focus()
            throw new SAMLActiveError()
        }
        const promise = new Promise<void>((resolve, reject) => {
            let success = false
            const SAMLWindow = window.open(
                url,
                "UNC Single Sign-On",
                `popup=true, width=${ width }, height=${ height }, toolbar=no, location=yes, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, left=${ left }, top=${ top }`
            )
            if (SAMLWindow) {
                this._samlWindows[url] = SAMLWindow
                /**
                 * UNC SSO will redirect back to whatever the SAML redirect is set to via metadata (this is going to be somewhere on this domain).
                 * So if a sign in is successful, we can intercept this redirect and update the API's login state.
                 */
                SAMLWindow.focus()
                // Tracking url via intervals seems to be the accepted way of tracking the location of a popup.
                const locationInterval = setInterval(() => {
                    try {
                        // This indicates that the popup is on the origin, but has redirected from the original url.
                        if (
                            SAMLWindow.location.origin === new URL(this.apiUrl).origin &&
                            SAMLWindow.location.pathname !== new URL(url).pathname
                        ) {
                            // Successfully completed SAML login
                            success = true
                            SAMLWindow.document.body.style.display = "none"
                            SAMLWindow.close()
                            if (SAMLWindow.location.pathname === "/accounts/social/signup/") {
                                reject(new SignupRequiredError())
                            } else {
                                this.updateLoginState().then(() => {
                                    if (this.user) resolve()
                                    else reject(new WhitelistRequiredError())
                                })
                            }
                        }
                        if (success || SAMLWindow.closed) {
                            clearInterval(locationInterval)
                            if (!success) reject(new SAMLRejectedError())
                        }
                    } catch (e: any) {
                        // SecurityErrors are expected to be thrown when trying to access information within the iframe
                        // once that iframe becomes cross-origin.
                        if (e.name !== "SecurityError") throw e
                    }
                }, 0)
            } else {
                // Popup blocked, fallback to redirect.
                // This should not be very common, since popup permission is generally granted from user clicks,
                // but some aggressive policies may block all popups no matter what.
                window.location.href = url
            }
        })
        return promise
    }
    
    @APIRequest()
    loginSAMLUNC() {
        return this.loginSAML(`${this.apiUrl}../../accounts/saml/`, 448, 753)
    }
    
    @APIRequest()
    loginSAMLGoogle() {
        /** I've been informed that we aren't actually using Google SAML, we're using OAuth... but this gets the job done regardless. */
        return this.loginSAML(`${this.apiUrl}../../accounts/google/login/?process=`, 450, 600)
    }

    @APIRequest()
    loginSAMLGithub() {
        return this.loginSAML(`${this.apiUrl}../../accounts/github/login/?process=`, 380, 800)
    }
    
    @APIRequest()
    async logout(
        fetchOptions: AxiosRequestConfig={}
    ): Promise<LogoutResponse> {
        /** Log out */
        await this._updateLoginState(null)
        const res = await this.axios.post<LogoutResponse>("/users/logout/", undefined, fetchOptions)
        return null
        // try {
        // } catch (e: any) {
        //     // This endpoint throws a 403 if you try to logout withot actually being logged in.
        //     if (!e.isAxiosError || e.response.status !== 403) throw e
        // }
    }

    @APIRequest()
    async getAvailableApps(fetchOptions: AxiosRequestConfig={}): Promise<AvailableAppsResponse> {
        const res = await this.axios.get<AvailableAppsResponse>("/apps/", fetchOptions)
        return res.data
    }

    @APIRequest()
    async getAppInstances(fetchOptions: AxiosRequestConfig={}): Promise<AppInstancesResponse> {
        const res = await this.axios.get<AppInstancesResponse>("/instances/", fetchOptions)
        return res.data
    }

    @APIRequest()
    async stopAppInstance(sid: string, fetchOptions: AxiosRequestConfig={}): Promise<void> {
        await this.axios.delete(`/instances/${ sid }`)
    }

    @APIRequest()
    async updateAppInstance(
        sid: string,
        workspace: string,
        cpu: string,
        gpu: string,
        memory: string,
        fetchOptions: AxiosRequestConfig={}
    ): Promise<UpdateAppInstanceResponse> {
        const data: any = {
            cpu,
            gpu    
        }
        if (memory.length > 0) data.memory = memory
        if (workspace.length > 0) data.labels = {
            "app-name": workspace
        }
        const res = await this.axios.patch(`/instances/${ sid }`, data, fetchOptions)
        return res.data
    }

}

/**
 * A decorator used on API endpoints for error handling.
 * An "acceptable" error is an error type that is anticipated from the API endpoint.
 * - For example, a 401 is an "acceptable" error from a login endpoint, because we can anticipate that
 *   this endpoint will sometimes throw a 401 (when the user inputs incorrect credentials).
 * - However, a 500 Internal Server Error is never going to be acceptable. If we encounter a 500 on any
 *   endpoint, there should probably be some further indication to the user that something has gone awry.
 * - Regardless, the error will be thrown. But unacceptable errors will be passed up to the handleError method.
 */
 function APIRequest(...acceptableErrors: IAPIError[]) {
    return (target: IWorkspacesAPI, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
        const method = descriptor.value;
        /** Note, this is type WorkspacesAPI, not IWorkspacesAPI, for handleError access */
        descriptor.value = async function(this: WorkspacesAPI, ...args: any[]) {
            try {
                const res = await method.apply(this, args);
                this.updateLastActivity()
                return res
            } catch (e: any) {
                if (e.isAxiosError) {
                    if (!e.response) {
                        // Request failed to go through (e.g. ECONNREFUSED).
                        const err = new APIRequestError(e.request);
                        this.handleError(err);
                        throw err;
                    } else {
                        const isErrorAcceptable = acceptableErrors.some((err) => (
                            err.status === e.response.status
                        ));
                        const err = new APIResponseError(e.response);
                        if (!isErrorAcceptable) {
                            // console.error("Error not acceptable", e.config.url, e.response.status);
                            // The request went through and got a response.
                            this.handleError(err);
                        }
                        throw err;
                    }
                } else {
                    throw e;
                }
            }
        };
        return descriptor;
    };
}