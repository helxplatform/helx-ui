import { Fragment, useEffect, useState } from 'react'
import { Button, Collapse, Divider, List, Space, Tag, Typography } from 'antd'
import { ShoppingCartOutlined as ShoppingCartIcon } from '@ant-design/icons'
import { AddToCartIconButton, AddToCartDropdownButton } from 'antd-shopping-cart'
import QueueAnim from 'rc-queue-anim'
import { useHelxSearch } from '../../'
import { Link } from '../../../link'
import { useShoppingCartUtilities } from '../../../../hooks'

const { Text, Title } = Typography
const { CheckableTag: CheckableFacet } = Tag
const { Panel } = Collapse

const StudyVariable = ({ variable, study }) => {
  const [hovering, setHovering] = useState(false)
  const [active, setActive] = useState(false)

  const { createVariableCartItem } = useShoppingCartUtilities()

  useEffect(() => {
    let timeout
    if (hovering)  {
      timeout = setTimeout(() => {
        setActive(true)
      }, 300)
    } else setActive(false)

    return () => {
      clearTimeout(timeout)
    }
  }, [hovering])

  return (
    <div className="study-variables-list-item">
      <Space direction="vertical">
        <Text key="variable-name" className="variable-name">
          { variable.name } &nbsp;
          ({ variable.e_link ? <a href={ variable.e_link }>{ variable.id }</a> : variable.id })
        </Text>
        <Text key="variable-description" className="variable-description"> { variable.description }</Text>
      </Space>
      <div key="add-to-cart-dropdown">
        <AddToCartDropdownButton
          item={ createVariableCartItem(variable, study) }
          small
        />
      </div>
    </div>
  )
}

export const StudiesTab = ({ studies }) => {
  const { selectedResult } = useHelxSearch()
  const [facets, setFacets] = useState([])
  const [selectedFacets, setSelectedFacets] = useState([])
  
  const { createStudyCartItem } = useShoppingCartUtilities()

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
                extra={
                  <Space>
                    <Text>{ item.elements.length } variable{ item.elements.length === 1 ? '' : 's' }</Text>
                    <AddToCartIconButton
                      item={ createStudyCartItem(item, selectedResult) }
                      style={{ marginLeft: 8 }}
                    />
                  </Space>
                }
              >
                <Space direction="vertical">
                  <List
                    className="study-variables-list"
                    dataSource={ item.elements }
                    renderItem={ variable => (
                      <StudyVariable variable={ variable } study={ item } />
                    ) }
                  />
                  <Space style={{ marginLeft: 8 }}>
                    <AddToCartDropdownButton
                      item={ createStudyCartItem(item, selectedResult) }
                    />
                    {/* <Button>Add all variables</Button> */}
                  </Space>
                </Space>
              </Panel>
            ))
        }
      </Collapse>
   </Space>
  )
}
