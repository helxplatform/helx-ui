import { createContext, useContext, useState } from 'react'

const ShoppingCartContext = createContext({})

export const useShoppingCart = () => useContext(ShoppingCartContext)

const initialCartContents = {
  concepts: [],
  variables: [],
  studies: [],
}

export const ShoppingCartProvider = ({ children }) => {
  const [cart, setCart] = useState(initialCartContents)
  
  return (
    <ShoppingCartContext.Provider value={{ cart }}>
      { children }
    </ShoppingCartContext.Provider>
  )
}
