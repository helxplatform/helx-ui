import { Fragment, useEffect } from 'react'
import { Typography } from 'antd'
import { useEnvironment } from '../contexts'
import { useTitle } from './'

const { Title } = Typography

// Support page sections can be hidden using hidden_sections in the configuration. <community, support>

const CommunitySupport = ({ description, links }) =>
  <Fragment>
    <Title level={1}>Need Help?</Title>
    <Typography>{ description }</Typography>
    {
      Array.isArray(links) && (
        <ul>
          {
            links.map(({ label, url }, i) => (
              <li key={ `community-${ i }` }>
                <a href={ url || '#' } target="_blank" rel="noopener noreferrer">
                  <b>{ label || 'Link' }</b>
                </a>
              </li>
            ))
          }
        </ul>
      )
    }
  </Fragment>

const Documentation = ({ description, links }) =>
  <Fragment>
    <Title level={1}>Documentation</Title>
    <Typography>{ description }</Typography>
    {
      Array.isArray(links) && (
        <ul>
          {
            links.map(({ label, url }, i) => (
              <li key={ `documentation-${ i }` }>
                <a href={ url } target="_blank" rel="noopener noreferrer">
                  <b>{ label }</b>
                </a>
              </li>
            ))
          }
        </ul>
      )
    }
  </Fragment>

export const SupportView = () => {
  const { context } = useEnvironment()
  useTitle("Support")

  const { support_sections: { community, documentation } } = context

  console.log(community)
  console.log(documentation)

  return (
    <Fragment>
      {
        Array.isArray(context.hidden_support_sections)
        && !context.hidden_support_sections.includes('community')
        && community.description
        && <CommunitySupport { ...community } />
      }
      {
        Array.isArray(context.hidden_support_sections)
        && !context.hidden_support_sections.includes('documentation')
        && documentation.description
        && <Documentation { ...documentation } />
      }
    </Fragment>
  )
}