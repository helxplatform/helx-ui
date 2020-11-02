import styled from 'styled-components'
import { Icon } from '../icon'
import { Button } from './button'

const Wrapper = styled(Button)(({ theme }) => `
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  padding: ${ theme.spacing.small };
`)

export const IconButton = ({ icon, fill, variant, size, ...rest }) => {
  return (
    <Wrapper variant={ variant } { ...rest }>
      <Icon icon={ icon } fill={ fill } size={ size }/>
    </Wrapper>
  )
}

