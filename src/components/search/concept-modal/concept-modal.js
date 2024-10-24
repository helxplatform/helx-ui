import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Menu, Modal, Result, Space, Spin, Typography, Tooltip, Divider, Popover } from 'antd'
import CustomIcon, {
  InfoCircleOutlined as OverviewIcon,
  BookOutlined as StudiesIcon,
  ShareAltOutlined as KnowledgeGraphsIcon,
  ConsoleSqlOutlined as TranQLIcon,
  RobotOutlined as RobokopIcon,
  ExportOutlined as ExternalLinkIcon,
  FullscreenOutlined as FullscreenLayoutIcon,
  UnorderedListOutlined as CdesIcon,
  QuestionCircleOutlined as ExplanationIcon,
  ArrowLeftOutlined, InfoCircleOutlined
} from '@ant-design/icons'
import { CdesTab, OverviewTab, StudiesTab, KnowledgeGraphsTab, TranQLTab, ExplanationTab } from './tabs'
import { useHelxSearch } from '../'
import { BouncingDots } from '../../'
import { useAnalytics, useEnvironment } from '../../../contexts'
import { kgLink } from '../../../utils'
import './concept-modal.css'

const { Text, Paragraph } = Typography

// const RobokopIcon = () => <CustomIcon component={() => <img src="https://robokop.renci.org/pack/favicon.ico" style={{filter: "grayscale(100%)"}} />} />

export const AdvancedConceptInfo = ({ result, style={}, props }) => {
  const purlUrl = kgLink.get_curie_purl(result.id)
  const tooltip = (
    <div>
      {/* Advanced information
      <Divider style={{ borderColor: "white", marginTop: 4, marginBottom: 8 }} /> */}
      <b>ID:</b> { result.id }
      {purlUrl && <Button
        type="text"
        icon={ <ExternalLinkIcon style={{ color: "white" }} /> }
        href={ purlUrl }
        target="_blank"
        rel="noopener noreferrer"
      /> }
    </div>
  )
  return (
    <Tooltip title={ tooltip } trigger="hover" placement="right" { ...props }>
      <InfoCircleOutlined style={{ color: "rgba(0, 0, 0, 0.45)", ...style }} />
    </Tooltip>
  )
}

export const ConceptModalTitle = ({ result }) => {
  const { setSelectedResult } = useHelxSearch()
  let { name, type, previousResult } = result
  
  if (name.endsWith(`(${type})`)) name = name.slice(0, name.length - `(${type})`.length)
  
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {previousResult && (
        <ArrowLeftOutlined
          className="previous-result-btn"
          style={{ marginRight: 8 }}
          onClick={ () => setSelectedResult(previousResult) }
        />
      )}
      <Text>
        { name }{ type ? " (" + type + ")" : "" }
      </Text>
      { !result.loading && !result.failed && <AdvancedConceptInfo result={ result } style={{ marginTop: 2, marginLeft: 8 }} /> }
    </div>
  )
}

export const ConceptModalBody = ({ result }) => {
  const { analyticsEvents } = useAnalytics();
  const { context } = useEnvironment();
  const [currentTab, _setCurrentTab] = useState('overview')
  const { query, setSelectedResult, fetchKnowledgeGraphs, fetchVariablesForConceptId, fetchCDEs, studySources } = useHelxSearch()
  const [graphs, setGraphs] = useState(undefined)
  const [studies, setStudies] = useState(undefined)
  const [cdes, setCdes] = useState(undefined)
  const [cdeRelatedConcepts, setCdeRelatedConcepts] = useState(null)
  const [cdeRelatedStudies, setCdeRelatedStudies] = useState(null)

  const [cdesLoading, cdesError] = useMemo(() => ([ cdes === undefined, cdes === null ]), [cdes])
  const [graphsLoading, graphsError] = useMemo(() => ([ graphs === undefined, graphs === null ]), [graphs])
  const [studiesLoading, studiesError] = useMemo(() => ([ studies === undefined, studies === null ]), [studies])

  /** Abort controllers */
  const fetchVarsController = useRef()
  const fetchCdesController = useRef()
  const fetchCdesTranqlController = useRef([])
  const fetchKgsController = useRef()

  const studyTitle = (
    <div style={{ display: "inline" }}>
      Studies
    </div>
  )
  const cdeTitle = (
    <div style={{ display: "inline" }}>
      CDEs
    </div>
  )

  const tabs = {
    'overview': {
      title: 'Overview',
      icon: <OverviewIcon />,
      content: <OverviewTab result={ result } />,
      tooltip: <div>
        The Overview tab provides a brief description of the concept.
        Hovering over the <InfoCircleOutlined style={{ color: "rgba(0, 0, 0, 0.45)", margin: "0 2px" }} />
        &nbsp;besides the concept name displays the corresponding ontological
        identifier, and where applicable, a link to the entry on the ontology&apos;s website.
      </div>
    },
    'studies': {
      title: studyTitle,
      icon: <StudiesIcon />,
      content: <StudiesTab studies={ studies } loading={ studiesLoading } error={ studiesError } />,
      tooltip: <div>
        The Studies tab displays studies referencing or researching the concept.
        Studies are grouped into { studySources.length } categories:&nbsp;
        { studySources.map((source, i) => (
          <Fragment key={ source }>
            { i === studySources.length - 1 ? "and " : ""}
            <span style={{ fontWeight: 500 }}>{ source }</span>
            { i !== studySources.length - 1 ? ", " : ". " }
          </Fragment>
        )) }
        By default, all studies are shown, but categories can be filtered
        out by clicking on them. You can also click on studies to view which of their variables are
        related to the concept.
      </div>
    },
    'cdes': {
      title: cdeTitle,
      icon: <CdesIcon />,
      content: <CdesTab cdes={ cdes } cdeRelatedConcepts={ cdeRelatedConcepts } cdeRelatedStudies={cdeRelatedStudies} loading={ cdesLoading } error={ cdesError } />,
      tooltip: <div>
        The CDEs tab displays{ context.brand === "heal" ? " HEAL-approved" : "" } common data elements (CDEs)
        associated with the concept. A CDE is a standardized question used across studies and clinical
        trials with a precisely defined set of permissible responses to ensure consistent data collection.
        {context.brand === "heal" ? <span>
          &nbsp;The <a href="https://heal.nih.gov/data/common-data-elements" target="_blank" rel="noopener noreferrer">
            HEAL CDE program
          </a> provides further information.
        </span> : null}
      </div>
    },
    'kgs': {
      title: 'Knowledge Graphs',
      icon: <KnowledgeGraphsIcon />, 
      content: <KnowledgeGraphsTab graphs={ graphs } loading={ graphsLoading } error={ graphsError } />,
      tooltip: <div>
        The Knowledge Graphs tab displays relevant edges from the <a href="https://robokop.renci.org/" target="_blank" rel="noopener noreferrer">ROBOKOP Knowledge Graph</a>
        &nbsp;portion connected to the concept and containing your search terms. This section highlights
        potential interesting knowledge graph relationships and shows terms (e.g., synonyms) that
        would be returned as related concepts.
      </div>
    },
    'explanation': {
      title: 'Explanation',
      icon: <ExplanationIcon />,
      content: <ExplanationTab result={ result } />,
      tooltip: <div>
        The Explanation tab explains why a particular concept was returned for a search. Specifically,
        it breaks down the concept&apos;s relevance score based on information where the search query
        was found, including the concept&apos;s name, synonyms, and related terms (as shown in the Knowledge Graphs tab). 
      </div>
    },
    'tranql': {
      title: 'TranQL',
      icon: <TranQLIcon />,
      content: <TranQLTab result={ result } graphs = { graphs } />,
    }
  }
  const links = {
    'robokop' : { title: 'ROBOKOP', icon: <RobokopIcon/>, url: "https://robokop.renci.org/" }
  }
  context.hidden_result_tabs.forEach((tab) => {
    delete tabs[tab]
    delete links[tab]
  })
  
  const setCurrentTab = useCallback((() => {
    let oldTime = Date.now();
    return (tabName) => {
      const newTime = Date.now();
      const elapsed = newTime - oldTime;
      _setCurrentTab((currentTab) => {
        if (tabName !== currentTab) {
          // Make sure we only track events when the tab actually changes.
          analyticsEvents.resultModalTabSelected(tabs[tabName].title, tabs[currentTab].title, elapsed)
        } 
        return tabName
      })
      oldTime = newTime;
    }
  })(), [tabs])

  useEffect(() => {
    setCurrentTab('overview')
    if (!result) {
      return
    }
    const getVars = async () => {
      try {
        fetchVarsController.current?.abort()
        fetchVarsController.current = new AbortController()

        const data = await fetchVariablesForConceptId(result.id, query, {
          signal: fetchVarsController.current.signal
        })
        setStudies(data.reduce((studies, study) => {
          if (!studies.hasOwnProperty(study.type)) studies[study.type] = []
          studies[study.type].push(study)
          return studies
        }, {}))
      } catch (e) {
        if (e.name !== "CanceledError") {
          console.warning(e)
          setStudies(null)
        }
      }
    }
    const getCdes = async () => {
      try {
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
                  `${tranqlUrl}tranql/query`,
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

        const loadRelatedStudies = async (cdeId) => {
          const formatCdeQuery = () => {
            return `\
      SELECT publication->study
      FROM "/schema"
      WHERE publication="${cdeId}"`
          }
          const tranqlUrl = context.tranql_url
          const controller = new AbortController()
          fetchCdesTranqlController.current.push(controller)
          const res = await fetch(
              `${tranqlUrl}tranql/query`,
              {
                  headers: { 'Content-Type': 'text/plain' },
                  method: 'POST',
                  body: formatCdeQuery(),
                  signal: controller.signal
              }
          )
          const message = await res.json()
          const studies = []
          const nodes =  message.message.knowledge_graph.nodes
          for (const [key, value] of Object.entries(nodes)) {
            const name = value.name;
            const urlAttribute = value.attributes.find(attr => attr.name === 'url');
            urlAttribute && studies.push({c_id: key,
                                          c_name: name,
                                          c_link: urlAttribute.value});
          }
          return studies
        }

        const relatedConcepts = {}
        const relatedStudies = {}
        if (cdeData) {
          const cdeIds = cdeData.elements.map((cde) => cde.id)
          await Promise.all(cdeIds.map(async (cdeId, i) => {
            try {
              const relatedConceptsRaw = await loadRelatedConcepts(cdeId)
              // Counterproductive to suggest the concept the user is actively viewing as "related"
              relatedConcepts[cdeId] = relatedConceptsRaw.filter((c) => c.id !== result.id)
            } catch (e) {
              // Here, we explicitly want to halt execution and forward this error to the outer handler
              // if a related concept request was aborted, because we now have stale data and don't want to
              // update state with it.
              if (e.name === "CanceledError" || e.name === "AbortError") throw e
              relatedConcepts[cdeId] = null
            }
          }))
          await Promise.all(cdeIds.map(async (cdeId, i) => {
            try {
              relatedStudies[cdeId] = await loadRelatedStudies(cdeId)
            } catch (e) {
              // Here, we explicitly want to halt execution and forward this error to the outer handler
              // if a related concept request was aborted, because we now have stale data and don't want to
              // update state with it.
              if (e.name === "CanceledError" || e.name === "AbortError") throw e
            }
          }))
        }
        setCdes(cdeData)
        /** Note that relatedConcepts are *TranQL* concepts/nodes, not DUG concepts. Both have the top level fields `id` and `name`. */
        setCdeRelatedConcepts(relatedConcepts)
        setCdeRelatedStudies(relatedStudies)
      } catch (e) {
        // Check both because this function uses both Fetch API & Axios
        if (e.name !== "CanceledError" && e.name !== "AbortError") {
          console.warning(e)
          setCdes(null)
        }
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
        if (e.name !== "CanceledError") {
          console.warning(e)
          setGraphs(null)
        }
      }
    }
    if (!result.loading && !result.failed) {
      setStudies(undefined)
      setGraphs(undefined)
      setCdes(undefined)
      setCdeRelatedConcepts(null)
      setCdeRelatedStudies(null)
      
      getVars()
      getKgs()
      getCdes()
    }
  }, [fetchKnowledgeGraphs, fetchVariablesForConceptId, fetchCDEs, result, query])

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
        <Button key={ 0 } type="primary" onClick={() => {
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
              <a
                key={ suggestedResult.id }
                role="button"
                style={{ display: "inline", marginRight: "12px", lineHeight: "36px" }}
                onClick={() => setSelectedResult(suggestedResult)}
              >
                {suggestedResult.name}
              </a>
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
        className="concept-modal-tabs"
        selectedKeys={ [currentTab] }
      >
        {
          Object.keys(tabs).map(key => (
            <Menu.Item key={ key } className="tab-menu-item" onClick={ () => setCurrentTab(key) }>
              <Popover
                content={ tabs[key].tooltip }
                placement="rightTop"
                overlayStyle={{ maxWidth: 400, wordBreak: "break-word" }}
                // Position the arrow a bit more to the right of the tab, since they have have white backgrounds.
                align={{ offset: [16, 0] }}
              >
                <div className="tab-menu-item-wrapper">
                  <span className="tab-icon">{ tabs[key].icon }</span>
                  &nbsp;&nbsp;&nbsp;
                  <span className="tab-name">{ tabs[key].title }</span>
                </div>
              </Popover>
            </Menu.Item>
          ))
        }
        {Object.keys(links).length !== 0 && <Menu.Divider/>}
        {
          Object.keys(links).map(key => (
            <Menu.Item className="tab-menu-item" key={ key } onClick={null}>
              <Tooltip title={ links[key].tooltip } placement="right">
                <div className="tab-menu-item-wrapper">
                  <a href={ links[key].url } target="_blank" rel="noopener noreferrer">
                    <span className="tab-icon">{ links[key].icon || <ExternalLinkIcon/> }</span> &nbsp; <span className="tab-name">{ links[key].title }</span>
                  </a>
                </div>
              </Tooltip>
            </Menu.Item>
          ))
        }
      </Menu>
      <div className="modal-content-container">
        { tabs[currentTab].content }
      </div>
    </Space>
  )
}

export const ConceptModal = ({ result, visible, closeHandler }) => {
  const { setFullscreenResult, setSelectedResult } = useHelxSearch()
  const [doFullscreen, setDoFullscreen] = useState(null)

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
      className="concept-modal"
      footer={(
        <Space style={{ justifyContent: "flex-end" }}>
          <Button className="concept-modal-fullscreen-btn" type="ghost" onClick={ openFullscreen }>Fullscreen</Button>
          <Button className="concept-modal-close-btn" type="primary" onClick={ closeHandler }>Close</Button>
        </Space>
      )}
    >
      <ConceptModalBody result={ result } />
    </Modal>
  )
}
