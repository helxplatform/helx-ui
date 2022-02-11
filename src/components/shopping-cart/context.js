import { createContext, useContext, useState } from 'react'

const ShoppingCartContext = createContext({})

export const useShoppingCart = () => useContext(ShoppingCartContext)

export const ShoppingCartProvider = ({ children }) => {
	const [cart, setCart] = useState()
	
	return (
		<ShoppingCartContext.Provider value={{ cart }}>
		  { children }
		</ShoppingCartContext.Provider>
	)
}
