import { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useHelxSearch } from './context'
import { Card, List, Space, Tag, Typography } from 'antd'
import { Link } from '../link'
import {
  ExpandOutlined as ViewIcon,
  FolderAddOutlined as AddIcon,
  ExperimentOutlined as LaunchIcon,
} from '@ant-design/icons'
import { KnowledgeGraphs } from './'
import './result-card.css'

const { Meta } = Card
const { CheckableTag: CheckableFacet } = Tag
const { Text } = Typography

export const SearchResultCard = ({ index, result, openModalHandler }) => {
  const { query, fetchKnowledgeGraphs, fetchStudyVariables } = useHelxSearch()
  const [graphs, setGraphs] = useState([])
  const [studyVariables, setStudyVariables] = useState([])
  const [currentTab, setCurrentTab] = useState('overview')
  const [facets, setFacets] = useState([])
  const [currentFacet, setCurrentFacet] = useState()

  const handleSelectFacet = (facet, checked) => setCurrentFacet(facet)

  const tabs = {
    'overview': {
      title: 'Overview',
      content: (
        <Space direction="vertical" className="tab-content">
          <Space direction="vertical" align="start">
            <Text className="id" strong>{result.name}</Text>
            <Text className="type">{result.type}</Text>
            <Meta description={result.description} className="description"/>
          </Space>
          <br />
        </Space>
      ),
    },
    'studies': {
      title: `Studies (${ studyVariables.length })`,
      content: (
        <Fragment>
          <Space direction="horizontal" size="small">
            {
              facets.map(facet => <CheckableFacet key={ `search-facet-${ facet }` } checked={ currentFacet === facet } onChange={ checked => handleSelectFacet(facet, checked) }>{ facet }</CheckableFacet>)
            }
          </Space>
          <pre style={{ fontSize: '66%', backgroundColor: '#ccc' }}>{ JSON.stringify(studyVariables[currentFacet], null, 2) }</pre>
        </Fragment>
      ),
    },
    'kgs': {
      title: `Knowledge Graphs (${ graphs.length })`,
      content: graphs.length > 0 ? (
        <Space direction="vertical" className="tab-content">
          <KnowledgeGraphs graphs={graphs} />
          <br/>
        </Space>
      ) : null,
    },
  }

  const tabList = Object.keys(tabs).map(key => tabs[key].content ? ({ key, tab: tabs[key].title }) : null).filter(tab => tab !== null)
  const tabContents = Object.keys(tabs).reduce((obj, key) => tabs[key].content ? ({ ...obj, [key]: tabs[key].content }) : obj, {})

  useEffect(() => {
    const getKgs = async () => {
      const kgs = await fetchKnowledgeGraphs(result.id)
      setGraphs(kgs)
    }
    const getVars = async () => {
      const { result: data } = await fetchStudyVariables(result.id, query);
      if (!data) {
        setStudyVariables([])
      }
      setFacets(Object.keys(data))
      setCurrentFacet(Object.keys(data)[0])
      console.log(Object.keys(data))
      console.log(data)
      setStudyVariables(data)
    }

    getKgs()
    getVars()
  }, [fetchKnowledgeGraphs, fetchStudyVariables, query, result.id])

  return (
    <Fragment>
      <Card
        className="result-card"
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