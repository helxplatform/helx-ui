import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useHelxSearch } from './context';
import { Card, Collapse } from 'antd';
import { KnowledgeGraphs } from './knowledge-graph';
import { VariablesList } from './variables-list';

const { Panel } = Collapse

export const SearchResult = ({ index, result }) => {
  const { query, fetchKnowledgeGraphs, fetchStudyVariable, resultsSelected, doSelect } = useHelxSearch();
  const [knowledgeGraphs, setKnowledgeGraphs] = useState([]);
  const [studyVariables, setStudyVariables] = useState([]);
  useEffect(() => {
    const getKgs = async () => {
      const kgs = await fetchKnowledgeGraphs(result.id);
      setKnowledgeGraphs(kgs);
    }
    const getVar = async () => {
      const vars = await fetchStudyVariable(result.id, query);
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
    getKgs();
    getVar();
  }, [query, result.id])

  return (
    <div selected={resultsSelected.has(result.id)}>
      <div className="details">
        <div className="result-json">
          <Card title={ `Concept: ${ result.description }`}>
            <div><b>Type:</b> {result.type}</div>
            <div><b>Description:</b> {result.description === '' ? "There is no description for this concept." : result.description}</div>
          </Card>
          <Collapse>
            {
              studyVariables.map(({ collection_id, collection_name, collection_action, variables }) => (
                <Panel key={`${result.name} ${collection_id}`} header={ `Study: ${collection_name}` }>
                  <VariablesList studyId={collection_id.replace(/^TOPMED\.STUDY:/, '')} variables={variables} />
                </Panel>
              ))
            }
            <Panel header="Knowledge Graphs">
              <KnowledgeGraphs graphs={knowledgeGraphs} />
            </Panel>
          </Collapse>
        </div>
      </div>
    </div>
  )
}

SearchResult.propTypes = {
  index: PropTypes.number.isRequired,
  result: PropTypes.object.isRequired,
}