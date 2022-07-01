import { useEffect, useState } from 'react'
import { Menu, Modal, Space } from 'antd'
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
import { OverviewTab, StudiesTab, StudiesChartTab, KnowledgeGraphsTab, TranQLTab, RobokopTab } from './tabs'
import { useAnalytics, useEnvironment } from '../../../contexts'

// const RobokopIcon = () => <CustomIcon component={() => <img src="https://robokop.renci.org/pack/favicon.ico" style={{filter: "grayscale(100%)"}} />} />

export const ConceptModal = ({ result, visible, closeHandler }) => {
  const analytics = useAnalytics();
  const { context } = useEnvironment();
  const [currentTab, _setCurrentTab] = useState('overview')
  const { fetchKnowledgeGraphs, fetchVariablesForConceptId, query } = useHelxSearch()
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
    'robokop' : { title: 'Robokop', icon: <RobokopIcon/>, url: "https://robokop.renci.org/" }
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
      const tabTitle = tabs[tabName].title;
      if (tabName !== currentTab) {
        // Make sure we only track events when the tab actually changes.
        analytics.trackEvent({
          category: "UI Interaction",
          action: "Result tab selected",
          label: `User selected tab "${tabTitle}"`,
          value: tabTitle,
          customParameters: {
            "Tab name": tabTitle,
            "Previous tab name": tabs[currentTab].title,
            "Time spent on previous tab": elapsed
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
      const { result: data } = await fetchVariablesForConceptId(result.id, query)
      setStudies(data)
    }
    const getKgs = async () => {
      const kgs = await fetchKnowledgeGraphs(result.id)
      setGraphs(kgs)
    }
    getVars()
    getKgs()
  }, [fetchKnowledgeGraphs, fetchVariablesForConceptId, result, query])

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
    </Modal>
  )
}
