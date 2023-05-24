import _axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { createNanoEvents, Emitter } from 'nanoevents' 
import deepmerge from 'deepmerge'
import {
    APIError, APIRequestError, APIResponseError,
    LoginResponse, SocialSignupResponse, LogoutResponse, UsersResponse,
    User,
    IWorkspacesAPI,
    WorkspacesAPIEvents,
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
    SocialSignupNotAuthorizedError,
    LaunchAppResponse,
    Unsubscribe,
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

    private axios: AxiosInstance
    private eventEmitter: Emitter<WorkspacesAPIEvents>
    private _samlWindows: { [id: string]: WindowProxy } = {}

    constructor({
        apiUrl,
        axiosConfig={}
    }: {
        apiUrl: string,
        axiosConfig?: AxiosRequestConfig
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
        this.eventEmitter = createNanoEvents()
    }

    private get apiUrl(): string {
        return this.axios.defaults.baseURL!
    }

    protected handleError(error: APIError) {
        this.eventEmitter.emit("apiError", error)
    }

    // This is responsible for emitting a login state update
    // but also for throwing any login-state errors (WhitelistRequiredError)
    private async emitLoginUpdate(): Promise<User|null> {
        let user: User | null
        try {
            user = await this.getActiveUser()
        } catch (e: any) {
            if (e.status === 403) {
                user = null
            } else {
                // Forward errors such as WhitelistRequiredError
                throw e
            }
        }
        // Emit event here
        this.eventEmitter.emit("userStateChanged", user)
        return user
    }

    protected emitApiRequestExecuted(requestMethodName: string, promise: Promise<any>) {
        this.eventEmitter.emit("apiRequest", requestMethodName, promise)
    }

    on<E extends keyof WorkspacesAPIEvents>(event: E, callback: WorkspacesAPIEvents[E]): Unsubscribe {
        return this.eventEmitter.on(event, callback)
    }

    @APIRequest()
    async getLoginProviders(fetchOptions: AxiosRequestConfig={}): Promise<ProvidersResponse> {
        const res = await this.axios.get<ProvidersResponse>("/providers/", fetchOptions)
        return res.data
    }
    
    @APIRequest()
    async getEnvironmentContext(fetchOptions: AxiosRequestConfig={}): Promise<EnvironmentContextResponse> {
        const res = await this.axios.get<EnvironmentContextResponse>("/context/", fetchOptions)
        const { data } = res;
        if (data.links === null) data.links = []
        return data
    }

    /** Throws Throws403, WhitelistRequiredError */
    @APIRequest(Throws403)
    async getActiveUser(fetchOptions: AxiosRequestConfig={}): Promise<User|null> {
        /** Get information about the active (logged in) user, check if whitelist required */
        const res = await this.axios.get<UsersResponse>("/users/", fetchOptions)
        if (/\/login_whitelist\/?$/.test(res.request.responseURL)) {
            throw new WhitelistRequiredError()
        }
        const { REMOTE_USER, SESSION_TIMEOUT, ACCESS_TOKEN } = res.data
        return {
            username: REMOTE_USER,
            sessionTimeout: SESSION_TIMEOUT,
            roles: 0
        }
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
        await this.emitLoginUpdate()
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
        await this.emitLoginUpdate()
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
                                this.emitLoginUpdate().then(() => {
                                    resolve()
                                }).catch((error) => {
                                    reject(error)
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
    
    // This will throw a 403 if you logout without being logged in.
    @APIRequest(Throws403)
    async logout(
        fetchOptions: AxiosRequestConfig={}
    ): Promise<LogoutResponse> {
        /** Log out */
        try {
            const res = await this.axios.post<LogoutResponse>("/users/logout/", undefined, fetchOptions)
        } finally {
            // Although the UI generally knows when the user is logged in and avoids calling logout accordingly,
            // it's possible for the UI to try to log out the user after the session has already timed out unknowningly.
            // This happens when the tab is suspended (e.g. computer is slept) and the session times out before the process resumes.
            await this.emitLoginUpdate()
        }
        return null
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

    @APIRequest()
    async launchApp(
        appId: string,
        cpus: number,
        gpus: number,
        memory: string,
        fetchOptions: AxiosRequestConfig={}
    ): Promise<LaunchAppResponse> {
        const data = {
            app_id: appId,
            cpus,
            gpus,
            memory
        }
        const res = await this.axios.post(`/instances/`, data, fetchOptions)
        return res.data
    }

    @APIRequest()
    async getAppReady(appUrl: string, fetchOptions: AxiosRequestConfig={}): Promise<boolean> {
        try {
            // appUrl is a full URL, not a relative path.
            const res = await this.axios.get(appUrl, {
                ...fetchOptions,
                baseURL: undefined
            })
            return res.status === 200
        } catch (e: any) {
            return false
        }
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
                const apiPromise = method.apply(this, args)
                this.emitApiRequestExecuted(propertyKey, apiPromise)
                const res = await apiPromise;
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