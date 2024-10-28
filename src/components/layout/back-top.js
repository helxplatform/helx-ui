import { Grid, BackTop as AntBackTop } from 'antd'
import { ArrowUpOutlined } from '@ant-design/icons'

const { useBreakpoint } = Grid

export const BackTop = ({ style={}, ...props }) => {
  const { md } = useBreakpoint()
  return (
    <AntBackTop
      style={{
        bottom: md ? "32px" : "16px",
        right: md ? "32px" : "16px",
        ...style
      }}
      {...props}
    >
      <div className="ant-back-top-content" style={{
        color: "#fff",
        backgroundColor: "#1088e9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <ArrowUpOutlined className="ant-back-top-icon" style={{ fontSize: "20px" }} />
      </div>
    </AntBackTop>
  )
}