import { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Link } from '../../link'
import { Button, Card, List, Space, Tag, Tooltip, Typography } from 'antd'
import { KnowledgeGraphs, useHelxSearch } from '../'
import { OverviewTab } from './overview-tab'
import { StudiesTab } from './studies-tab'
import { KnowledgeGraphsTab } from './knowledge-graphs-tab'
import './result-card.css'
import { useAnalytics } from '../../../contexts'

const { Meta } = Card
const { CheckableTag: CheckableFacet } = Tag
const { Text } = Typography

const ViewIcon = ({ fill, size }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850.39 850.39" height={ size } width={ size } fill={ fill }>
      <path d="M801.07,566.06c-4.57-35.24-29.58-77.85-52.19-100.56,2.36,2.22-118.28-118.24-143.35-143.35a23,23,0,0,0-32.48,0c-16,19-77.43,69.9-84.72,93.94l-34.8-34.8a15.07,15.07,0,0,0-10.73-4.44c-6.8-.48-12,5.62-16.3,10l-183-183c16.3-28.52,16.11-65.87,1-94.75-6.63-15-33-39.83-51.36-57.67a19.51,19.51,0,0,0-27.39.2L51.85,165.5a19.51,19.51,0,0,0-.2,27.39c17.85,18.36,42.47,44.59,57.65,51.37,32.59,16.27,63.3,14.78,93.92-.56L386.44,426.93c-8.56,7-13.59,17.11-4.94,26.39l34.8,34.8c-24.26,6.64-75,69.08-94,84.74a23,23,0,0,0,0,32.47c27.88,25.32,149,156.33,180.82,172.22,30.45,17.92,66.85,27,102.68,26.94,33.52.34,144.23-19.14,175.08-21.7l.26-1.83,1.82-.27C787,728.63,813.23,619.6,801.07,566.06ZM219.74,155.51c.79,35.33-31.21,66.11-66.49,64-24.62,0-41.14-16.33-56.95-32.64A10.59,10.59,0,0,1,96.41,172l75.77-75.77a10.6,10.6,0,0,1,14.88-.12C204.12,112.63,220.48,129.25,219.74,155.51ZM562,538.76c19,20.11,27,33.47,31.88,54.92-31.71-5.56-55.5-32-80.38-57.4-23.25-23.5-70.67-70.43-93.75-93.68l23.05-23C476.79,453.55,528.19,505.07,562,538.76ZM434.53,518.28a16.12,16.12,0,0,1,16.2,3.9C503,575.27,544.74,629.91,617,634c6.41,1.08,12.79,2.19,19,3.35l-.27-1.82,1.87.29c-1.2-6.31-2.27-12.6-3.37-19.08-4.07-72.17-58.83-114.1-111.84-166.23-11.16-11.79.57-28.53,9.32-38L582.18,362a9.71,9.71,0,0,1,13.87.13c43.65,45.32,85.23,83.72,128.22,127.73,58.47,69,50.23,112.37,27.15,252.37a12.19,12.19,0,0,1-9.78,10C499.11,797.68,518.22,742.34,362.74,596a9.73,9.73,0,0,1-.22-13.95C381.45,563.09,417.77,521.45,434.53,518.28Z"/>
    </svg>
  )
}

ViewIcon.propTypes = {
  fill: PropTypes.string,
  size: PropTypes.number,
}

ViewIcon.defaultProps = {
  fill: '#1890ff',
  size: 30,
}

export const SearchResultCard = ({ index, result, openModalHandler }) => {
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
        extra={
          <Tooltip title="Dig into this concept" placement="left">
            <Button type="link" onClick={ openModal } icon={ <ViewIcon /> } className="shovel-button" />
          </Tooltip>
        }
        actions={ [<br />] }
      >
        { tabContents[currentTab] }
      </Card>
   </Fragment>
  )
}

SearchResultCard.propTypes = {
  index: PropTypes.number.isRequired,
  result: PropTypes.object.isRequired,
  openModalHandler: PropTypes.func.isRequired,
}