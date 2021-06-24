import { useState } from 'react'
import { Divider, List, Menu, Modal, Space, Typography } from 'antd'
import './result-modal.css'

const { Paragraph, Text } = Typography

export const SearchResultModal = ({ result, visible, closeHandler }) => {
  const [currentTab, setCurrentTab] = useState('overview')

  if (!result) {
    return null
  }

  const tabs = {
    'overview': {
      title: 'Overview',
      content: (
        <Space direction="vertical">
          <Text>{ result.description }</Text>
        </Space>
      ),
    },
    'studies': {
      title: `Studies`,
      content: (
        <Space direction="vertical">
          Studies
        </Space>
      ),
    },
    'kgs': {
      title: `Knowledge Graphs`,
      content: (
        <Space direction="vertical">
          Knowledge Graphs
        </Space>
      ),
    },
  }

  const tabList = Object.keys(tabs).map(key => tabs[key].content ? ({ key, tab: tabs[key].title }) : null).filter(tab => tab !== null)
  const tabContents = Object.keys(tabs).reduce((obj, key) => tabs[key].content ? ({ ...obj, [key]: tabs[key].content }) : obj, {})

  const handleSelectMenuItem = key => setCurrentTab(key)

  return (
    <Modal
      title={ `${ result.name } (${ result.type })` }
      visible={ visible }
      onOk={ closeHandler }
      onCancel={ closeHandler }
      width={ 800 }
      bodyStyle={{ padding: `0` }}
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
        <div className="modal-content-container">
          { tabs[currentTab].content }
        </div>
      </Space>
    </Modal>
  )
}
