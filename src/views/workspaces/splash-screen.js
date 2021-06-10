import axios from "axios";
import {Spin} from "antd";

import {useEffect, useState} from 'react';

export const SplashScreenView = (props) => {
    const [ statusCode, setStatusCode ] = useState("404");
    const [ loading, setLoading ] = useState(true);
    const [ count, setCount ] = useState(0);

    const decoded_url = decodeURIComponent(props.app_url);
    const app_icon = decodeURIComponent(props.app_icon);

    const getUrl = async () => {
        await axios.get(decoded_url)
            .then(response => {
                if (response.status == 200) {
                    setLoading(false);
                    setStatusCode("200");
                }
            })
            .catch((e) => {
                setCount(prev => prev + 1);
                console.log(e);
            });
    }

    useEffect(() => {
     try {
       const callGetUrl = async () => {
           await getUrl();
       }
       if ( statusCode != "200" ) {
           callGetUrl();}
     }
     catch (error) {
         console.log(error);}
     }, [count]);

    if (loading) {
        return (
            <div style={{ textAlign:"center", marginTop: "175px" }}>
                <img src={`${app_icon}`} alt="App Icon" width="100"></img>
                <h2>Connecting...</h2>
                <Spin size="large"></Spin>
            </div>
        );
    }
    else{
        window.location = decoded_url;
    }

}