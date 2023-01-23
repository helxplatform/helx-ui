import PropTypes from 'prop-types'
import { Breadcrumb } from 'antd'
import { Link } from '@gatsbyjs/reach-router'
import './breadcrumbs.css'

export const Breadcrumbs = ({ crumbs }) => {
  return (
    <Breadcrumb className="breadcrumbs">
      {
        crumbs.map(({ text, path }, i) => {
          if (i + 1 === crumbs.length) {
            return <Breadcrumb.Item key={ path }>{ text }</Breadcrumb.Item>
          }
          return <Breadcrumb.Item key={ path }><Link to={ path }>{ text }</Link></Breadcrumb.Item>
        })
      }
    </Breadcrumb>
  )
}

Breadcrumbs.propTypes = {
  crumbs: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    }).isRequired,
  )
}
