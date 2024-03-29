import React from 'react'
import { Link as ReactLink } from '@gatsbyjs/reach-router'

export const ExternalLink = ({ to, children, ...props }) => {
  return (
    <a
      href={ to }
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >{ children }</a>
  )
}

export const Link = ({ to, children, ...props }) => {
  const mailtoPattern = new RegExp(/^mailto:/)
  const externalUrlPattern = new RegExp(/^https?:\/\//)
  const externalUrlMatch = externalUrlPattern.exec(to)
  const mailtoMatch = mailtoPattern.exec(to)
  const LinkComponent = externalUrlMatch || mailtoMatch ? ExternalLink : ReactLink
  return <LinkComponent to={to} {...props}>{children}</LinkComponent>
}