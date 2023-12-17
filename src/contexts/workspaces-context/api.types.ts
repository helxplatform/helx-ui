import { AxiosRequestConfig, AxiosResponse } from 'axios'
import ExtendableError from 'es6-error'

export interface IAPIError {
    status: number | null
}
export class APIError extends ExtendableError implements IAPIError {
    constructor(
        public status: number | null,
        public message: string
    ) {
        super(`${ status } - ${ message }`)
    }
}
export class APIRequestError extends APIError {
    constructor(
        public axiosRequest: XMLHttpRequest
    ) {
        super(
            null,
            "Failed to establish connection with the server"
        )
    }
}
export class APIResponseError extends APIError {
    constructor(
        public axiosResponse: AxiosResponse
    ) {
        super(
            axiosResponse.status,
            axiosResponse.data?.detail || axiosResponse.statusText
        )
    }
}
export const Throws400: IAPIError = {
    status: 400
}
export const Throws403: IAPIError = {
    status: 403
}
export const Throws404: IAPIError = {
    status: 404
}

export class SocialSignupNotAuthorizedError extends ExtendableError {
    constructor() {
        super("User session is not authorized to perform social signup")
    }
}

export class SAMLRejectedError extends ExtendableError {
    constructor() {
        super("SAML authentication was rejected or cancelled")
    }
}
export class SAMLActiveError extends ExtendableError {
    constructor() {
        super("SAML authentication is already active")
    }
}
export class WhitelistRequiredError extends ExtendableError {
    constructor() {
        super("Successfully signed in, but whitelisting is required on the accouunt")
    }
}
export class SignupRequiredError extends ExtendableError{
    constructor() {
        super("Successfully signed in, but sign up is required since an account already exists")
    }
}

export type LoginResponse = null
export type SocialSignupResponse = null
export type LogoutResponse = null

export interface UsersResponse {
    REMOTE_USER: string
    ACCESS_TOKEN: string | null
    SESSION_TIMEOUT: number
}

export interface User {
    username: string
    sessionTimeout: number
    roles: number
}

export interface Provider {
    name: string
    url: string
}
export type ProvidersResponse = Provider[]

export interface ExtraLink {
    title: string
    link: string
}
export type Capability = "app" | "search"
export interface EnvironmentContext {
    brand: string
    title: string
    logo_url: string
    color_scheme: {
        primary: string
        secondary: string
    }
    links: ExtraLink[]
    capabilities: Capability[]
    dockstore_app_specs_dir_url: string
    env: {
        [key: string]: any  
    }
}
export type EnvironmentContextResponse = EnvironmentContext

export interface ResourceQuota {
    cpus: string
    gpus: number
    memory: string
}
// Spec for an app that may be instantiated
export interface AvailableApp {
    name: string
    app_id: string
    description: string
    detail: string
    docs: string
    spec: string
    count: number
    minimum_resources: ResourceQuota
    maximum_resources: ResourceQuota
}
// Spec for a running instance of an app
export interface AppInstance {
    name: string
    docs: string
    aid: string
    sid: string
    fqsid: string
    workspace_name: string
    creation_time: string
    cpus: number
    gpus: number
    memory: string
    is_ready: boolean
    url: string
    status: string
}
export interface AvailableAppsResponse {
    [appName: string]: AvailableApp
}
export type AppInstancesResponse = AppInstance[]
export interface AppInstanceIsReadyResponse {
    is_ready: boolean
}

export interface UpdateAppInstanceResponse {
    status: "success" | "error"
    message: string
    result: {
        patches: any[]
    }
}
export interface LaunchAppResponse {
    username: string
    app_id: string
    sid: string
    name: string
    host: string
    url: string
    protocol: string
    resources: {
        deploy: {
            resources: {
                limits: {
                    cpus: number
                    memory: string
                    gpus: number
                }
                reservations: {
                    cpus: number
                    memory: string
                    gpus: number
                }
            }
        }
    }
}

export interface Unsubscribe {
    (): void
}

export interface WorkspacesAPIEvents {
    apiError: (error: APIError) => void
    apiRequest: (methodName: string, promise: Promise<any>) => void
    userStateChanged: (userState: User | null) => void
}

export interface IWorkspacesAPI {
    /** Fields */
    
    /** Properties */
    
    /** General methods */
    on<E extends keyof WorkspacesAPIEvents>(event: E, callback: WorkspacesAPIEvents[E]): Unsubscribe
    
    /** API methods
     * 
     * Note that with many of these methods, the response type is the raw response.
     * However, this isn't a requirement (see: `getActiveUser`), it just so happens that most raw responses
     * are already in a usable and intuitive form and require no additional formatting/transforming.
     * 
     * Note that any methods involving login state (getActiveUser) are liable to throw a 403 or WhitelistRequiredError
     */
    login(username: string, password: string, fetchOptions?: AxiosRequestConfig): Promise<LoginResponse>
    socialSignupAllowed(fetchOptions?: AxiosRequestConfig): Promise<boolean>
    socialSignup(username: string, email: string, fetchOptions?: AxiosRequestConfig): Promise<SocialSignupResponse>
    /**
     * - Void if successful.
     * - Throws SignupRequiredError if the user needs to sign up due to SSO credentials already being in use by another account.
     * - Throws SAMLRejectedError if unsuccessful.
     * - Throws SAMLActiveError if SAML request is already active.
     */
    loginSAMLUNC(): Promise<void>
    loginSAMLGoogle(): Promise<void>
    logout(fetchOptions?: AxiosRequestConfig): Promise<LogoutResponse>
    /** May throw a WhitelistRequiredError */
    getActiveUser(fetchOptions?: AxiosRequestConfig): Promise<User|null>
    getLoginProviders(fetchOptions?: AxiosRequestConfig): Promise<ProvidersResponse>
    getEnvironmentContext(fetchOptions?: AxiosRequestConfig): Promise<EnvironmentContextResponse>
    getAvailableApps(fetchOptions?: AxiosRequestConfig): Promise<AvailableAppsResponse>
    getAppInstances(fetchOptions?: AxiosRequestConfig): Promise<AppInstancesResponse>
    stopAppInstance(sid: string, fetchOptions?: AxiosRequestConfig): Promise<void>
    updateAppInstance(sid: string, workspace: string, cpu: string, gpu: string, memory: string, fetchOptions?: AxiosRequestConfig): Promise<UpdateAppInstanceResponse>
    launchApp(appId: string, cpus: number, gpus: number, memory: string, fetchOptions?: AxiosRequestConfig): Promise<LaunchAppResponse>
    getAppReady(appUrl: string, fetchOptions?: AxiosRequestConfig): Promise<boolean>
}
