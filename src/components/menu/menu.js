import React from 'react'
import PropTypes from 'prop-types'
import styled, { useTheme } from 'styled-components'
import { Link } from '../link'
import { useAuth } from '../../contexts'
import { Icon } from '../icon'
import { HeLxSearchBar } from '../search/';

const Wrapper = styled.nav`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const MenuItem = styled(Link)(({ theme }) => `
  color: ${ theme.color.black };
  text-decoration: none;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: ${ theme.spacing.medium };
  text-transform: uppercase;
  border-width: 2px 0 2px 0;
  border-style: solid;
  border-color: transparent;
  transition: background-color 250ms, color 250ms, border-color 250ms;
  &:hover, &:focus {
    background-color: ${ theme.color.grey.light };
  }
  &[aria-current] {
    background-color: ${ theme.color.grey.light };
    border-bottom-color: ${ theme.color.grey.dark };
  }
`)

export const Menu = ({ items }) => {
  const theme = useTheme()
  const auth = useAuth()
  return (
    <Wrapper>
      { items.map(item => <MenuItem to={ item.path } key={ item.text }>{ item.text }</MenuItem>) }
      <MenuItem to="/account">
        { auth.user ? <Icon icon="userCircle" fill={ theme.color.grey.main } size={ 24 }/> : 'LOGIN' }
      </MenuItem>
      <HeLxSearchBar />
    </Wrapper>
  )
}

Menu.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
     text: PropTypes.string.isRequired,
     path: PropTypes.string.isRequired,
  })).isRequired,
}
