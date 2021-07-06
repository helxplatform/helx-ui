import { useState } from 'react'
import { Divider, List, Menu, Modal, Space, Typography } from 'antd'
import { KnowledgeGraphs } from './'
import './result-modal.css'

const { Paragraph, Text, Title } = Typography

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
          <Title level={ 3 }>Overview</Title>
          <Text>{ result.description }</Text>
        </Space>
      ),
    },
    'studies': {
      title: `Studies`,
      content: (
        <Space direction="vertical">
          <Title level={ 3 }>Studies</Title>
          <List
            className="studies-list"
            dataSource={
              Object.keys(studyVariables)
                .filter(facet => selectedFacets.includes(facet))
                .reduce((arr, facet) => [...arr, ...studyVariables[facet]], [])
                .sort((s, t) => s.c_name < t.c_name ? -1 : 1)
            }
            renderItem={ item => (
              <List.Item>
                <div className="studies-list-item">
                  <Text className="study-name">
                    { item.c_name }{ ` ` }
                    (<Link to={ item.c_link }>{ item.c_id }</Link>)
                  </Text>
                  <Text className="variables-count">{ item.elements.length } variable{ item.elements.length === 1 ? '' : 's' }</Text>
                </div>
              </List.Item>
            ) }
          />
       </Space>
      ),
    },
    'kgs': {
      title: `Knowledge Graphs`,
      content: (
        <Space direction="vertical">
          <Title level={ 3 }>Knowledge Graphs</Title>
        </Space>
      ),
    },
  }

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
