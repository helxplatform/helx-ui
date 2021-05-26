import PropTypes from 'prop-types'
import { List } from 'antd'
import { Link } from '../link'

export const VariablesList = ({ studyId, variables }) => {
  return (
    <List
      header="Variables"
      dataSource={variables}
      renderItem={variable => (
        <List.Item key={variable.id}>
          <Link to={'variable.e_link'}>{'variable.id'}: {'variable.id'}</Link>
        </List.Item>
      )}
    />
  )
}

VariablesList.propTypes = {
  studyId: PropTypes.string.isRequired,
  variables: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    e_link: PropTypes.string.isRequired,
  })).isRequired,
}
