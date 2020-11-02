import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useWindowWidth } from '@react-hook/window-size'
import { useScrollPosition } from '../../hooks'
import { useEnvironment } from '../../contexts'
import HelxLogo from '../../images/helx-logo-blue.svg'
import { Menu, MobileMenu } from '../menu'
import { menuItems } from '../../menu'
import { Paragraph } from '../typography'
import { Link } from '../link'
import { Flexer } from '../flexer'

import './style.css'

//

const MOBILE_THRESHHOLD = 792

//

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`

//

const Brand = styled(Link)(({ theme }) => `
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${ theme.spacing.medium };
  color: ${ theme.color.primary.dark };
  & > img {
    margin: 0;
    transition: min-height 150ms;
  }
  & > div {
    margin-top: 1px;
    text-align: center;
    min-width: 13vw;
  }
`)

Brand.propTypes = {
  compact: PropTypes.oneOf([0, 1]).isRequired,
}

Brand.defaultProps = {
  compact: 0,
}

//

const Header = styled.header(({ theme, compact }) => `
  background-color: ${ theme.color.white };
  color: ${ theme.color.black };
  display: flex;
  flex-direction: row;
  align-items: stretch;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.25));
  position: sticky;
  top: 0;
  z-index: 1;
  & img {
    min-height: ${ compact ? '30px' : '60px' };
  }
`)

//

const Main = styled.main(({ theme }) => `
  flex: 1;
  width: 100%;
  max-width: 1080px;
  margin: auto;
`)

//

const Footer = styled.footer(({ theme }) => `
  padding: 2rem 2rem;
  background-color: ${ theme.color.white };
  color: ${ theme.color.black };
  text-align: center;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.25));
`)

//

export const Layout = ({ children }) => {
  const windowWidth = useWindowWidth()
  const scrollPosition = useScrollPosition()
  const { config } = useEnvironment()
  
  return (
    <Wrapper>
      <Header compact={ scrollPosition > 150 ? 1 : 0 }>
        <Brand to="/">
          <img src={ HelxLogo } alt="Go Home" />
          <div>{ config.branding }</div>
        </Brand>
        <Flexer />
        { windowWidth <= MOBILE_THRESHHOLD  ? <MobileMenu items={ menuItems } /> : <Menu items={ menuItems } /> }
      </Header>
      <Main>
        { children }
      </Main>
      <Footer>
        <Paragraph align="center" width="600px">
          Helx is lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </Paragraph>
        &copy; { new Date().getFullYear() } HeLx
      </Footer>
    </Wrapper>
  )
}

