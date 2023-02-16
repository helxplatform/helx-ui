import { useEffect } from "react";
import { Spin } from "antd";

export const LoadingView = () => {
    useEffect(() => {
        document.title = `HeLx UI`
    }, [])
    return (
        <Spin style={{ position: 'absolute', left: '50%', bottom: '50%', transform: 'translate(-50%, -50%)' }} />
    )
}