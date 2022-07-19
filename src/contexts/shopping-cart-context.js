import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/use-local-storage'

const ShoppingCartContext = createContext({})

const cartUtilities = {
  getCount() { return this.concepts.length + this.variables.length + this.studies.length }
}
const cartBlueprint = {
  name: undefined,
  createdTime: undefined,
  modifiedTime: undefined,
  canDelete: true,
  concepts: [],
  variables: [],
  studies: [],
  ...cartUtilities
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

  useEffect(() => {
    setCarts(carts.map((cart) => ({
      ...cart,
      ...cartUtilities
    })))
  }, [])

  const addCart = (name, props) => {
    if (carts.find((cart) => cart.name === name)) throw new Error("Cannot create a new cart with duplicate `name` key.")
    setCarts([
      ...carts,
      createCart(name)
    ])
  }
  const removeCart = (name) => {
    setCarts(carts.filter((cart) => cart.name !== name))
    if (name === activeCart.name) setActiveCart("My cart")
  }
  
  return (
    <ShoppingCartContext.Provider value={{
      carts, addCart, removeCart,
      activeCart, setActiveCart
     }}>
      { children }
    </ShoppingCartContext.Provider>
  )
}

export const useShoppingCart = () => useContext(ShoppingCartContext)