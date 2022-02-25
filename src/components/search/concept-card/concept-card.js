import { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Link } from '../../link'
import { Card, List, Space, Tag, Typography } from 'antd'
import { ExpandOutlined as ViewIcon } from '@ant-design/icons'
import { KnowledgeGraphs, useHelxSearch } from '../'
import { OverviewTab } from './overview-tab'
import { StudiesTab } from './studies-tab'
import { KnowledgeGraphsTab } from './knowledge-graphs-tab'
import './concept-card.css'
import { useAnalytics } from '../../../contexts'

const { Meta } = Card
const { CheckableTag: CheckableFacet } = Tag
const { Text } = Typography

export const ConceptCard = ({ index, result, openModalHandler }) => {
  const analytics = useAnalytics()
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
    openModalHandler(...args);
    analytics.trackEvent({
      category: "UI Interaction",
      action: "Result modal opened",
      label: `Opened modal from card for result "${result.name}"`,
      customParameters: {
        "Search term": query,
        "Result name": result.name,
        "Result type": result.type,
        "Additional search terms": result.search_terms
      }
    })
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