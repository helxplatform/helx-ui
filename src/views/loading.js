import { Spin } from "antd";

export const LoadingView = () => {
    return (
        <Spin style={{ position: 'absolute', left:0, bottom: 0, right: 0 }} />
    )
}