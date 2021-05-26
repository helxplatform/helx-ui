import { Divider, List, Modal, Typography } from 'antd'

const { Paragraph } = Typography

export const SearchResultModal = ({ result, visible, closeHandler }) => {
  if (!result) {
    return null
  }

  console.log(result)

  return (
    <Modal
      title={ result.id }
      visible={ visible }
      onOk={ closeHandler }
      onCancel={ closeHandler }
      width={ 800 }
    >
      <Paragraph>
        { result.description }
      </Paragraph>
      <Divider />
      <List />
    </Modal>
  )
}
