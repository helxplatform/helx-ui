import { useCallback, useMemo } from 'react'
import { message } from 'antd'
import { PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { useShoppingCart } from '../../../contexts'

export const useUtilities = ({ concept, study, variable, from=null }) => {
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

    const isInCart = useCallback((cart) => (
        concept ? (
            isConceptInCart(cart, concept)
        ) : study ? (
            isStudyInCart(cart, study)
        ) : variable ? (
            isVariableInCart(cart, variable)
        ) : false
    ), [
        concept, study, variable,
        isConceptInCart, isStudyInCart, isVariableInCart,
        message
    ])

    const addToCart = useCallback((cart) => {
        const name = concept ? concept.name : study ? study.c_name : variable ? variable.name : ""
        const id = concept ? concept.id : study ? study.c_id : variable ? variable.id : ""
        message.info({
            content: `Added ${name} to ${cart.name}`,
            icon: <PlusOutlined />,
            key: `cart-alert-${cart.name}-${id}`
        })
        return concept ? (
            addConceptToCart(cart, concept, from)
        ) : study ? (
            addStudyToCart(cart, study, from)
        ) : variable ? (
            addVariableToCart(cart, variable, from)
        ) : {}
    }, [
        concept, study, variable, from,
        addConceptToCart, addStudyToCart, addVariableToCart,
        message
    ])

    const removeFromCart = useCallback((cart) => {
        const name = concept ? concept.name : study ? study.c_name : variable ? variable.name : ""
        const id = concept ? concept.id : study ? study.c_id : variable ? variable.id : ""
        message.info({
            content: `Removed ${name} to ${cart.name}`,
            icon: <MinusOutlined />,
            key: `cart-alert-${cart.name}-${id}`
        })
        return concept ? (
            removeConceptFromCart(cart, concept)
        ) : study ? (
            removeStudyFromCart(cart, study)
        ) : variable ? (
            removeVariableFromCart(cart, variable)
        ) : {}
    }, [
        concept, study, variable,
        removeConceptFromCart, removeStudyFromCart, removeVariableFromCart
    ])

    const toggleCart = useCallback((cart) => {
        if (isInCart(cart)) removeFromCart(cart)
        else addToCart(cart)
    }, [isInCart, addToCart, removeFromCart])

    return {
        isInCart,
        addToCart,
        removeFromCart,
        toggleCart
    }

}