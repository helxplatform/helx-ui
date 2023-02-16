import { Space } from 'antd'

export const RobokopTab = () => {
    const robokopUrl = "https://robokop.renci.org"
    
    return (
        <Space direction="vertical">
            <iframe src={robokopUrl}
                    title="ROBOKOP"
                    height="500"
                    style={{width: "100%"}}
            />
        </Space>
    )
}