import { useEffect, useRef, useState } from 'react'
import { Menu, Modal, Space, Button, Result, Spin, Typography } from 'antd'
import {
  InfoCircleOutlined as OverviewIcon,
  BookOutlined as StudiesIcon,
  ShareAltOutlined as KnowledgeGraphsIcon,
  ConsoleSqlOutlined as TranQLIcon,
  RobotOutlined as RobokopIcon,
  ExportOutlined as ExternalLinkIcon,
  FullscreenOutlined as FullscreenLayoutIcon,
  UnorderedListOutlined as CdesIcon,
  ArrowLeftOutlined
} from '@ant-design/icons'
import { CdesTab, OverviewTab, StudiesTab, KnowledgeGraphsTab, TranQLTab } from './tabs'
import { useHelxSearch } from '../'
import { useAnalytics, useEnvironment } from '../../../contexts'
import { useShoppingCartUtilities } from '../../../hooks'
import './concept-modal.css'
import { AddToCartDropdownButton } from 'antd-shopping-cart'

const { Text, Paragraph } = Typography

// const RobokopIcon = () => <CustomIcon component={() => <img src="https://robokop.renci.org/pack/favicon.ico" style={{filter: "grayscale(100%)"}} />} />

export const ConceptModalTitle = ({ result }) => {
  const { setSelectedResult } = useHelxSearch()
  let { name, type, previousResult } = result
  
  if (name.endsWith(`(${type})`)) name = name.slice(0, name.length - `(${type})`.length)
  
  return (
    <Space size="middle">
      {previousResult && <ArrowLeftOutlined className="previous-result-btn" onClick={ () => setSelectedResult(previousResult) } /> }
      <Text>
        { name }{ type ? " (" + type + ")" : "" }
      </Text>
    </Space>
  )
}

export const ConceptModalBody = ({ result }) => {
  const { analyticsEvents } = useAnalytics();
  const { context } = useEnvironment();
  const [currentTab, _setCurrentTab] = useState('overview')
  const { query, setSelectedResult, fetchKnowledgeGraphs, fetchStudyVariables, fetchCDEs } = useHelxSearch()
  const [graphs, setGraphs] = useState([])
  const [studies, setStudies] = useState([])
  const [cdes, setCdes] = useState(null)
  const [cdeRelatedConcepts, setCdeRelatedConcepts] = useState(null)
  const [cdesLoading, setCdesLoading] = useState(true)

  /** Abort controllers */
  const fetchVarsController = useRef()
  const fetchCdesController = useRef()
  const fetchCdesTranqlController = useRef([])
  const fetchKgsController = useRef()

  const tabs = {
    'overview': { title: 'Overview',            icon: <OverviewIcon />,         content: <OverviewTab result={ result } />, },
    'studies':  { title: 'Studies',             icon: <StudiesIcon />,          content: <StudiesTab studies={ studies } />, },
    'cdes':     { title: `CDEs`,                icon: <CdesIcon />,             content: <CdesTab cdes={ cdes } cdeRelatedConcepts={ cdeRelatedConcepts } loading={ cdesLoading } result={ result } /> },
    'kgs':      { title: 'Knowledge Graphs',    icon: <KnowledgeGraphsIcon />,  content: <KnowledgeGraphsTab graphs={ graphs } />, },
    'tranql':   { title: 'TranQL',              icon: <TranQLIcon />,           content: <TranQLTab result={ result } graphs = { graphs } /> },
    // 'robokop':   { title: 'Robokop',            icon: <RobokopIcon/>,           content: <RobokopTab /> }
  }
  const links = {
    'robokop' : { title: 'ROBOKOP', icon: <RobokopIcon/>, url: "https://robokop.renci.org/" }
  }
  if (context.tranql_enabled === 'false') {
    delete tabs['tranql'];
    delete links['robokop'];
  }
  
  const setCurrentTab = (() => {
    let oldTime = Date.now();
    return (tabName) => {
      const newTime = Date.now();
      const elapsed = newTime - oldTime;
      if (tabName !== currentTab) {
        // Make sure we only track events when the tab actually changes.
        analyticsEvents.resultTabSelected(tabs[tabName].title, tabs[currentTab].title, elapsed)
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
      try {
        fetchVarsController.current?.abort()
        fetchVarsController.current = new AbortController()

        const data = await fetchStudyVariables(result.id, query, {
          signal: fetchVarsController.current.signal
        })
        setStudies(data.reduce((studies, study) => {
          if (!studies.hasOwnProperty(study.type)) studies[study.type] = []
          studies[study.type].push(study)
          return studies
        }, {}))
      } catch (e) {
        if (e.name !== "CanceledError") throw e
      }
    }
    const getCdes = async () => {
      try {
        setCdesLoading(true)

        fetchCdesController.current?.abort()
        fetchCdesController.current = new AbortController()
        fetchCdesTranqlController.current.forEach((controller) => controller.abort())
        fetchCdesTranqlController.current = []
        const cdeData = await fetchCDEs(result.id, query, {
          signal: fetchCdesController.current.signal
        })
        const loadRelatedConcepts = async (cdeId) => {
          const formatCdeQuery = (conceptType) => {
            return `\
      SELECT publication-[mentions]->${conceptType}
      FROM "/schema"
      WHERE publication="${cdeId}"`
          }
          const tranqlUrl = context.tranql_url
          const types = ['disease', 'anatomical_entity', 'phenotypic_feature', 'biological_process'] // add any others that you can think of, these are the main 4 found in heal results and supported by tranql
          const kg = (await Promise.all(types.map(async (type) => {
              const controller = new AbortController()
              fetchCdesTranqlController.current.push(controller)
              const res = await fetch(
                  `${tranqlUrl}/tranql/query`,
                  {
                      headers: { 'Content-Type': 'text/plain' },
                      method: 'POST',
                      body: formatCdeQuery(type),
                      signal: controller.signal
                  }
              )
              const message = await res.json()
              return message.message.knowledge_graph
          }))).reduce((acc, kg) => ({
              nodes: {
                  ...acc.nodes,
                  ...kg.nodes
              },
              edges: {
                  ...acc.edges,
                  ...kg.edges
              }
          }), {"nodes": {}, "edges": {}})
          const cdeOutEdges = Object.values(kg.edges).filter((edge) => edge.subject ===  cdeId)
          return cdeOutEdges.map(
            (outEdge) => {
              const [nodeId, node] = Object.entries(kg.nodes).find(([nodeId, node]) => nodeId === outEdge.object)
              return {
                id: nodeId,
                ...node
              }
            }
          )
        }
        const relatedConcepts = {}
        if (cdeData) {
          const cdeIds = cdeData.elements.map((cde) => cde.id)
          await Promise.all(cdeIds.map(async (cdeId, i) => {
            relatedConcepts[cdeId] = await loadRelatedConcepts(cdeId)
          }))
        }
        setCdes(cdeData)
        /** Note that relatedConcepts are *TranQL* concepts/nodes, not DUG concepts. Both have the top level fields `id` and `name`. */
        setCdeRelatedConcepts(relatedConcepts)
        setCdesLoading(false)
      } catch (e) {
        // Check both because this function uses both Fetch API & Axios
        if (e.name !== "CanceledError" && e.name !== "AbortError") throw e
      }
    }
    const getKgs = async () => {
      try {
        fetchKgsController.current?.abort()
        fetchKgsController.current = new AbortController()

        const kgs = await fetchKnowledgeGraphs(result.id, {
          signal: fetchKgsController.current.signal
        })
        setGraphs(kgs)
      } catch (e) {
        if (e.name !== "CanceledError") throw e
      }
    }
    if (!result.loading && !result.failed) {
      setStudies([])
      setCdes(null)
      setCdeRelatedConcepts(null)
      setGraphs([])
      
      getVars()
      getCdes()
      getKgs()
    }
  }, [fetchKnowledgeGraphs, fetchStudyVariables, fetchCDEs, result, query])

  useEffect(() => {
    return () => {
      // On unmount, cancel all pending fetch requests.
      fetchVarsController.current?.abort()
      fetchKgsController.current?.abort()
      fetchCdesController.current?.abort()
      fetchCdesTranqlController.current.forEach((controller) => controller.abort())
      fetchCdesTranqlController.current = []
    }
  }, [])
  
  if (result.loading) return (
    <Spin style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
  )
  else if (result.failed) return (
    <Result
      status="error"
      title="Result not found"
      subTitle="Sorry! It looks like we don't have this concept indexed."
      extra={[
        <Button type="primary" onClick={() => {
          // go back one crumb
          setSelectedResult(result.previousResult)
        }}>Go back</Button>
      ]}
      className="concept-modal-failed-result"
    >
      <Paragraph style={{ marginBottom: 0 }}>
        <Text strong style={{ fontSize: 16 }}>Related concepts</Text>
      </Paragraph>
      <div>
        {
          result.suggestions
            .slice(0, 8)
            .map((suggestedResult) => (
              <a role="button" style={{ display: "inline", marginRight: "12px", lineHeight: "36px" }} onClick={() => setSelectedResult(suggestedResult)}>{suggestedResult.name}</a>
            ))
        }
      </div>
    </Result>
  )
  return (
    <Space align="start" className="concept-modal-body">
      <Menu
        defaultSelectedKeys={ ['overview'] }
        mode="inline"
        theme="light"
        selectedKeys={ [currentTab] }
      >
        {
          Object.keys(tabs).map(key => (
            <Menu.Item className="tab-menu-item" key={ key } onClick={ () => setCurrentTab(key) }>
              <span className="tab-icon">{ tabs[key].icon }</span> &nbsp; <span className="tab-name">{ tabs[key].title }</span>
            </Menu.Item>
          ))
        }
        {Object.keys(links).length !== 0 && <Menu.Divider/>}
        {
          Object.keys(links).map(key => (
            <Menu.Item className="tab-menu-item" key={ key } onClick={null}>
              <a href={ links[key].url } target="_blank" rel="noopener noreferrer">
                <span className="tab-icon">{ links[key].icon || <ExternalLinkIcon/> }</span> &nbsp; <span className="tab-name">{ links[key].title }</span>
              </a>
            </Menu.Item>
          ))
        }
      </Menu>
      <div className="modal-content-container" children={ tabs[currentTab].content } />
    </Space>
  )
}

export const ConceptModal = ({ result, visible, closeHandler }) => {
  const { setFullscreenResult, query, setSelectedResult } = useHelxSearch()
  const [doFullscreen, setDoFullscreen] = useState(null)

  const { createConceptCartItem } = useShoppingCartUtilities()

  /**
   * Essentially peforming the same thing as what a this.setState call using a callback would do.
   * Need to render the modal as closed for one render in order for the modal to actually close
   * before redirecting to the fullscreen layout.
   */
  useEffect(() => {
    if (doFullscreen !== null) {
      setFullscreenResult(doFullscreen)
      setDoFullscreen(null)
    }
  }, [doFullscreen])

  const openFullscreen = () => {
    setDoFullscreen(result)
    closeHandler()
  }

  if (!result) {
    return null
  }

  return (
    <Modal
      title={ <ConceptModalTitle result={ result } /> }
      visible={ visible }
      onOk={ closeHandler }
      okText="Close"
      onCancel={ closeHandler }
      width={ 1200 }
      style={{ top: 135 }}
      bodyStyle={{ padding: `0`, minHeight: `50vh`, position: `relative` }}
      cancelButtonProps={{ hidden: true }}
      footer={(
        <div style={{ display: "flex", alignItems: "center" }}>
          <AddToCartDropdownButton
            item={ createConceptCartItem(result, query) }
          />
          <Space style={{ justifyContent: "flex-end" }}>
            <Button type="ghost" onClick={ openFullscreen }>Fullscreen</Button>
            <Button type="primary" onClick={ closeHandler }>Close</Button>
          </Space>
        </div>
      )}
    >
      <ConceptModalBody result={ result } />
    </Modal>
  )
}
