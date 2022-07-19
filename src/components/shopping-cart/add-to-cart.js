import { Button } from 'antd'
import { ShoppingCartOutlined as ShoppingCartIcon } from '@ant-design/icons'

export const AddToCart = ({ asIcon=false, style, ...props }) => {
    if (asIcon) return (
        <ShoppingCartIcon className="icon-btn" style={{ fontSize: 16, ...style }} {...props} />
    )
    return (
        <Button
            type="text"
            icon={ <ShoppingCartIcon /> }
            style={{
                ...style
            }}
            {...props}
        />
    )
}