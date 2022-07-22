import { useCallback, useMemo } from 'react'
import { useShoppingCart } from '../../../contexts'

export const useUtilities = ({ concept, study, variable }) => {
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
        isConceptInCart, isStudyInCart, isVariableInCart
    ])

    const addToCart = useCallback((cart) => {
        return concept ? (
            addConceptToCart(cart, concept)
        ) : study ? (
            addStudyToCart(cart, study)
        ) : variable ? (
            addVariableToCart(cart, variable)
        ) : {}
    }, [
        concept, study, variable,
        addConceptToCart, addStudyToCart, addVariableToCart
    ])

    const removeFromCart = useCallback((cart) => {
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