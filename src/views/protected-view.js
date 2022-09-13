import { NotAuthorizedView } from './'
import { useDest } from '../contexts'

// This is a wrapper for views that require some sort of authentication to access.  
// You can either redirect the user (e.g. to a login view, an access request form, etc.)
// or you can display an appropriate error page.
export const ProtectedView = ({
  children,
  authorized=undefined,
  // "redirect" | "error"
  behavior="redirect",
  
  /** Redirect props */
  redirect="/",

  /** Error page props  */
  // If true, it will display an error page rather than redirecting the user.
  renderError=() => <NotAuthorizedView />
}) => {
  const { redirectWithDest } = useDest()
  // Authorization state is not loaded yet.
  // If this component is being rendered, there should be some sort of view in front of it that indicates loading.
  if (authorized === undefined  || authorized === null) return null
  // The user is authorized to access this view. 
  else if (authorized) return children
  // The user is not authorized to access this view. Redirect them.
  else if (behavior === "error") return (
    <NotAuthorizedView />
  )
  else if (behavior === "redirect") {
    redirectWithDest(redirect)
    return null
  }
  else {
    console.error("Unrecognized ProtectedView behavior:", behavior)
    return null
  }
}

/** HOC */
export const withAuthentication = (View, props) => {
  return (viewProps) => (
    <ProtectedView { ...props }>
      <View { ...viewProps } />
    </ProtectedView>
  )
}