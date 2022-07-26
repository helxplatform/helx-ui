import { Typography } from 'antd'
import Highlighter from 'react-highlight-words'
import { AddToCartDropdownButton, AddToCartIconButton } from 'antd-shopping-cart'
import { useShoppingCartUtilities } from '../../../../../hooks'

const { Text } = Typography

export const StudyVariable = ({ study, variable, highlight, ...props }) => {
  const { createVariableCartItem } = useShoppingCartUtilities()
  
  return (
    <div className="study-variables-list-item" {...props}>
      <Text className="variable-name">
      <Highlighter searchWords={ highlight } textToHighlight={ variable.name } /> &nbsp;
        ({ variable.e_link ? <a href={ variable.e_link }>{ variable.id }</a> : variable.id })
      </Text>
      <Text className="variable-description">
        <Highlighter searchWords={ highlight } textToHighlight={ variable.description } />
      </Text>
      <div style={{ marginTop: 4 }}>
        <AddToCartDropdownButton
          item={ createVariableCartItem(variable, study) }
          small
        />
      </div>
    </div>
  )
}