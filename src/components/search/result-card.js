import { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useHelxSearch } from './context'
import { Card, List, Space, Typography } from 'antd'
import { Link } from '../link'
import {
  ExpandOutlined as ViewIcon,
  FolderAddOutlined as AddIcon,
  ExperimentOutlined as LaunchIcon,
} from '@ant-design/icons'
import { KnowledgeGraphs, VariablesList } from './'

const { Meta } = Card
const { Text } = Typography

export const SearchResultCard = ({ index, result, openModalHandler }) => {
  const { query, fetchKnowledgeGraphs, fetchStudyVariables } = useHelxSearch()
  const [graphs, setGraphs] = useState([])
  const [studyVariables, setStudyVariables] = useState([])
  const [currentTab, setCurrentTab] = useState('overview')

  const tabs = {
    'overview': {
      title: 'Overview',
      content: (
        <Space direction="vertical" className="tab-content">
          <Space direction="vertical" align="start">
            <Text className="id" strong>{result.id}</Text>
            <Text className="type">{result.type}</Text>
            <Meta description={result.description} className="description"/>
          </Space>
          <br />
        </Space>
      ),
    },
    'vars': {
      title: 'Variables',
      content: (
        <Space direction="vertical" className="tab-content">
          <List
            className="variables-list"
            dataSource={studyVariables}
            renderItem={variable => (
              <Fragment>
                <List.Item>
                  <List.Item.Meta
                    title={ <span>Study: <Link to={variable.collection_action}>{variable.collection_name}</Link></span> }
                    description={<span>Accession: <Link to={variable.collection_action}>{variable.collection_id.replace(/^TOPMED\.STUDY:/, '')}</Link></span>}
                  />
                  <Text>{ variable.variables.length } variables</Text>
                </List.Item>
                <br/>
              </Fragment>
            )}
          />
        </Space>
      ),
    },
    'kgs': {
      title: 'Knowledge Graphs',
      content: (
        <Space direction="vertical" className="tab-content">
          <KnowledgeGraphs graphs={graphs} />
        </Space>
      ),
    },
  }

  const tabList = Object.keys(tabs).map(key => ({ key, tab: tabs[key].title }))
  const tabContents = Object.keys(tabs).reduce((obj, key) => ({ ...obj, [key]: tabs[key].content }), {})

  useEffect(() => {
    const getKgs = async () => {
      const kgs = await fetchKnowledgeGraphs(result.id)
      setGraphs(kgs)
    }
    const getVars = async () => {
      const vars = await fetchStudyVariables(result.id, query);
      const groupedIds = vars.reduce((acc, obj) => {
        let key = obj["collection_id"];
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push({
          id: obj.element_id,
          name: obj.element_name,
          description: obj.element_desc,
          e_link: obj.element_action
        })
        return acc;
      }, {})
      let tem_result = [];
      vars.reduce((acc, curr) => {
        const isFind = acc.find(item => item.collection_id === curr.collection_id);
        if (!isFind) {
          let studyObj = {
            collection_id: curr.collection_id,
            collection_action: curr.collection_action,
            collection_name: curr.collection_name,
            variables: groupedIds[curr.collection_id]
          }
          tem_result.push(studyObj);
          acc.push(curr);
        }
        return acc;
      }, [])
      setStudyVariables(tem_result);
    }

    getKgs()
    getVars()
  }, [fetchKnowledgeGraphs, fetchStudyVariables, query, result.id])

  return (
    <Fragment>
      <Card
        className="result-card"
        tabList={tabList}
        activeTabKey={currentTab}
        onTabChange={key => setCurrentTab(key)}
        actions={[
          <AddIcon />,
          <LaunchIcon />,
          <ViewIcon onClick={ openModalHandler } />,
        ]}
      >
        { tabContents[currentTab] }
      </Card>
   </Fragment>
  )
}

SearchResultCard.propTypes = {
  index: PropTypes.number.isRequired,
  result: PropTypes.object.isRequired,
  openModalHandler: PropTypes.func.isRequired,
}