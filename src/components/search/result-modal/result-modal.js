import { Fragment, useEffect, useState } from 'react'
import { Collapse, List, Menu, Modal, Space, Tag, Typography } from 'antd'
import './result-modal.css'
import { KnowledgeGraphs, useHelxSearch } from '../'
import { Link } from '../../link'

const { Text, Title } = Typography
const { CheckableTag: CheckableFacet } = Tag
const { Panel } = Collapse

const OverviewTab = ({ result }) => {
  return (
    <Space direction="vertical">
      <Title level={ 4 }>Overview</Title>
      <Text>{ result.description }</Text>
    </Space>
  )
}

const StudiesTab = ({ studies }) => {
  const [facets, setFacets] = useState([])
  const [selectedFacets, setSelectedFacets] = useState([])
  const [loading, setLoading] = useState(true)

  const handleSelectFacet = (facet, checked) => {
    const newSelection = new Set(selectedFacets)
    if (newSelection.has(facet)) {
      newSelection.delete(facet)
    } else {
      newSelection.add(facet)
    }
    setSelectedFacets([...newSelection])
  }

  useEffect(() => {
    setFacets(Object.keys(studies))
    setSelectedFacets(Object.keys(studies))
  }, [studies])

  return (
    <Space direction="vertical">
      <Title level={ 4 }>Studies</Title>
      <Space direction="horizontal" size="small">
        {
          facets.map(facet => studies[facet] && (
            <CheckableFacet
              key={ `search-facet-${ facet }` }
              checked={ selectedFacets.includes(facet) }
              onChange={ checked => handleSelectFacet(facet, checked) }
              children={ `${ facet } (${studies[facet].length})` }
            />
          ))
        }
      </Space>
      <Collapse ghost className="variables-collapse">
        {
          Object.keys(studies)
            .filter(facet => selectedFacets.includes(facet))
            .reduce((arr, facet) => [...arr, ...studies[facet]], [])
            .sort((s, t) => s.c_name < t.c_name ? -1 : 1)
            .map(item => (
              <Panel
                key={ `panel_${ item.c_name }` }
                header={
                    <Text>
                      { item.c_name }{ ` ` }
                      (<Link to={ item.c_link }>{ item.c_id }</Link>)
                    </Text>
                }
                extra={ <Text>{ item.elements.length } variable{ item.elements.length === 1 ? '' : 's' }</Text> }
              >
                <List
                  className="variables-list"
                  dataSource={ item.elements }
                  renderItem={ variable => <div><Text>{ variable.name }</Text></div> }
                />
              </Panel>
            ))
        }
      </Collapse>
   </Space>
  )
}

const KnowledgeGraphsTab = ({ graphs }) => {
  return (
    <Space direction="vertical">
      <Title level={ 4 }>Knowledge Graphs</Title>
      <KnowledgeGraphs graphs={ graphs } />
    </Space>    
  )
}


export const SearchResultModal = ({ result, visible, closeHandler }) => {
  const [currentTab, setCurrentTab] = useState('overview')
  const { fetchKnowledgeGraphs, fetchStudyVariables, query } = useHelxSearch()
  const [graphs, setGraphs] = useState([])
  const [studies, setStudies] = useState([])

  useEffect(() => {
    setCurrentTab('overview')
    if (!result) {
      return
    }
    const getVars = async () => {
      const { result: data } = await fetchStudyVariables(result.id, query)
      setStudies(data)
    }
    const getKgs = async () => {
      const kgs = await fetchKnowledgeGraphs(result.id)
      setGraphs(kgs)
    }
    getVars()
    getKgs()
  }, [fetchKnowledgeGraphs, fetchStudyVariables, result, query])

  if (!result) {
    return null
  }

  const tabs = {
    'overview': { title: 'Overview',         content: <OverviewTab result={ result } />, },
    'studies':  { title: `Studies`,          content: <StudiesTab studies={ studies } />, },
    'kgs':      { title: `Knowledge Graphs`, content: <KnowledgeGraphsTab graphs={ graphs } />, },
  }

  return (
    <Modal
      title={ `${ result.name } (${ result.type })` }
      visible={ visible }
      onOk={ closeHandler }
      okText="Close"
      onCancel={ closeHandler }
      width={ 1200 }
      style={{ top: 135 }}
      bodyStyle={{ padding: `0`, minHeight: `50vh` }}
      cancelButtonProps={{ hidden: true }}
    >
      <Space direction="horizontal" align="start">
        <Menu
          style={{ width: 256, height: '100%' }}
          defaultSelectedKeys={ ['overview'] }
          mode="inline"
          theme="light"
        >
          <Menu.Item key="overview" onClick={ () => setCurrentTab('overview') }>Overview</Menu.Item>
          <Menu.Item key="studies" onClick={ () => setCurrentTab('studies') }>Studies</Menu.Item>
          <Menu.Item key="kgs" onClick={ () => setCurrentTab('kgs') }>Knowledge Graphs</Menu.Item>
        </Menu>
        <div className="modal-content-container" children={ tabs[currentTab].content } />
      </Space>
    </Modal>
  )
}
