import { createNanoEvents, Emitter } from 'nanoevents';
import { AppStatusEvent, InitialAppStatusesEvent, WebsocketAPIEvents, WebsocketEvent } from './websocket-events';

const WEBSOCKET_REOPEN_DELAY = 5 * 1000

interface Unsubscribe {
    (): void
}

export interface IWebsocketAPI {
    getWebsocket: () => WebSocket
    close: () => void
    requestInitialAppStatuses: () => void
    clearLogs: () => void
    on<E extends keyof WebsocketAPIEvents>(event: E, callback: WebsocketAPIEvents[E]): Unsubscribe
}

export class WebsocketAPI implements IWebsocketAPI {
    private wsUrl: string

    private websocket: WebSocket
    private eventEmitter: Emitter<WebsocketAPIEvents>

    constructor({
        wsUrl
    }: {
        wsUrl: string
    }) {
        this.wsUrl = wsUrl
        this.eventEmitter = createNanoEvents()
        this.websocket = this.createWebsocket()
    }

    private createWebsocket(): WebSocket {
        /** Notes:
         * - The server only verifies your identity when you handshake the websocket connection,
         *   so even if you logout of the Appstore server or your session expires, the websocket won't
         *   be invalidated.
         * - We basically always want a live websocket connection, so if it ever drops, just reestablish.
         * - Since the server doesn't ever reverify the user's identity, we need to drop the connection
         *   and create a new one if the user's identity has changed.
         */
        console.log('--- Establishing WebSocket connection with service ---')
        const websocket = new WebSocket(this.wsUrl)
        websocket.addEventListener("message", (event) => {
            const data: WebsocketEvent<unknown> = JSON.parse(event.data)
            switch (data.type) {
                case "app_status":
                    this.eventEmitter.emit("appStatus", data as AppStatusEvent)
                    break
                case "initial_app_statuses":
                    this.eventEmitter.emit("initialAppStatuses", data as InitialAppStatusesEvent)
                    break
                case "_confirmReady":
                    break
                default:
                    console.error(`Unrecognized/unhandled event type received: "${ event.type }"`)
            }
        })
        return websocket
    }

    getWebsocket() {
        return this.websocket
    }

    close() {
        this.websocket.close()
    }

    on<E extends keyof WebsocketAPIEvents>(event: E, callback: WebsocketAPIEvents[E]): Unsubscribe {
        return this.eventEmitter.on(event, callback)
    }

    requestInitialAppStatuses() {
        this.websocket.send(JSON.stringify({
            type: "initial_app_statuses"
        }))
    }
    
    clearLogs() {
        this.websocket.send(JSON.stringify({
            type: "clear_logs"
        }))
    }
}