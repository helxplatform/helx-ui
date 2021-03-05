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
    width: 20%
`

const LoginInputGroup = styled(InputGroup)`
    flex-direction: column;
    align-items: center;
    justify-content: center;
`

const LoginContainer = styled(Container)` 
    height: max-content;
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
        <Button onClick={() => { auth.login([username, pwd]) }}>LOGIN</Button>

      </LoginInputGroup>
    </LoginContainer>
  )
}
