import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled, { useTheme } from 'styled-components'
import { Link } from '../link'
import { Button } from '../button'
import { useAuth } from '../../contexts'
import { Icon } from '../icon'

const Wrapper = styled.nav`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const MenuItem = styled(Link)(({ theme }) => `
  color: ${theme.color.black};
  text-decoration: none;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: ${theme.spacing.medium};
  text-transform: uppercase;
  border-width: 2px 0 2px 0;
  border-style: solid;
  border-color: transparent;
  transition: background-color 250ms, color 250ms, border-color 250ms;
  &:hover, :focus{
    background-color: ${theme.color.grey.light};
  }
  &.selected{
  background-color: ${theme.color.grey.light};
  border-bottom-color: ${theme.color.grey.dark};
  }
`)

export const Menu = ({ items }) => {
  const theme = useTheme()
  const auth = useAuth()

  // store the last selected menu item
  const [prevMenu, setPrevMenu] = useState();

  const menuHandler = (prop) => {
    // unselect the previous menu item
    if (prevMenu !== undefined) {
      let prevMenuItem = document.getElementById(`menu-${prevMenu}`);
      prevMenuItem.classList.remove('selected');
    }
    // select the new menu item
    let currMenu = document.getElementById(`menu-${prop}`);
    currMenu.classList.add('selected');
    setPrevMenu(prop);
  }

  // set active menu area on each render
  useEffect(() => {
    const currPath = window.location.pathname.split('/')[2];
    menuHandler(currPath);
  }, [])

  return (
    <Wrapper>
      { items.map(item => <MenuItem id={`menu-${item.text}`} to={item.path} key={item.text} onClick={() => menuHandler(item.text)}>{item.text}</MenuItem>)}
      <MenuItem id={'menu-account'} to="/helx/account" onClick={() => menuHandler('account')}>
        {auth.user ? <Icon icon="userCircle" fill={theme.color.grey.main} size={24} /> : 'LOGIN'}
      </MenuItem>
    </Wrapper>
  )
}

Menu.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
  })).isRequired,
}
