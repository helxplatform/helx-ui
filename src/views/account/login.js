import React, { useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { Container } from '../../components/layout'
import { Title, Paragraph } from '../../components/typography'
import { Input } from '../../components/input';
import { Icon } from '../../components/icon';
import { InputGroup } from '../../components/input-group';
import { Button } from '../../components/button'
import { useAuth } from '../../contexts'
import { NotFound } from '../not-found';

const LoginInput = styled(Input)` 
    margin: 10px 10px;
    width: 20%;
`

const LoginInputGroup = styled(InputGroup)`
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin: 10px auto 20px auto;
`

const LoginContainer = styled(Container)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
`

const LoginButton = styled(Button)`
    width: 20%;
    margin: 10px 10px;
`

export const Login = () => {
  const { providers, login } = useAuth();
  const [username, setUserName] = useState();
  const [pwd, setPwd] = useState();

  if (providers.length == 0) return <NotFound />

  return (
    <LoginContainer>
      <LoginInputGroup>
        {providers.map(provider => <LoginButton onClick={() => login(provider.url)}><Icon icon={provider.name.toLowerCase()}></Icon>{provider.name}</LoginButton>)}
      </LoginInputGroup>
    </LoginContainer>
  )
}
