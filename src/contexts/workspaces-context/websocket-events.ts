export interface WebsocketEvent<T> {
    uid: string
    type: string
    // In ms
    timestamp: number
    data: T
}

enum AppStatus {
    LAUNCHING = "LAUNCHING",
    LAUNCHED = "LAUNCHED",
    FAILED = "FAILED",
    SUSPENDING = "SUSPENDING",
    TERMINATED = "TERMINATED"
}
interface ContainerState {
    type: "WAITING" | "RUNNING" | "TERMINATED"
}
interface ContainerWaitingState extends ContainerState {
    message?: string
    reason?: string
}
interface ContainerRunningState extends ContainerState {
    started_at?: number
}
interface ContainerTerminatedState extends ContainerState {
    exit_code: number
    started_at?: number
    finished_at?: number
    message?: string
    reason?: string
}
interface ContainerStatus {
    container_name: string
    container_state: ContainerWaitingState | ContainerRunningState | ContainerTerminatedState
}

export interface AppStatusEvent extends WebsocketEvent<{
    // `appId` identifies the type of app running, e.g. "filebrowser"
    appId: string
    // `systemId` uniquely identifies the app instance
    systemId: string
    status: AppStatus
    containerStates: ContainerStatus[]
    
}> {
    type: 'app_status'
}

export interface InitialAppStatusesEvent extends WebsocketEvent<AppStatusEvent[]> {
    type: 'initial_app_statuses'
}

export interface WebsocketAPIEvents {
    appStatus: (event: AppStatusEvent) => void
    initialAppStatuses: (event: InitialAppStatusesEvent) => void
}