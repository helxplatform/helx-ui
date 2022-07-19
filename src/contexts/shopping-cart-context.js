import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useLocalStorage } from '../hooks/use-local-storage'

const ShoppingCartContext = createContext({})

const cartBlueprint = {
  name: undefined,
  createdTime: undefined,
  modifiedTime: undefined,
  concepts: [],
  variables: [],
  studies: [],
}

export const ShoppingCartProvider = ({ children }) => {
  const createCart = (name) => {
    return {
      ...cartBlueprint,
      name,
      createdTime: Date.now(),
      modifiedTime: Date.now()
    }
  }
  const [carts, setCarts] = useLocalStorage("shoppingCarts", {
    "default": createCart("Default")
  })
  // const [activeCart, setActiveCart] = useState("default")

  const addCart = (id, name) => {
    setCarts({
      ...carts,
      [id]: createCart(name)
    })
  }
  const removeCart = (id) => {
    const { [id]: removed, ...newCarts } = carts
    setCarts(newCarts)
  }
  
  return (
    <ShoppingCartContext.Provider value={{
      carts, addCart, removeCart,
      // activeCart, setActiveCart
     }}>
      { children }
    </ShoppingCartContext.Provider>
  )
}

export const useShoppingCart = () => useContext(ShoppingCartContext)