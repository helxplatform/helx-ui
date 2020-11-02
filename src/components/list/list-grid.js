import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

export const Wrapper = styled.ul(({ theme, gap = theme.spacing.large }) => `
  list-style-type: none;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-gap: ${ gap };
`)

const ListGridItem = styled.li(({ theme }) => `
  display: flex;
  justify-content: stretch;
  align-items: stretch;
`)

export const ListGrid = ({ items, ...props }) => {
  return (
    <Wrapper { ...props }>
      { items.map(item => <ListGridItem key={ item.key }>{ item }</ListGridItem>) }
    </Wrapper>
  )
}

ListGrid.propTypes = {
  items: PropTypes.array.isRequired,
  bullets: PropTypes.oneOf(['none', 'disc', 'circle', 'square'])
}

ListGrid.defaultProps = {
  bullets: 'none',
}
