import { useEffect } from "react";
import { Spin } from "antd";
import { withView } from "./";
import { useTitle } from "./view";

export const LoadingView = () => {
    useTitle("")
    
    return (
        <Spin style={{ position: 'absolute', left: '50%', bottom: '50%', transform: 'translate(-50%, -50%)' }} />
    )
}