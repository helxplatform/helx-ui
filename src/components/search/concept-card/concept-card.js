import { useState, forwardRef } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Card } from 'antd'
import { ShoppingCartOutlined as ShoppingCartIcon, ExpandOutlined as ViewIcon } from '@ant-design/icons'
import { useHelxSearch } from '../'
import { OverviewTab } from './overview-tab'
import { StudiesTab } from './studies-tab'
import { KnowledgeGraphsTab } from './knowledge-graphs-tab'
import { AddToCartIconButton } from '../../shopping-cart'
import { useAnalytics, useShoppingCart } from '../../../contexts'
import './concept-card.css'

export const ConceptCard = forwardRef(({ index, result, openModalHandler, icon=ViewIcon, className="" }, ref) => {
  const { analyticsEvents } = useAnalytics()
  const { query } = useHelxSearch()
  const { activeCart, cartUtilities: { isConceptInCart } } = useShoppingCart()
  const [currentTab, setCurrentTab] = useState('overview')

  const tabs = {
    'overview': { title: 'Overview',         content: <OverviewTab result={ result } /> },
    'studies':  { title: `Studies`,          content: <StudiesTab result={ result } /> },
    'kgs':      { title: `Knowledge Graphs`, content: <KnowledgeGraphsTab result={ result } /> },
  }

  const tabList = Object.keys(tabs).map(key => tabs[key].content ? ({ key, tab: tabs[key].title }) : null).filter(tab => tab !== null)
  const tabContents = Object.keys(tabs).reduce((obj, key) => tabs[key].content ? ({ ...obj, [key]: tabs[key].content }) : obj, {})

  const openModal = (...args) => {
    openModalHandler(...args)
    analyticsEvents.resultModalOpened(query, result)
  }

  const IconComponent = icon

  return (
    <div className={classNames("result-card", className)} ref={ref}>
      <Card
        title={`${result.name} (${result.type})`}
        tabList={tabList}
        tabProps={{size: 'small'}}
        activeTabKey={currentTab}
        onTabChange={key => setCurrentTab(key)}
        extra={
          <div style={{ display: "flex", alignItems: "center" }}>
            <AddToCartIconButton concept={ result } from={{ type: "search", value: query }} />
            { icon && <IconComponent className="icon-btn" onClick={ openModal } style={{ marginLeft: 20 }} /> }
          </div>
        }
        actions={ [<br />] }
        // style={{ border: isConceptInCart(activeCart, result) ? "1px solid #91d5ff" : undefined }}
      >
        { tabContents[currentTab] }
      </Card>
    </div>
  )
})

ConceptCard.propTypes = {
  result: PropTypes.object.isRequired,
  openModalHandler: PropTypes.func.isRequired,
}