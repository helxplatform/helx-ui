import { useState } from 'react'
import { Menu, Modal, Space, Typography } from 'antd'
import './result-modal.css'

const { Text, Title } = Typography

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
          <Title level={ 4 }>Overview</Title>
          <Text>{ result.description }</Text>
        </Space>
      ),
    },
    'studies': {
      title: `Studies`,
      content: (
        <Space direction="vertical">
          <Title level={ 4 }>Studies</Title>
       </Space>
      ),
    },
    'kgs': {
      title: `Knowledge Graphs`,
      content: (
        <Space direction="vertical">
          <Title level={ 4 }>Knowledge Graphs</Title>
        </Space>
      ),
    },
  }

  return (
    <Modal
      centered
      title={ `${ result.name } (${ result.type })` }
      visible={ visible }
      onOk={ closeHandler }
      onCancel={ closeHandler }
      width={ 800 }
      bodyStyle={{ padding: `0`, minHeight: `50vh` }}
      footer={ null }
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
