import { ShoppingCartOutlined as ShoppingCartIcon } from '@ant-design/icons'
import { useShoppingCart } from '../../../contexts'
import { useUtilities } from './'

export const AddToCartIconButton = ({
    concept=undefined,
    study=undefined,
    variable=undefined,
    from=null,
    style={},
    ...props
}) => {
    const { activeCart } = useShoppingCart()
    const { isInCart, toggleCart } = useUtilities({ concept, study, variable, from })

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