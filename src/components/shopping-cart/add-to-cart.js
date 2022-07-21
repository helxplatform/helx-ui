import { Button, Dropdown, Menu } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { ShoppingCartOutlined as ShoppingCartIcon } from '@ant-design/icons'
import { useShoppingCart } from '../../contexts'
import { useCallback, useMemo } from 'react'

const useUtilities = ({ cart: _cart, concept, study, variable }) => {
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

    const cart = useMemo(() => _cart ? _cart : activeCart, [_cart, activeCart])

    const isInCart = useMemo(() => (
        concept ? (
            isConceptInCart(cart, concept)
        ) : study ? (
            isStudyInCart(cart, study)
        ) : variable ? (
            isVariableInCart(cart, variable)
        ) : false
    ), [
        cart, concept, study, variable,
        isConceptInCart, isStudyInCart, isVariableInCart
    ])

    const addToCart = useCallback(() => {
        return concept ? (
            addConceptToCart(cart, concept)
        ) : study ? (
            addStudyToCart(cart, study)
        ) : variable ? (
            addVariableToCart(cart, variable)
        ) : {}
    }, [
        cart, concept, study, variable,
        addConceptToCart, addStudyToCart, addVariableToCart
    ])

    const removeFromCart = useCallback(() => {
        return concept ? (
            removeConceptFromCart(cart, concept)
        ) : study ? (
            removeStudyFromCart(cart, study)
        ) : variable ? (
            removeVariableFromCart(cart, variable)
        ) : {}
    }, [
        cart, concept, study, variable,
        removeConceptFromCart, removeStudyFromCart, removeVariableFromCart
    ])

    const onClick = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        if (isInCart) removeFromCart()
        else addToCart()
    }, [isInCart, addToCart, removeFromCart])

    return {
        isInCart,
        addToCart,
        removeFromCart,
        onClick
    }

}

export const AddToCartIcon = ({
    cart=undefined,
    concept=undefined,
    study=undefined,
    variable=undefined,
    style={},
    ...props
}) => {
    const { isInCart, onClick } = useUtilities({ cart, concept, study, variable })

    return (
        <ShoppingCartIcon
            className="icon-btn no-hover"
            onClick={ onClick }
            style={{
                fontSize: 16,
                color: isInCart ? "#1890ff" : undefined,
                ...style
            }}
            {...props}
        />
    )
}
export const AddToCartButton = ({
    cart=undefined,
    concept=undefined,
    study=undefined,
    variable=undefined,
    style={},
    ...props
}) => {
    const { isInCart, onClick } = useUtilities({ cart, concept, study, variable })

    return (
        <Button
            type="text"
            icon={ <ShoppingCartIcon /> }
            onClick={ onClick }
            style={{
                color: isInCart ? "#1890ff" : undefined,
                ...style
            }}
            {...props}
        />
    )
}
export const AddToCartDropdown =  ({
    cart=undefined,
    concept=undefined,
    study=undefined,
    variable=undefined,
    buttonProps: _buttonProps={}
}) => {
    const { carts } = useShoppingCart()
    const { isInCart, onClick } = useUtilities({ cart, concept, study, variable })
    
    const { style: buttonStyle, children: buttonChildren, ...buttonProps } = _buttonProps

    const buttonContent = useMemo(() => (
        buttonChildren ? buttonChildren : (
            isInCart ?
                `Remove ${ concept ? "concept" : study ? "study" : variable ? "variable" : "" } from cart` :
                `Add ${ concept ? "concept" : study ? "study" : variable ? "variable" : "" } to cart`
        )
    ), [concept, study, variable, isInCart, buttonChildren])

    return (
        <Dropdown.Button
            size="small"
            trigger="click"
            type={ isInCart ? "ghost" : "primary" }
            overlay={
                <Menu>
                    {
                        carts.map((cart) => (
                            <Menu.Item key={cart.name}>
                                {cart.name}
                            </Menu.Item>
                        ))
                    }
                </Menu>
            }
            onClick={ onClick }
            icon={ <DownOutlined /> }
            style={{ marginLeft: 8, fontSize: 13, ...buttonStyle }}
            {...buttonProps}
        >
            { buttonContent }
        </Dropdown.Button>
    )
}