import { useEffect, useMemo, useState } from "react";
import { Spin, Button } from "antd";
import axios from "axios";
import { callWithRetry } from "../utils";
import { useEnvironment, useWorkspacesAPI } from '../contexts';
import { withView } from "./view";
import { withWorkspaceAuthentication } from "./workspaces";

// This view is used when the UI is checking the readiness of an instance

interface SplashScreenViewProps {
    app_url: string
    app_name: string
}

export const SplashScreenView = withView(withWorkspaceAuthentication(({ app_url: appUrl, app_name: appName }: SplashScreenViewProps) => {
    // if(header !== null) header.style.visibility = "hidden";
    // if(sidePanel !== null) sidePanel.style.visibility = "hidden";
    const { api, appstoreContext } = useWorkspacesAPI()!
    const [loading, setLoading] = useState<boolean>(true);
    const [errorPresent, setErrorPresent] = useState<boolean>(false);

    const decodedUrl = useMemo<string>(() => decodeURIComponent(appUrl), [appUrl]);
    const appIcon = useMemo<string|undefined>(() => (
        appstoreContext
            ? `${appstoreContext.dockstore_app_specs_dir_url}/${appName}/icon.png`
            : undefined
    ), [appstoreContext, appName])

    useEffect(() => {
        let shouldCancel = false;
        void async function() {
            try {
                await callWithRetry(async () => { 
                    const isReady = await api.getAppReady(decodedUrl);
                    if (shouldCancel) {
                        return // STALE STATE
                    }
                    if (isReady) {
                        setLoading(false)
                    } else {
                        throw new Error("App is not ready")
                    }
                }, {
                    failedCallback: (e: any) => {
                        // If true, we'll stop retrying. If false, keep retrying.
                        return shouldCancel
                    },
                    timeout: 240000, // 4 minutes
                    initialDelay: 6000, // First backoff = 6 seconds
                    depth: 3 // Our backoff delay will stop increasing after 3 retries
                })
            } catch(e) {
                // Timeout was hit
                if (!shouldCancel) {
                    setErrorPresent(true)
                    setLoading(false)
                }
            }
        }()
        return () => {
            shouldCancel = true
        }
    }, [decodedUrl])

    if (loading) {
        return (
            <div style={{ textAlign: "center", marginTop: "175px" }}>
                { appIcon && <img src={`${ appIcon }`} alt="App Icon" width="100"></img> }
                <h2 style={{ marginTop: 16 }}>Connecting...</h2>
                <Spin size="large" style={{ marginTop: 16 }}></Spin>
            </div>
        );
    } else if (errorPresent) {
        return (
            <div style={{ textAlign: "center", marginTop: "175px" }}>
                { appIcon && <img src={`${ appIcon }`} alt="App Icon" width="100"></img> }
                <h2>Error: { appName } did not start</h2>
                <Button type="primary" onClick={ () => { window.location.reload() } }>Retry</Button>
            </div>
        );
    } else if (errorPresent) {
        return (
            <div style={{ textAlign: "center", marginTop: "175px" }}>
                { appIcon && <img src={`${ appIcon }`} alt="App Icon" width="100"></img> }
                <h2>Error: { appName } did not start</h2>
                <Button type="primary" onClick={ () => { window.location.reload() } }>Retry</Button>
            </div>
        );
    }
    else {
        window.location.href = decodedUrl;
    }

}), { title: "Connecting" })