import { Button } from 'antd'
import { ShoppingCartOutlined as ShoppingCartIcon } from '@ant-design/icons'
import { useShoppingCart } from '../../contexts'

export const AddToCart = ({
    cart=undefined,
    concept=undefined,
    study=undefined,
    variable=undefined,
    asIcon=false,
    style={},
    ...props
}) => {
    const {
        carts,
        activeCart,
        addConceptToCart, removeConceptFromCart,
        addVariableToCart, removeVariableFromCart,
        addStudyToCart, removeStudyFromCart,
        cartUtilities: {
            isConceptInCart,
            isStudyInCart,
            isVariableInCart
        }
    } = useShoppingCart()
    
    if (!cart) cart = activeCart

    const isInCart = concept ? (
        isConceptInCart(cart, concept)
    ) : study ? (
        isStudyInCart(cart, study)
    ) : variable ? (
        isVariableInCart(cart, variable)
    ) : false

    const addToCart = () => {
        return concept ? (
            addConceptToCart(cart, concept)
        ) : study ? (
            addStudyToCart(cart, study)
        ) : variable ? (
            addVariableToCart(cart, variable)
        ) : {}
    }

    if (asIcon) return (
        <ShoppingCartIcon
            className="icon-btn"
            onClick={ addToCart }
            style={{
                fontSize: 16,
                color: isInCart ? "#1890ff" : undefined,
                ...style
            }}
            {...props}
        />
    )
    return (
        <Button
            type="text"
            icon={ <ShoppingCartIcon /> }
            onClick={ addToCart }
            style={{
                color: isInCart ? "#1890ff" : undefined,
                ...style
            }}
            {...props}
        />
    )
}