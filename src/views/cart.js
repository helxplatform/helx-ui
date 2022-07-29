import { Fragment, useEffect } from 'react'
import { useEnvironment } from '../contexts'
import { Breadcrumbs } from '../components/layout'
import { ShoppingCart } from '../components/shopping-cart'

export const ShoppingCartView = () => {
  const { context } = useEnvironment()

  const breadcrumbs = [
    { text: 'Home', path: '/helx' },
    // { text: 'Search', path: '/helx/search' },
    { text: 'Cart', path: '/cart' },
  ]

  useEffect(() => {
    document.title = `Shopping Cart · HeLx UI`
  }, [])

  return (
    <Fragment>
      { context.workspaces_enabled === 'true' && <Breadcrumbs crumbs={breadcrumbs} /> }
      <ShoppingCart />
    </Fragment>
  )
}