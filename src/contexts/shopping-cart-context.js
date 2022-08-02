import { ShoppingCartProvider as _ShoppingCartProvider } from 'antd-shopping-cart'

export const ShoppingCartProvider = ({ children }) => {
    return (
        <_ShoppingCartProvider
            defaultCartName="My cart"
            localStorageKey="shopping_carts"
            buckets={[
                {
                    id: "concepts",
                    name: "Concepts",
                    itemName: "concept"
                },
                {
                    id: "studies",
                    name: "Studies",
                    itemName: "study"
                },
                {
                    id: "variables",
                    name: "Variables",
                    itemName: "variable"
                }
            ]}
        >
            { children }
        </_ShoppingCartProvider>
    )
}