import { createContext, useContext } from 'react'

const ShoppingCartContext = createContext({})

export const useShoppingCart = () => useContext(ShoppingCartContext)

export const ShoppingCartProvider = ({ children }) => {
	return (
		<ShoppingCartContext.Provider>
		  { children }
		</ShoppingCartContext.Provider>
	)
}
