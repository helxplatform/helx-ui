import { useEffect, useMemo, useState } from "react";
import { Spin, Button } from "antd";
import axios from "axios";
import { callWithRetry } from "../utils";
import { useEnvironment, useWorkspacesAPI } from '../contexts';
import { withView } from './';
import { useTitle } from "./view";
import { withWorkspaceAuthentication } from "./workspaces";

// This view is used when the UI is checking the readiness of an instance

export const SplashScreenView = withWorkspaceAuthentication((props) => {
    const header = document.getElementById('helx-header');
    const sidePanel = document.getElementById('helx-side-panel');
    if(header !== null) header.style.visibility = "hidden";
    if(sidePanel !== null) sidePanel.style.visibility = "hidden";
    const { context } = useEnvironment();
    const { api, appstoreContext } = useWorkspacesAPI()
    const [loading, setLoading] = useState(true);
    const [errorPresent, setErrorPresent] = useState(false);

    const decoded_url = decodeURIComponent(props.app_url);
    const app_icon = useMemo(() => (
        appstoreContext
            ? `${appstoreContext.dockstore_app_specs_dir_url}/${props.app_name}/icon.png`
            : undefined
    ), [appstoreContext, props.app_name])
    
    useTitle("Connecting")

    useEffect(() => {
        let shouldCancel = false;
        (async () => {
            try {
                await callWithRetry(async () => { 
                    const isReady = await api.getAppReady(decoded_url);
                    if (isReady && shouldCancel === false) {
                        setLoading(false)
                    } else {
                        throw new Error("app not ready")
                    }
                }, {
                    failedCallback: (e) => {
                        return shouldCancel
                    },
                    timeout: 240000,
                    initialDelay: 6000,
                    depth: 3
                })
            } catch(e) {
                if (!shouldCancel) {
                    setErrorPresent(true)
                    setLoading(false)
                }
            }
        })()
        return () => {
            shouldCancel = true
        }
    }, [decoded_url])

    if (loading) {
        return (
            <div style={{ textAlign: "center", marginTop: "175px" }}>
                { app_icon && <img src={`${app_icon}`} alt="App Icon" width="100"></img> }
                <h2 style={{ marginTop: 16 }}>Connecting...</h2>
                <Spin size="large" style={{ marginTop: 16 }}></Spin>
            </div>
        );
    } else if (errorPresent) {
        return (
            <div style={{ textAlign: "center", marginTop: "175px" }}>
                { app_icon && <img src={`${app_icon}`} alt="App Icon" width="100"></img> }
                <h2>Error: { props.app_name } did not start</h2>
                <Button type="primary" onClick={ () => { window.location.reload() } }>Retry</Button>
            </div>
        );
    } else if (errorPresent) {
        return (
            <div style={{ textAlign: "center", marginTop: "175px" }}>
                { app_icon && <img src={`${app_icon}`} alt="App Icon" width="100"></img> }
                <h2>Error: { props.app_name } did not start</h2>
                <Button type="primary" onClick={ () => { window.location.reload() } }>Retry</Button>
            </div>
        );
    }
    else {
        window.location = decoded_url;
    }

})
