import { Space, Typography } from 'antd'
import { SizeMe } from 'react-sizeme'

const { Title } = Typography

export const RobokopTab = () => {
    const robokopUrl = "https://robokop.renci.org"
    
    return (
        <Space direction="vertical">
            <SizeMe>
                {
                    ({ size }) => (
                        <iframe src={robokopUrl}
                                height="500" width={size.width}
                        />
                    )
                }
            </SizeMe>
        </Space>
    )
}