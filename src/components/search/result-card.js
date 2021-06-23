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
  const [currentFacets, setCurrentFacets] = useState([])

  const handleSelectFacet = (facet, checked) => {
    const newSelection = new Set(currentFacets)
    if (newSelection.has(facet)) {
      newSelection.delete(facet)
    } else {
      newSelection.add(facet)
    }
    setCurrentFacets([...newSelection])
  }

  const tabs = {
    'overview': {
      title: 'Overview',
      content: (
        <Meta description={result.description} className="description"/>
      ),
    },
    'studies': {
      title: `Studies`,
      content: (
        <Fragment>
          <Space direction="horizontal" size="small">
            {
              facets.map(facet => studyVariables[facet] && (
                <CheckableFacet
                  key={ `${ result.name }-search-facet-${ facet }` }
                  checked={ currentFacets.includes(facet) }
                  onChange={ checked => handleSelectFacet(facet, checked) }
                  children={ `${ facet } (${studyVariables[facet].length})` }
                />
              ))
            }
          </Space>
          {
            currentFacets && <pre style={{ fontSize: '66%', backgroundColor: '#ccc', scrollbarWidth: 'thin' }}>{ JSON.stringify(currentFacets.reduce((vars, facet) => [...vars, ...studyVariables[facet]], []), null, 2) }</pre>
          }
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
      setCurrentFacets(Object.keys(data))
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
        title={`${result.name} (${result.type})`}
        tabList={tabList}
        tabProps={{size: 'small'}}
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