import { Fragment, useEffect, useState } from 'react'
import { Menu, Modal, Space, Button } from 'antd'
import {
  InfoCircleOutlined as OverviewIcon,
  BookOutlined as StudiesIcon,
  ShareAltOutlined as KnowledgeGraphsIcon,
  ConsoleSqlOutlined as TranQLIcon,
  RobotOutlined as RobokopIcon,
  ExportOutlined as ExternalLinkIcon,
  FullscreenOutlined as FullscreenLayoutIcon
} from '@ant-design/icons'
import { OverviewTab, StudiesTab, KnowledgeGraphsTab, TranQLTab } from './tabs'
import { useHelxSearch } from '../'
import { SearchLayout } from '../context'
import { useAnalytics, useEnvironment } from '../../../contexts'
import { useShoppingCartUtilities } from '../../../hooks'
import './concept-modal.css'
import { AddToCartDropdown } from 'antd-shopping-cart'

// const RobokopIcon = () => <CustomIcon component={() => <img src="https://robokop.renci.org/pack/favicon.ico" style={{filter: "grayscale(100%)"}} />} />

export const ConceptModalBody = ({ result }) => {
  const { analyticsEvents } = useAnalytics();
  const { context } = useEnvironment();
  const [currentTab, _setCurrentTab] = useState('overview')
  const { fetchKnowledgeGraphs, fetchStudyVariables, query } = useHelxSearch()
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
  const { setFullscreenResult, query } = useHelxSearch()
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
      title={ `${ result.name } (${ result.type })` }
      visible={ visible }
      onOk={ closeHandler }
      okText="Close"
      onCancel={ closeHandler }
      width={ 1200 }
      style={{ top: 135 }}
      bodyStyle={{ padding: `0`, minHeight: `50vh` }}
      cancelButtonProps={{ hidden: true }}
      footer={(
        <div style={{ display: "flex", alignItems: "center" }}>
          <AddToCartDropdown
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
