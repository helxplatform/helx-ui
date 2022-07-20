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
    const cart = carts.find((cart) => cart.name === name)
    setCarts([
      ...carts.filter((_cart) => _cart !== cart),
      {
        ...cart,
        ...props,
        modifiedTime: Date.now()
      }
    ])
  }

  const cartUtilities = {
    countCart: (cart) => cart.concepts.length + cart.variables.length + cart.studies.length
  }
  
  return (
    <ShoppingCartContext.Provider value={{
      carts, addCart, removeCart, updateCart,
      activeCart, setActiveCart,
      cartUtilities
     }}>
      { children }
    </ShoppingCartContext.Provider>
  )
}

export const useShoppingCart = () => useContext(ShoppingCartContext)