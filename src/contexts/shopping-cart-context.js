import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { CreateCartModal } from '../components/shopping-cart/create-cart-modal'
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
const createCart = (name, props) => {
  return {
    ...cartBlueprint,
    ...props,
    name,
    createdTime: Date.now(),
    modifiedTime: Date.now()
  }
}

export const ShoppingCartProvider = ({ children }) => {
  const [carts, setCarts] = useLocalStorage("shopping_carts", [ createCart("My cart", { canDelete: false }) ])
  const [showCreateCartModal, setShowCreateCartModal] = useState(false)
  const [activeCartName, setActiveCartName] = useState("My cart")
  const activeCart = useMemo(() => carts.find((cart) => cart.name === activeCartName), [carts, activeCartName])

  const getCart = useCallback((name) => {
    if (typeof name !== "string") ({ name } = name)
    const cart = carts.find((cart) => cart.name === name)
    return cart
  }, [carts])

  const setActiveCart = useCallback((name) => {
    const cart = getCart(name)
    console.log(name, cart)
    setActiveCartName(cart.name)
  }, [carts])

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
    const cart = getCart(name)
    if (!cart) throw new Error(`Attempted update of unknown cart: ${name}`)

    if (typeof props === "function") props = props.call(null, cart)
    setCarts([
      ...carts.filter((_cart) => _cart !== cart),
      {
        ...cart,
        ...props,
        modifiedTime: Date.now()
      }
    ])
  }

  /** The `from` field will be appended to shopping cart elements to track where they originate from in the DUG UI.
   * 
   * Structure is { type: string, value: any } where `value` depends on `type`.
   * - { type: "search", value: "<search_query>" }
   * - { type: "concept", value: <dug_concept> }
   * - { type: "study", value: <dug_study> }
   * 
   * It has been structured in this way in anticipation of future workflows beyond
   * simply "searches yield concepts, concepts yield studies, studies yield variables"
   * 
  */
  const addConceptToCart = (name, concept, from=null) => {
    updateCart(name, (cart) => ({
      concepts: [...cart.concepts, { ...concept, from }]
    }))
  }
  const addStudyToCart = (name, study, from=null) => {
    updateCart(name, (cart) => ({
      studies: [...cart.studies, { ...study, from }]
    }))
  }
  const addVariableToCart = (name, variable, from=null) => {
    updateCart(name, (cart) => ({
      variables: [...cart.variables, { ...variable, from }]
    }))
  }
  const removeConceptFromCart = (name, concept) => {
    updateCart(name, (cart) => ({
      concepts: cart.concepts.filter((_concept) => _concept.id !== concept.id )
    }))
  }
  const removeStudyFromCart = (name, study) => {
    updateCart(name, (cart) => ({
      studies: cart.studies.filter((_study) => _study.c_id !== study.c_id)
    }))
  }
  const removeVariableFromCart = (name, variable) => {
    updateCart(name, (cart) => ({
      variables: cart.variables.filter((_variable) => _variable.id !== variable.id)
    }))
  }
  const emptyCart = (name) => {
    updateCart(name, (cart) => ({
      concepts: [],
      studies: [],
      variables: []
    }))
  }

  const cartUtilities = useMemo(() => ({
    isConceptInCart: (cart, concept) => !!cart.concepts.find((_concept) => _concept.id === concept.id),
    isStudyInCart: (cart, study) => !!cart.studies.find((_study) => _study.c_id === study.c_id),
    isVariableInCart: (cart, variable) => !!cart.variables.find((_variable) => _variable.id === variable.id),
    countCart: (cart) => cart.concepts.length + cart.variables.length + cart.studies.length
  }), [])

  const modals = useMemo(() => ({
    createCart: () => setShowCreateCartModal(true)
  }), [])
  
  return (
    <ShoppingCartContext.Provider value={{
      carts, addCart, removeCart, updateCart, emptyCart,
      addConceptToCart, addStudyToCart, addVariableToCart,
      removeConceptFromCart, removeStudyFromCart, removeVariableFromCart,
      activeCart, setActiveCart,
      modals,
      cartUtilities
     }}>
       <Fragment>
        { children }
        <CreateCartModal
          carts={ carts }
          onConfirm={ (cartName, favorited) => {
            addCart(cartName, {
              favorited
            })
            setActiveCart(cartName)
            setShowCreateCartModal(false)
            
          } }
          visible={ showCreateCartModal }
          onVisibleChange={ setShowCreateCartModal }
        />
      </Fragment>
    </ShoppingCartContext.Provider>
  )
}

export const useShoppingCart = () => useContext(ShoppingCartContext)