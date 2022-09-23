import axios from "axios";
import { Spin, Button } from "antd";
import { callWithRetry } from "../utils";
import { useEffect, useState } from 'react';

// This view is used when the UI is checking the readiness of an instance

export const SplashScreenView = (props) => {
    const header = document.getElementById('helx-header');
    const sidePanel = document.getElementById('helx-side-panel');
    if(header !== null) header.style.visibility = "hidden";
    if(sidePanel !== null) sidePanel.style.visibility = "hidden";
    const [loading, setLoading] = useState(true);
    const [errorPresent, setErrorPresent] = useState(false);

    const decoded_url = decodeURIComponent(props.app_url);
    const app_icon = `https://github.com/helxplatform/helx-apps/raw/master/app-specs/${props.app_name}/icon.png`

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
                    timeout: 2000,
                    initialDelay: 6000
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