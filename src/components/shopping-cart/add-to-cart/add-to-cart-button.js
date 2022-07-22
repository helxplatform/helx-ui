import { Button } from 'antd'
import { ShoppingCartOutlined as ShoppingCartIcon } from '@ant-design/icons'
import { useShoppingCart } from '../../../contexts'
import { useUtilities } from './'
import './add-to-cart.css'

export const AddToCartButton = ({
    concept=undefined,
    study=undefined,
    variable=undefined,
    style={},
    ...props
}) => {
    const { activeCart } = useShoppingCart()
    const { isInCart, toggleCart } = useUtilities({ concept, study, variable })

    return (
        <Button
            type="text"
            icon={ <ShoppingCartIcon /> }
            onClick={ (e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleCart(activeCart)
            } }
            style={{
                color: isInCart(activeCart) ? "#1890ff" : undefined,
                ...style
            }}
            {...props}
        />
    )
}