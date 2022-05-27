import { Fragment, useState } from 'react'
import PropTypes from 'prop-types'
import { Card } from 'antd'
import { ExpandOutlined as ViewIcon } from '@ant-design/icons'
import { useHelxSearch } from '../'
import { OverviewTab } from './overview-tab'
import { StudiesTab } from './studies-tab'
import { KnowledgeGraphsTab } from './knowledge-graphs-tab'
import { useAnalytics } from '../../../contexts'
import './concept-card.css'

export const ConceptCard = ({ index, result, openModalHandler }) => {
  const { analyticsEvents } = useAnalytics()
  const { query } = useHelxSearch()
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

  return (
    <Fragment>
      <Card
        className="result-card"
        title={`${result.name} (${result.type})`}
        tabList={tabList}
        tabProps={{size: 'small'}}
        activeTabKey={currentTab}
        onTabChange={key => setCurrentTab(key)}
        extra={ <ViewIcon onClick={ openModal } /> }
        actions={ [<br />] }
      >
        { tabContents[currentTab] }
      </Card>
   </Fragment>
  )
}

ConceptCard.propTypes = {
  index: PropTypes.number.isRequired,
  result: PropTypes.object.isRequired,
  openModalHandler: PropTypes.func.isRequired,
}