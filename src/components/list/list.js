import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

export const Wrapper = styled.ul(({ theme, bullets }) => `
  padding: 0;
  margin: ${ theme.spacing.md };
  list-style-type: ${ bullets };
`)

const ListItem = styled.li(({ theme }) => `
  padding: 0;
  margin: 0;
`)

export const List = ({ items, bullets = 'none' }) => {
  return (
    <Wrapper bullets={ bullets }>
      { items.map(item => <ListItem key={ item.key }>{ item }</ListItem>) }
    </Wrapper>
  )
}

List.propTypes = {
  items: PropTypes.array.isRequired,
  bullets: PropTypes.oneOf(['none', 'disc', 'circle', 'square'])
}

List.defaultProps = {
  bullets: 'none',
}
