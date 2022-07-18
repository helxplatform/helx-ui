import { Fragment, useState, useEffect, forwardRef } from 'react'
import PropTypes from 'prop-types'
import { Card } from 'antd'
import { ExpandOutlined as ViewIcon } from '@ant-design/icons'
import { useHelxSearch } from '../'
import { OverviewTab } from './overview-tab'
import { StudiesTab } from './studies-tab'
// import { CdesTab } from './cdes-tab'
import { useAnalytics } from '../../../contexts'
import classNames from 'classnames'
import './concept-card.css'

export const ConceptCard = forwardRef(({ index, result, openModalHandler, icon=ViewIcon, className="" }, ref) => {
  const { analyticsEvents } = useAnalytics()
  const { query } = useHelxSearch()
  const [currentTab, setCurrentTab] = useState('overview')

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

  return (
    <div className={classNames("result-card", className)} ref={ref}>
      <Card
        title={`${result.name} (${result.type})`}
        tabList={tabList}
        tabProps={{size: 'small'}}
        activeTabKey={currentTab}
        onTabChange={key => setCurrentTab(key)}
        extra={ icon && <IconComponent onClick={ openModal } /> }
        actions={ [<br />] }
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