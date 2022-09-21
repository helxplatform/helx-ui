import axios from "axios";
import { Spin } from "antd";
import { callWithRetry } from "../utils";
import { useEffect, useState } from 'react';

// This view is used when the UI is checking the readiness of an instance

export const SplashScreenView = (props) => {
    const header = document.getElementById('helx-header');
    const sidePanel = document.getElementById('helx-side-panel');
    if(header !== null) header.style.visibility = "hidden";
    if(sidePanel !== null) sidePanel.style.visibility = "hidden";
    const [statusCode, setStatusCode] = useState("404");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [count, setCount] = useState(0);

    const decoded_url = decodeURIComponent(props.app_url);
    const app_icon = `https://github.com/helxplatform/helx-apps/raw/master/app-specs/${props.app_name}/icon.png`

    const getUrl = async () => {
        try {
            await callWithRetry(async () => { 
                const res = await axios.get(decoded_url) 
                if (res.status === 200) {
                    setLoading(false)
                    setStatusCode("200")
                } else {
                    throw new Error("Could not ensure readiness of app URL")
                }
            })
        } catch(e) {
            setError(true);
            setLoading(false);
        }
        
            // .then(response => {
            //     if (response.status === 200) {
            //         setLoading(false);
            //         setStatusCode("200");
            //     }
            // })
            // .catch((e) => {
            //     setCount(prev => prev + 1);
            //     console.log(e);
            // });
    }

    useEffect(() => {
        document.title = `Connecting · HeLx UI`
    }, [])

    if (loading) {
        return (
            <div style={{ textAlign: "center", marginTop: "175px" }}>
                <img src={`${app_icon}`} alt="App Icon" width="100"></img>
                <h2>Connecting...</h2>
                <Spin size="large"></Spin>
            </div>
        );
    } else if (error) {
        return (
            <div style={{ textAlign: "center", marginTop: "175px" }}>
                <img src={`${app_icon}`} alt="App Icon" width="100"></img>
                <h2>Error: App did not start</h2>
                <Spin size="large"></Spin>
            </div>
        );
    }
    else {
        window.location = decoded_url;
    }

}