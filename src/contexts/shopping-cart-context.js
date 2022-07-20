import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/use-local-storage'

const ShoppingCartContext = createContext({})

const cartBlueprint = {
  name: undefined,
  createdTime: undefined,
  modifiedTime: undefined,
  canDelete: true,
  favorited: false,
  concepts: [],
  variables: [],
  studies: []
}

export const ShoppingCartProvider = ({ children }) => {
  const createCart = (name, props) => {
    return {
      ...cartBlueprint,
      ...props,
      name,
      createdTime: Date.now(),
      modifiedTime: Date.now()
    }
  }
  const [carts, setCarts] = useLocalStorage("shopping_carts", [ createCart("My cart", { canDelete: false }) ])
  const [activeCartName, setActiveCart] = useState("My cart")
  const activeCart = useMemo(() => carts.find((cart) => cart.name === activeCartName), [carts, activeCartName])

  const addCart = (name, props) => {
    if (carts.find((cart) => cart.name === name)) throw new Error("Cannot create a new cart with duplicate `name` key.")
    setCarts([
      ...carts,
      createCart(name, props)
    ])
  }
  const removeCart = (name) => {
    setCarts(carts.filter((cart) => cart.name !== name))
    if (name === activeCart.name) setActiveCart("My cart")
  }
  const updateCart = (name, props) => {
    if (typeof name !== "string") ({ name } = name)
    const cart = carts.find((cart) => cart.name === name)
    if (!cart) throw new Error(`Attempted update of unknown cart: ${name}`)
    setCarts([
      ...carts.filter((_cart) => _cart !== cart),
      {
        ...cart,
        ...props,
        modifiedTime: Date.now()
      }
    ])
  }
  const addConceptToCart = (cart, concept) => {
    updateCart(cart, {
      concepts: [...cart.concepts, concept]
    })
  }
  const addStudyToCart = (cart, study) => {
    updateCart(cart, {
      studies: [...cart.studies, study]
    })
  }
  const addVariableToCart = (cart, variable) => {
    updateCart(cart, {
      variables: [...cart.variables, variable]
    })
  }
  const removeConceptFromCart = (cart, concept) => {
    updateCart(cart, {
      concepts: cart.concepts.filter((_concept) => _concept !== concept )
    })
  }
  const removeStudyFromCart = (cart, study) => {
    updateCart(cart, {
      studies: cart.studies.filter((_study) => _study !== study)
    })
  }
  const removeVariableFromCart = (cart, variable) => {
    updateCart(cart, {
      variables: cart.variables.filter((_variable) => _variable !== variable)
    })
  }

  const cartUtilities = {
    isConceptInCart: (cart, concept) => cart.concepts.find((_concept) => _concept === concept),
    isStudyInCart: (cart, study) => cart.studies.find((_study) => _study === study),
    isVariableInCart: (cart, variable) => cart.variables.find((_variable) => _variable === variable),
    countCart: (cart) => cart.concepts.length + cart.variables.length + cart.studies.length
  }
  
  return (
    <ShoppingCartContext.Provider value={{
      carts, addCart, removeCart, updateCart,
      addConceptToCart, addStudyToCart, addVariableToCart,
      removeConceptFromCart, removeStudyFromCart, removeVariableFromCart,
      activeCart, setActiveCart,
      cartUtilities
     }}>
      { children }
    </ShoppingCartContext.Provider>
  )
}

export const useShoppingCart = () => useContext(ShoppingCartContext)