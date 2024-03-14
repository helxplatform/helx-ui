import { useEffect } from "react";
import { Spin } from "antd";
import { withView } from "./";

export const LoadingView = withView(() => {
    return (
        <Spin style={{ position: 'absolute', left: '50%', bottom: '50%', transform: 'translate(-50%, -50%)' }} />
    )
}, { title: "" })