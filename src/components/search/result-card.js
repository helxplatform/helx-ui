import { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useHelxSearch } from './context'
import { Card, List, Space, Typography } from 'antd'
import {
  ExpandOutlined as ViewIcon,
  FolderAddOutlined as AddIcon,
  ExperimentOutlined as LaunchIcon,
} from '@ant-design/icons'
import { KnowledgeGraphs } from './knowledge-graph'

const { Meta } = Card
const { Text } = Typography

export const SearchResultCard = ({ index, result, openModalHandler }) => {
  const { query, fetchKnowledgeGraphs } = useHelxSearch()
  const [knowledgeGraphs, setKnowledgeGraphs] = useState([])
  const [currentTab, setCurrentTab] = useState('overview')

  const tabs = {
    'overview': {
      title: 'Overview',
      content: (
        <Space direction="vertical" className="tab-content">
          <Space direction="vertical" align="start">
            <Text className="id" strong>{result.id}</Text>
            <Text className="type">{result.type}</Text>
            <br/>
            <Meta description={result.description} className="description"/>
          </Space>
          <br />
        </Space>
      ),
    },
    'vars': {
      title: 'Variables',
      content: (
        <Space direction="vertical" className="tab-content">
          <List
            className="variables-list"
            dataSource={ ['var1', 'var2', 'var3', 'var4', 'var5'] }
            renderItem={ variable => <List.Item>{variable}</List.Item>}
          />
        </Space>
      ),
    },
    'kgs': {
      title: 'Knowledge Graphs',
      content: (
        <Space direction="vertical" className="tab-content">
          <Text>KGs</Text>
          {
            knowledgeGraphs.length > 0 && <KnowledgeGraphs graphs={knowledgeGraphs} />
          }
        </Space>
      ),
    },
  }

  const tabList = Object.keys(tabs).map(key => ({ key, tab: tabs[key].title }))
  const tabContents = Object.keys(tabs).reduce((obj, key) => ({ ...obj, [key]: tabs[key].content }), {})

  useEffect(() => {
    const getKgs = async () => {
      const kgs = await fetchKnowledgeGraphs(result.id)
      setKnowledgeGraphs(kgs)
    }
    getKgs()
  }, [fetchKnowledgeGraphs, query, result.id])
  return (
    <Fragment>
      <Card
        className="result-card"
        title={ '' }
        tabList={tabList}
        activeTabKey={currentTab}
        onTabChange={key => setCurrentTab(key)}
        actions={[
          <AddIcon />,
          <LaunchIcon />,
          <ViewIcon onClick={ openModalHandler } />,
        ]}
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