import { useEffect, useState } from 'react'
import { Menu, Modal, Space } from 'antd'
import './result-modal.css'
import { useHelxSearch } from '../'
import {
  InfoCircleOutlined as OverviewIcon,
  BookOutlined as StudiesIcon,
  ShareAltOutlined as KnowledgeGraphsIcon,
  CodeOutlined as TranQLIcon,
} from '@ant-design/icons'
import { OverviewTab, StudiesTab, KnowledgeGraphsTab, TranQLTab } from './tabs'
import { useAnalytics } from '../../../contexts'

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
    'tranql':   { title: 'TranQL',              icon: <TranQLIcon />,           content: <TranQLTab result={ result } />, },
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
            "User ID": "",
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
