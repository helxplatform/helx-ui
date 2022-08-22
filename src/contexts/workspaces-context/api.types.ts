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

export type LoginResponse = null
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

export interface IWorkspacesAPI {
    /** Fields */
    // Session timeout will be true when the logout is the result of a session timeout due to inactivity
    onLoginStateChanged: (user: User | null, sessionTimeout: boolean) => void
    onApiError: (error: APIError) => void
    onSessionTimeoutWarning: (timeoutDelta: number) => void
    
    /** Properties */
    // A user can be User (logged in), null (logged out), or undefined (unsure, loading)
    readonly user: User | null | undefined
    
    /** Methods */

    /** API methods */
    login(username: string, password: string, fetchOptions?: AxiosRequestConfig): Promise<LoginResponse>
    logout(fetchOptions?: AxiosRequestConfig): Promise<LogoutResponse>
    getActiveUser(fetchOptions?: AxiosRequestConfig): Promise<UsersResponse>
    getLoginProviders(fetchOptions?: AxiosRequestConfig): Promise<ProvidersResponse>
}