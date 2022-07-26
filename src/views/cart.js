import { Fragment, useEffect } from 'react'
import { Typography } from 'antd'
import { useShoppingCart } from 'antd-shopping-cart'

const { Title } = Typography

export const ShoppingCartView = () => {
  const { cart } = useShoppingCart()

  useEffect(() => {
    document.title = `Shopping Cart · HeLx UI`
  }, [])

  return (
    <Fragment>
      <Title level={ 1 }>Shopping Cart</Title>
      <pre style={{ fontSize: '80%', backgroundColor: '#333', color: '#eee', padding: '1rem' }}>
        { JSON.stringify(cart, null, 2) }
      </pre>
    </Fragment>
  )
}