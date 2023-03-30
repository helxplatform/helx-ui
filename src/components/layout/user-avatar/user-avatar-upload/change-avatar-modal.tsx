import { Fragment, useCallback, useEffect, useState } from 'react'
import { Button, Modal, ModalProps, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { AvatarUpload } from './avatar-upload'
import { AvatarEditor } from './avatar-editor'
import './change-avatar-modal.css'

const { Text, Paragraph } = Typography

interface SetOpen {
    (open: boolean): void
}

interface ChangeAvatarModalProps extends ModalProps {
    open: boolean
    setOpen: SetOpen
}

export const ChangeAvatarModal = ({ open, setOpen, ...props }: ChangeAvatarModalProps) => {
    const [image, setImage] = useState<Blob|null>(null)

    const onImageUpload = useCallback((image: Blob) => {
        setImage(image)
    }, [])

    useEffect(() => {
        if (!open) {
            setImage(null)
        }
    }, [open])

    return (
        <Modal
            title={
                <div>
                    { image && (
                        <Button
                            type="text"
                            shape="circle"
                            icon={ <ArrowLeftOutlined /> }
                            onClick={ () => setImage(null) }
                            style={{ marginRight: 8, marginLeft: -8 }}
                        />
                    ) }
                    Change profile picture
                </div>
            }
            centered
            open={ open }
            onCancel={ () => setOpen(false) }
            footer={
                <Fragment>
                    <Button onClick={ () => setOpen(false) }>Cancel</Button>
                    <Button type="primary" onClick={ () => setOpen(false) }>OK</Button>
                </Fragment>
            }
            className="change-avatar-modal"
            { ...props }
        >
            { image ? (
                <AvatarEditor image={ image } style={{ margin: -16 }} />
            ) : (
                <AvatarUpload onConfirm={ onImageUpload } style={{ padding: 48 }} />
            ) }
        </Modal>
    )
}