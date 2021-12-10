import { Space, Typography } from 'antd'

const { Title } = Typography

export const RobokopTab = () => {
    const robokopUrl = "https://robokop.renci.org"
    
    return (
        <Space direction="vertical">
            <iframe src={robokopUrl}
                    height="500"
                    style={{width: "100%"}}
            />
        </Space>
    )
}