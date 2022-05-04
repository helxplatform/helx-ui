import { Fragment, useEffect, useState } from 'react'
import { Menu, Modal, Space, Breadcrumb, Button, Typography, Spin } from 'antd'
import './concept-modal.css'
import { useHelxSearch } from '../'
import CustomIcon, {
  InfoCircleOutlined as OverviewIcon,
  BookOutlined as StudiesIcon,
  ShareAltOutlined as KnowledgeGraphsIcon,
  CodeOutlined as TranQLIcon,
  PlayCircleOutlined as RobokopIcon,
  ExportOutlined as ExternalLinkIcon
} from '@ant-design/icons'
import { OverviewTab, StudiesTab, KnowledgeGraphsTab, TranQLTab, RobokopTab } from './tabs'
import { useAnalytics, useEnvironment } from '../../../contexts'

// const RobokopIcon = () => <CustomIcon component={() => <img src="https://robokop.renci.org/pack/favicon.ico" style={{filter: "grayscale(100%)"}} />} />

const { Text } = Typography

export const ConceptModal = ({ result, breadcrumbs, visible, closeHandler }) => {
  const { analyticsEvents } = useAnalytics();
  const { context } = useEnvironment();
  const [currentTab, _setCurrentTab] = useState('overview')
  const {
    fetchKnowledgeGraphs, fetchStudyVariables, query,
    resultCrumbs, goToResultBreadcrumb, selectedResultLoading
  } = useHelxSearch()
  const [graphs, setGraphs] = useState([])
  const [studies, setStudies] = useState([])

  const tabs = {
    'overview': { title: 'Overview',            icon: <OverviewIcon />,         content: <OverviewTab result={ result } />, },
    'studies':  { title: 'Studies',             icon: <StudiesIcon />,          content: <StudiesTab studies={ studies } />, },
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

  const ResultCrumb = ({ result, isLastCrumb }) => {
    let body = (
      <span>{result.name}</span>
    )
    if (!isLastCrumb) body = (
      <a role="button" aria-hidden="true" onClick={() => goToResultBreadcrumb(result)}>
        {body}
      </a>
    )
    return body
  }

  if (!result) {
    return null
  }

  const title = (
    <Fragment>
      { result.name } {result.type && `(${result.type})`}
      {resultCrumbs.length > 1 && (
        <Space direction="vertical" size="middle" style={{ marginTop: "16px", fontWeight: "normal" }}>
          <Breadcrumb>
            <Breadcrumb.Item>
              Explore results
            </Breadcrumb.Item>
            {resultCrumbs.map((crumbResult, i) => (
              <Breadcrumb.Item>
                <ResultCrumb result={crumbResult} isLastCrumb={i === resultCrumbs.length - 1}/>
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
          {/* <Button type="ghost" size="small">Full search</Button> */}
        </Space>
      )}
    </Fragment>
  )
  const body = selectedResultLoading ? (
    <Spin style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}/>
  ) : (
    <div style={{ display: "flex", flexDirection: "column", visibility: selectedResultLoading ? "hidden" : "visible" }}>
      <Space direction="horizontal" align="start">
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
                  <span className="tab-icon">{ <ExternalLinkIcon/> }</span> &nbsp; <span className="tab-name">{ links[key].title }</span>
                </a>
              </Menu.Item>
            ))
          }
        </Menu>
        <div className="modal-content-container" children={ tabs[currentTab].content } />
      </Space>
    </div>
  )

  return (
    <Modal
      title={ title }
      visible={ visible }
      onOk={ closeHandler }
      okText="Close"
      onCancel={ closeHandler }
      width={ 1200 }
      style={{ top: 135 }}
      bodyStyle={{ padding: `0`, minHeight: `50vh`, position: `relative` }}
      cancelButtonProps={{ hidden: true }}
    >
      {body}
    </Modal>
  )
}
