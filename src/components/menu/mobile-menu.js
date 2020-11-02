import React, { Fragment, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from '../link'
import styled from 'styled-components'
import { Toggler } from './toggler'

const DRAWER_WIDTH = 400

const Drawer = styled.div(({ theme, translation }) => `
  background-color: ${ theme.color.grey.dark };
  position: absolute;
  left: 0;
  top: 0;
  height: 100vh;
  max-width: calc(100% - 3.5rem);
  width: ${ DRAWER_WIDTH }px;
  padding-top: 5rem;
  transition: transform 250ms;
  transform: translateX(${ translation });
  z-index: 9;
`)

const Overlay = styled.div(({ theme, active }) => `
  background-color: ${ theme.color.primary.dark };
  position: absolute;
  width: 100%;
  height: 100vh;
  left: 0;
  top: 0;
  transition: opacity 1000ms;
  opacity: ${ active ? 0.75 : 0.0 };
  transform: translateX(${ active ? '0' : '-100%' });
`)

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
`

const MenuItem = styled(Link)(({ theme }) => `
  color: #eee;
  text-decoration: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
  padding: 1rem 2rem;
  text-transform: uppercase;
  transition: background-color 250ms, color 250ms;
  &:hover, &:focus {
    background-color: ${ theme.color.black  };
  }
  &[aria-current] {
    color: ${ theme.color.primary.main }
  }
`)

export const MobileMenu = ({ items }) => {
  // const [open, setOpen] = useState(false)
  const [open, setOpen] = useState(false)
  
  const handleToggleMenu = () => setOpen(!open)
  const handleCloseMenu = () => setOpen(false)

  useEffect(() => {
    const escapeHatch = event => {
      if (event.keyCode === 27) { // escape key
        handleCloseMenu()
      }
    }
    if (open) {
      document.addEventListener('keydown', escapeHatch)
    }
    return () => document.removeEventListener('keydown', escapeHatch)
  }, [open])
  
  return (
    <Fragment>
      <Toggler active={ open } onClick={ handleToggleMenu } />
      <Overlay active={ open } onClick={ handleCloseMenu } />
      <Drawer translation={ open ? '0' : '-100%' }>
        <Nav>
          { items.map(item => <MenuItem key={ item.text } to={ item.path } onClick={ handleCloseMenu }>{ item.text }</MenuItem>) }
        </Nav>
      </Drawer>
    </Fragment>
  )
}

MobileMenu.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
     text: PropTypes.string.isRequired,
     path: PropTypes.string.isRequired,
   })).isRequired,
}
