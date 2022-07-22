import { ShoppingCartOutlined as ShoppingCartIcon } from '@ant-design/icons'
import { useShoppingCart } from '../../../contexts'
import { useUtilities } from './'

export const AddToCartIcon = ({
    concept=undefined,
    study=undefined,
    variable=undefined,
    style={},
    ...props
}) => {
    const { activeCart } = useShoppingCart()
    const { isInCart, toggleCart } = useUtilities({ concept, study, variable })

    return (
        <ShoppingCartIcon
            className="icon-btn no-hover"
            onClick={ (e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleCart(activeCart)
            } }
            style={{
                fontSize: 16,
                color: isInCart(activeCart) ? "#1890ff" : undefined,
                ...style
            }}
            {...props}
        />
    )
}