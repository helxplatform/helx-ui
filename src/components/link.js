import React from 'react'
import { Link as ReactLink } from '@reach/router'
import styled from 'styled-components'

export const ExternalLink = styled.a.attrs(props => ({
  href: props.to,
  target: '_blank',
  rel: 'noopener noreferrer',
}))``

export const Link = ({ to, children, ...props }) => {
  const mailtoPattern = new RegExp(/^mailto:/)
  const externalUrlPattern = new RegExp(/^https?:\/\//)
  const externalUrlMatch = externalUrlPattern.exec(to)
  const mailtoMatch = mailtoPattern.exec(to)
  const LinkComponent = externalUrlMatch || mailtoMatch ? ExternalLink : ReactLink
  return <LinkComponent to={ to } { ...props }>{ children }</LinkComponent>
}
