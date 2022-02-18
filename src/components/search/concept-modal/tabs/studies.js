import { useEffect, useState } from 'react'
import { Collapse, List, Space, Tag, Typography } from 'antd'
import { Link } from '../../../link'

const { Text, Title } = Typography
const { CheckableTag: CheckableFacet } = Tag
const { Panel } = Collapse

export const StudiesTab = ({ studies }) => {
  const [facets, setFacets] = useState([])
  const [selectedFacets, setSelectedFacets] = useState([])

  const handleSelectFacet = (facet, checked) => {
    const newSelection = new Set(selectedFacets)
    if (newSelection.has(facet)) {
      newSelection.delete(facet)
    } else {
      newSelection.add(facet)
    }
    setSelectedFacets([...newSelection])
  }

  useEffect(() => {
    setFacets(Object.keys(studies))
    setSelectedFacets(Object.keys(studies))
  }, [studies])

  return (
    <Space direction="vertical">
      <Title level={ 4 }>Studies</Title>
      <Space direction="horizontal" size="small">
        {
          facets.map(facet => studies[facet] && (
            <CheckableFacet
              key={ `search-facet-${ facet }` }
              checked={ selectedFacets.includes(facet) }
              onChange={ checked => handleSelectFacet(facet, checked) }
              children={ `${ facet } (${studies[facet].length})` }
            />
          ))
        }
      </Space>
      <Collapse ghost className="variables-collapse">
        {
          Object.keys(studies)
            .filter(facet => selectedFacets.includes(facet))
            .reduce((arr, facet) => [...arr, ...studies[facet]], [])
            .sort((s, t) => s.c_name < t.c_name ? -1 : 1)
            .map(item => (
              <Panel
                key={ `panel_${ item.c_name }` }
                header={
                  <Text>
                    { item.c_name }{ ` ` }
                    (<Link to={ item.c_link }>{ item.c_id }</Link>)
                  </Text>
                }
                extra={ <Text>{ item.elements.length } variable{ item.elements.length === 1 ? '' : 's' }</Text> }
              >
                <List
                  className="study-variables-list"
                  dataSource={ item.elements }
                  renderItem={ variable => (
                    <div className="study-variables-list-item">
                      <Text className="variable-name">
                        { variable.name } &nbsp;
                        ({ variable.e_link ? <a href={ variable.e_link }>{ variable.id }</a> : variable.id })
                      </Text><br />
                      <Text className="variable-description"> { variable.description }</Text>
                    </div>
                  ) }
                />
              </Panel>
            ))
        }
      </Collapse>
   </Space>
  )
}
