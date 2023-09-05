import { ShoppingCartProvider as _ShoppingCartProvider } from 'antd-shopping-cart'
import { useEnvironment } from './environment-context'

export const ShoppingCartProvider = ({ children }) => {
    const { helxSearchUrl } = useEnvironment()
    
    return (
        <_ShoppingCartProvider
            defaultCartName="My cart"
            localStorageKey="shopping_carts"
            helxSearchUrl={helxSearchUrl}
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
                },
                {
                    id: "cdes",
                    name: "CDEs",
                    itemName: "cde"
                },
            ]}
        >
            { children }
        </_ShoppingCartProvider>
    )
}