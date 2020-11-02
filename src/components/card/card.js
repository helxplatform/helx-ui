import React, { Component } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div(({ theme }) => `
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  border-radius: ${ theme.border.radius };
  border: 1px solid ${ theme.color.grey.light };
  overflow: hidden;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.1));
  transition: filter 250ms;
  &:hover {
    filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.2));
  }
`)

const CardHeader = styled.header(({ theme }) => `
  background-color: ${ theme.color.white };
  padding: ${ theme.spacing.medium };
  font-size: 120%;
`)

const CardBody = styled.div(({ theme }) => `
  background-color: #fff;
  padding: ${ theme.spacing.medium };
  flex: 1;
`)

const CardFooter = styled.footer(({ theme }) => `
  padding: ${ theme.spacing.medium };
  background-color: ${ theme.color.grey.dark };
  z-index: 1;
`)

class Card extends Component {
  static Header = CardHeader;
  static Body = CardBody;
  static Footer = CardFooter;

  render() {
    return (
      <Wrapper { ...this.props }>
        { this.props.children }
      </Wrapper>
    )
  }
}

export { Card }
