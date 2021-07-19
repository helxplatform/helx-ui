import { EnvironmentProvider } from './contexts'
import { AppWrapper } from './app-wrapper'


export const App = () => {

  return (
    <EnvironmentProvider>
      <AppWrapper />
    </EnvironmentProvider >
  )
}
