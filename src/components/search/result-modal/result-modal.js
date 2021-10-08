import { useEffect, useState } from 'react'
import { Collapse, List, Menu, Modal, Space, Tag, Typography } from 'antd'
import './result-modal.css'
import { KnowledgeGraphs, useHelxSearch } from '../'
import { Link } from '../../link'
import {
  InfoCircleOutlined as OverviewIcon,
  BookOutlined as StudiesIcon,
  ShareAltOutlined as KnowledgeGraphsIcon,
  CodeOutlined as TranQLIcon,
} from '@ant-design/icons'
import { useAnalytics } from '../../../contexts'

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
                  className="study-variables-list"
                  dataSource={ item.elements }
                  renderItem={ variable => (
                    <div className="study-variables-list-item">
                      <Text className="variable-name">
                        { variable.name } &nbsp;
                        ({ variable.e_link ? <a href={ variable.e_link }>{ variable.id }</a> : variable.id })
                      </Text><br />
                      <Text className="variable-description"> { variable.description }</Text>
                    </div>
                  ) }
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
  const analytics = useAnalytics();
  const [currentTab, _setCurrentTab] = useState('overview')
  const { fetchKnowledgeGraphs, fetchStudyVariables, query } = useHelxSearch()
  const [graphs, setGraphs] = useState([])
  const [studies, setStudies] = useState([])

  const tabs = {
    'overview': { title: 'Overview',            icon: <OverviewIcon />,         content: <OverviewTab result={ result } />, },
    'studies':  { title: 'Studies',             icon: <StudiesIcon />,          content: <StudiesTab studies={ studies } />, },
    'kgs':      { title: 'Knowledge Graphs',    icon: <KnowledgeGraphsIcon />,  content: <KnowledgeGraphsTab graphs={ graphs } />, },
  }
  
  const setCurrentTab = (() => {
    let oldTime = Date.now();
    return (tabName) => {
      const newTime = Date.now();
      const elapsed = newTime - oldTime;
      const tabTitle = tabs[tabName].title;
      if (tabName !== currentTab && elapsed > 5000) {
        // Make sure we only track events when the tab actually changes and when the tab was used for a notable amount of time (5 seconds).
        analytics.trackEvent({
          category: "UI Interaction",
          action: "Result tab selected",
          label: `User selected tab "${tabTitle}"`,
          value: tabTitle,
          customParameters: {
            "User ID": "",
            "Tab name": tabTitle,
            "Time spent on tab": elapsed
          }
        });
      } 
      oldTime = newTime;
      _setCurrentTab(tabName);
    }
  })()

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
          defaultSelectedKeys={ ['overview'] }
          mode="inline"
          theme="light"
        >
          {
            Object.keys(tabs).map(key => (
              <Menu.Item className="tab-menu-item" key={ key } onClick={ () => setCurrentTab(key) }>
                <span className="tab-icon">{ tabs[key].icon }</span> &nbsp; <span className="tab-name">{ tabs[key].title }</span>
              </Menu.Item>
            ))
          }
        </Menu>
        <div className="modal-content-container" children={ tabs[currentTab].content } />
      </Space>
    </Modal>
  )
}
