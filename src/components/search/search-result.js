import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useHelxSearch } from './search-context';
import { useEnvironment } from '../../contexts';
import styled, { css } from 'styled-components'
import ReactJson from 'react-json-view'
import { Icon } from '../icon'
import { Button } from '../button'
import { Card } from '../card';
import { useNotifications } from '../notifications'
import { Paragraph } from '../typography';
import { KnowledgeGraphs } from './knowledge-graph';
import { Collapser } from '../collapser';
import { dbGapLink } from '../../utils/dbgap-links';
import { ExternalLink } from '../external-link';
import { VariablesList } from './study-variables-list';

const Wrapper = styled.article(({ theme, selected }) => css`
  margin: 1rem 0;
  display: flex;
  align-items: flex-start;
  & input[type=checkbox]{
    margin-top: 2px;
    transform: scale(1.5);
  }
  & .index {
    padding: 0 1rem;
    min-width: 3rem;
    display: flex;
    justify-content: flex-end;
    color: ${selected ? theme.color.success : 'inherit'};
    transition: color 250ms;
  }
  & .details {
    flex: 1;
  }
  & .result-heading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    @media (min-width: 400px) {
      justify-content: space-between;
      flex-direction: row;
    }
  }
  & .result-json {
    position: relative;
    overflow: hidden;
    & ${ResultSelector} {
      transform: translateY(calc(-100% + ${theme.spacing.sm}));
      background-color: ${selected ? theme.color.success : theme.color.grey.dark};
    }
    &:hover ${ResultSelector} {
      transform: translateY(0);
    }
  }
  & .react-json-view {
    padding: 1rem;
  }
  animation: ${theme.animation.fadeIn};
`)

const collapserStyles = {
  titleStyle: {
    backgroundColor: '#eee',
    borderWidth: '1px 0',
    borderStyle: 'solid',
    borderColor: 'var(--color-lightgrey)',
  },
  bodyStyle: {
    backgroundColor: '#ddd',
  }
}

const CollapserHeader = styled.div`
    display: flex;
    flex-direction: column;
    @media (min-width: 920px) {
        flex-direction: row;
    }
    justify-content: space-between;
    padding: 0.5rem 1rem;
`

const StudyName = styled.div``
const StudyAccession = styled.div``

const ResultSelector = styled(Button).attrs({ shadow: false })(({ theme, selected }) => `
  position: absolute;
  top: 0;
  right: 0;
  padding: ${theme.spacing.sm};
  border-bottom-right-radius: 0;
  border-top-left-radius: 0;
  transition: transform 250ms, filter 250ms;
`)

const ResultBodyText = styled.p`
  font-size: 1rem;
`

export const Result = ({ index, result }) => {
  const { query, fetchKnowledgeGraphs, fetchStudyVariable, resultsSelected, selectedView, setSelectedView, doSelect } = useHelxSearch();
  const { addNotification } = useNotifications()
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
        if(!acc[key]){
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
        if(!isFind){
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
      console.log(tem_result)
      setStudyVariables(tem_result);
    }
    getKgs();
    getVar();
  }, [])
  const handleSelectResult = result => event => {
    const notificationText = resultsSelected.has(result.id) ? `Unselected "${result.name}" (${result.id})` : `Selected "${result.name}" (${result.id})`
    addNotification({ text: notificationText, type: 'info' })
    doSelect(result)
  }

  return (
    <Wrapper selected={resultsSelected.has(result.id)}>
      <div className="details">
        <div className="result-json">
          <Card>
            <Card.Header><b>Concept: </b><a style={{ color: 'black' }} href={result.concept_action} target="_blank">{result.name}</a></Card.Header>
            <Card.Body>
              <ResultBodyText><b>Type:</b> {result.type}</ResultBodyText>
              <ResultBodyText><b>Description:</b> {result.description === '' ? "There is no description for this concept." : result.description}</ResultBodyText>
            </Card.Body>
            {/* <ResultSelector onClick={() => doSelect(result)}>
            <Icon icon={resultsSelected.has(result.id) ? 'check' : 'add'} fill="#eee" />
          </ResultSelector> */}
          </Card>
          {studyVariables.map(({ collection_id, collection_name, collection_link, variables }) => (
              <Collapser key={`${result.name} ${collection_id}`} ariaId={'studies'} {...collapserStyles}
                title={
                  <CollapserHeader>
                    <StudyName>
                      <strong>Study</strong>:
                                    <ExternalLink to={collection_link} >{collection_name}</ExternalLink>
                    </StudyName>
                    <StudyAccession>
                      <strong>Accession</strong>:
                                    <ExternalLink to={collection_link} >{collection_id.replace(/^TOPMED\.STUDY:/, '')}</ExternalLink>
                    </StudyAccession>
                  </CollapserHeader>
                }
              >
                <VariablesList studyId={collection_id.replace(/^TOPMED\.STUDY:/, '')} variables={variables} />
              </Collapser>
            ))
          }
          {knowledgeGraphs.length > 0 && (
            <Collapser key={`${result.name} kg`} ariaId={`${result.name} kg`} {...collapserStyles} title={<CollapserHeader>Knowledge Graph</CollapserHeader>}>
              <KnowledgeGraphs graphs={knowledgeGraphs} />
            </Collapser>
          )}
        </div>
      </div>
    </Wrapper>
  )
}

Result.propTypes = {
  index: PropTypes.number.isRequired,
  result: PropTypes.object.isRequired,
}
