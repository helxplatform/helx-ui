import { useState, forwardRef } from 'react'
import { Badge, Card, Space, Typography } from 'antd'
import { ExpandOutlined as ViewIcon } from '@ant-design/icons'
import { AddToCartIconButton, useShoppingCart } from 'antd-shopping-cart'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { OverviewTab } from './overview-tab'
import { StudiesTab } from './studies-tab'
import { useHelxSearch } from '../'
import { useAnalytics } from '../../../contexts'
import { useShoppingCartUtilities } from '../../../hooks'
import './concept-card.css'

const { Text } = Typography

export const ConceptCard = forwardRef(({ index, result, openModalHandler, icon=ViewIcon, className="" }, ref) => {
  let { name, type } = result

  const { analyticsEvents } = useAnalytics()
  const { query } = useHelxSearch()
  const [currentTab, setCurrentTab] = useState('overview')

  const { createConceptCartItem } = useShoppingCartUtilities()

  const tabs = {
    'overview': { title: 'Overview',         content: <OverviewTab result={ result } /> },
    'studies':  { title: `Studies`,          content: <StudiesTab result={ result } /> },
    // 'cdes':     { title: `CDEs`,             content: <CdesTab result={ result } /> },
  }

  const tabList = Object.keys(tabs).map(key => tabs[key].content ? ({ key, tab: tabs[key].title }) : null).filter(tab => tab !== null)
  const tabContents = Object.keys(tabs).reduce((obj, key) => tabs[key].content ? ({ ...obj, [key]: tabs[key].content }) : obj, {})

  const openModal = (...args) => {
    openModalHandler(...args)
    analyticsEvents.resultModalOpened(query, result)
  }

  const IconComponent = icon

  if (name.endsWith(`(${type})`)) name = name.slice(0, name.length - `(${type})`.length)

  return (
    <div className={classNames("result-card", className)} ref={ref}>
      <Card
        title={
          <div>
            <Text>{name} ({type})</Text>
            {/* { name !== result.name && <Text type="warning"> *</Text> } */}
            {/* <Text style={{ color: "rgba(0, 0, 0, 0.35)", marginLeft: 4, fontSize: 12, verticalAlign: "middle", fontWeight: "normal" }}>(edited)</Text> */}
          </div>
        }
        tabList={tabList}
        tabProps={{size: 'small'}}
        activeTabKey={currentTab}
        onTabChange={key => setCurrentTab(key)}
        extra={
          <div style={{ display: "flex", alignItems: "center" }}>
            <AddToCartIconButton item={ createConceptCartItem(result, query) } style={{ marginLeft: 8 }} />
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