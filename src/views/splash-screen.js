import { useEffect, useState } from "react";
import { Spin, Button } from "antd";
import axios from "axios";
import { callWithRetry } from "../utils";
import { useEnvironment } from '../contexts';

// This view is used when the UI is checking the readiness of an instance

export const SplashScreenView = (props) => {
    const header = document.getElementById('helx-header');
    const sidePanel = document.getElementById('helx-side-panel');
    if(header !== null) header.style.visibility = "hidden";
    if(sidePanel !== null) sidePanel.style.visibility = "hidden";
    const { context } = useEnvironment();
    const [loading, setLoading] = useState(true);
    const [errorPresent, setErrorPresent] = useState(false);

    const decoded_url = decodeURIComponent(props.app_url);
    const app_icon = `${context.dockstore_app_specs_dir_url}/${props.app_name}/icon.png`

    useEffect(() => {
        document.title = `Connecting · HeLx UI`
    }, [])

    useEffect(() => {
        let shouldCancel = false;
        (async () => {
            try {
                await callWithRetry(async () => { 
                    const res = await axios.get(decoded_url) 
                    if (res.status === 200 && shouldCancel === false) {
                        setLoading(false)
                    } else {
                        throw new Error("Could not ensure readiness of app URL")
                    }
                }, {
                    failedCallback: () => {
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
                <img src={`${app_icon}`} alt="App Icon" width="100"></img>
                <h2>Connecting...</h2>
                <Spin size="large"></Spin>
            </div>
        );
    } else if (errorPresent) {
        return (
            <div style={{ textAlign: "center", marginTop: "175px" }}>
                <img src={`${app_icon}`} alt="App Icon" width="100"></img>
                <h2>Error: { props.app_name } did not start</h2>
                <Button type="primary" onClick={ () => { window.location.reload() } }>Retry</Button>
            </div>
        );
    }
    else {
        window.location = decoded_url;
    }

}