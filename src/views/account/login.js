import React, { useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { Container } from '../../components/layout'
import { Title, Paragraph } from '../../components/typography'
import { Input } from '../../components/input';
import { InputGroup } from '../../components/input-group';
import { Button } from '../../components/button'
import { useAuth } from '../../contexts'

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
`

export const Login = () => {
  const auth = useAuth();
  const [username, setUserName] = useState();
  const [pwd, setPwd] = useState();

  return (
    <LoginContainer>
      <LoginInputGroup>
        <LoginInput placeholder="Username" onChange={(event) => { setUserName(event.target.value) }}>
        </LoginInput>
        <LoginInput placeholder="Password" onChange={(event) => { setPwd(event.target.value) }}>
        </LoginInput>
      </LoginInputGroup>
      <LoginButton onClick={() => { auth.login([username, pwd]) }}>LOGIN</LoginButton>
    </LoginContainer>
  )
}
