import { useMemo } from 'react'
import { Dropdown, Menu, Typography } from 'antd'
import { DownOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import { useShoppingCart } from '../../../contexts'
import { CartSelectDropdownMenu } from '../shopping-cart-popover'
import { useUtilities } from './'
import './add-to-cart.css'

const { Text } = Typography

export const AddToCartDropdown =  ({
    concept=undefined,
    study=undefined,
    variable=undefined,
    buttonProps: _buttonProps={},
    cartSelectDropdownProps={}
}) => {
    const { carts, activeCart, addCart, setActiveCart } = useShoppingCart()
    const { isInCart, toggleCart } = useUtilities({ concept, study, variable })
    
    const {
        className:  buttonClassName,
        style: buttonStyle,
        children: buttonChildren,
        ...buttonProps
    } = _buttonProps

    const buttonContent = useMemo(() => (
        buttonChildren ? buttonChildren : (
            isInCart(activeCart) ?
                `Remove ${ concept ? "concept" : study ? "study" : variable ? "variable" : "" } from cart` :
                `Add ${ concept ? "concept" : study ? "study" : variable ? "variable" : "" } to cart`
        )
    ), [activeCart, concept, study, variable, buttonChildren, isInCart])

    return (
        <Dropdown.Button
            className={ classNames("add-to-cart-dropdown-button", buttonClassName) }
            size="middle"
            trigger="hover"
            type={ isInCart(activeCart) ? "ghost" : "primary" }
            placement="bottomRight"
            overlay={
                <CartSelectDropdownMenu
                    cartIconRender={ (cart) => isInCart(cart) ? (
                        <MinusOutlined />
                    ) : (
                        <PlusOutlined />
                    )}
                    newCartSearchEntry={{
                        enabled: false,
                        hint: "(Create and add)",
                        onClick: (cartName) => {
                            addCart(cartName)
                            setActiveCart(cartName)
                            toggleCart(cartName)
                        }
                    }}
                    disableFavoriteButton
                    disableNewCartEntry
                    disableActiveCart={ false }
                    onSelect={ (cart) => {
                        toggleCart(cart)
                    }}
                    { ...cartSelectDropdownProps }
                />
            }
            onClick={ (e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleCart(activeCart)
            } }
            icon={ <DownOutlined /> }
            style={{ minWidth: 225, ...buttonStyle }}
            {...buttonProps}
        >
            { buttonContent }
        </Dropdown.Button>
    )
}