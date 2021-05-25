import { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useHelxSearch } from './context'
import { Card } from 'antd'
import {
  ExpandOutlined as ViewIcon,
  FolderAddOutlined as AddIcon,
  ExperimentOutlined as LaunchIcon,
} from '@ant-design/icons'

const { Meta } = Card

export const SearchResultCard = ({ index, result }) => {
  const { query, fetchKnowledgeGraphs, fetchStudyVariable, resultsSelected, doSelect } = useHelxSearch()
  const [knowledgeGraphs, setKnowledgeGraphs] = useState([])
  const [studyVariables, setStudyVariables] = useState([])
  const [currentTab, setCurrentTab] = useState('overview')

  const tabs = {
    'overview': {
      title: 'Overview',
      content: (
        <Fragment>
          <Meta title="Type" description={result.type} />
          <br />
          <Meta title="Description" description={result.description} />
        </Fragment>
      ),
    },
    'variables': {
      title: 'Variables',
      content: (
        <Fragment>
          <Meta title="Variables" description="variables variables variables" />
        </Fragment>
      ),
    },
  }

  const tabList = Object.keys(tabs).map(key => ({ key, tab: tabs[key].title }))
  const tabContents = Object.keys(tabs).reduce((obj, key) => ({ ...obj, [key]: tabs[key].content }), {})

  return (
    <Card
      className="result-card"
      title={ result.description }
      tabList={tabList}
      activeTabKey={currentTab}
      onTabChange={key => setCurrentTab(key)}
      actions={[
        <AddIcon />,
        <LaunchIcon />,
        <ViewIcon />,
      ]}
    >
      { tabContents[currentTab] }
    </Card>
  )
}

SearchResultCard.propTypes = {
  index: PropTypes.number.isRequired,
  result: PropTypes.object.isRequired,
}