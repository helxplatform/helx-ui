import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Button, Modal, ModalProps, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { SizeMe } from 'react-sizeme'
import { AvatarUpload } from './avatar-upload'
import { AvatarEditor } from './avatar-editor'
import { CustomReactAvatarEditor } from './custom-react-avatar-editor'
import './change-avatar-modal.css'

const { Text, Paragraph } = Typography

interface CroppedImage {
    data: Blob
    url: string
}

interface SetOpen {
    (open: boolean): void
}

interface ChangeAvatarModalProps extends ModalProps {
    open: boolean
    setOpen: SetOpen
}

export const ChangeAvatarModal = ({ open, setOpen, ...props }: ChangeAvatarModalProps) => {
    const [image, setImage] = useState<Blob|null>(null)
    const [croppedImage, setCroppedImage] = useState<CroppedImage|null>(null)

    const editorRef = useRef<CustomReactAvatarEditor>()

    const onImageUpload = useCallback(async (image: Blob) => {
        setImage(image)
    }, [])
    const onOk = useCallback(() => {
        if (image && editorRef.current) {
            const croppedImageCanvas = editorRef.current.getImage()
            croppedImageCanvas.toBlob((data) => {
                if (data === null) data = new Blob([], {
                    type: "image/jpeg"
                })
                const url = URL.createObjectURL(data)
                setCroppedImage({
                    data,
                    url
                })
            })
        }
    }, [image])

    useEffect(() => {
        if (!open) {
            setImage(null)
            if (croppedImage) URL.revokeObjectURL(croppedImage.url)
            setCroppedImage(null)
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
                    { image ? `Crop and scale` : `Change profile picture` }
                </div>
            }
            centered
            open={ open }
            onCancel={ () => setOpen(false) }
            footer={
                <Fragment>
                    <Button onClick={ () => setOpen(false) }>Cancel</Button>
                    <Button type="primary" onClick={ onOk }>OK</Button>
                </Fragment>
            }
            className="change-avatar-modal"
            { ...props }
        >
            { croppedImage ? (
                <div />
            ) : image ? (
                <SizeMe>
                    { ({ size }) => (
                        <AvatarEditor
                            image={ image }
                            canvasSize={ size ? {
                                /**
                                 * We can confidently use react-sizeme to provide canvas dimensions since the modal has a consistent width/max-width.
                                 * Even if it did overshoot (which it won't), it would only cause some visible overflow.
                                 */
                                width: size.width!,
                                height: size.width!
                            } : undefined }
                            style={{ margin: -16 }}
                            ref={ editorRef }
                        />
                    ) }
                </SizeMe>
            ) : (
                <AvatarUpload onConfirm={ onImageUpload } style={{ padding: 48 }} />
            ) }
        </Modal>
    )
}