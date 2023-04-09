import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Button, Modal, ModalProps, Result, Space, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { SizeMe } from 'react-sizeme'
import { AvatarUpload } from './avatar-upload'
import { AvatarEditor } from './avatar-editor'
import { UserAvatarIcon } from '../user-avatar-icon'
import { CustomReactAvatarEditor } from './custom-react-avatar-editor'
import './change-avatar-modal.css'

const { Title, Text, Paragraph } = Typography

interface SetOpen {
    (open: boolean): void
}

interface ChangeAvatarModalProps extends ModalProps {
    open: boolean
    setOpen: SetOpen
}

export const ChangeAvatarModal = ({ open, setOpen, ...props }: ChangeAvatarModalProps) => {
    const [image, setImage] = useState<string|null>(null)
    const [croppedImage, setCroppedImage] = useState<string|null>(null)
    const [cameraActive, setCameraActive] = useState<boolean>(false)

    const editorRef = useRef<CustomReactAvatarEditor>()

    const reset = useCallback(() => {
        if (image) URL.revokeObjectURL(image)
        setImage(null)
        if (croppedImage) URL.revokeObjectURL(croppedImage)
        setCroppedImage(null)

        setCameraActive(false)
    }, [])

    const onImageUpload = useCallback(async (image: string) => {
        setImage(image)
    }, [])
    const onOk = useCallback(() => {
        if (croppedImage) {
            console.log("set profile picture")
        }
        else if (image && editorRef.current) {
            const croppedImageCanvas = editorRef.current.getImage()
            croppedImageCanvas.toBlob((data) => {
                if (data === null) data = new Blob([], {
                    type: "image/jpeg"
                })
                const url = URL.createObjectURL(data)
                setCroppedImage(url)
            })
        } else {
            setOpen(false)
        }
    }, [image, croppedImage])

    useEffect(() => {
        if (!open) {
            reset()
        }
    }, [open, reset])

    return (
        <Modal
            title={
                <div>
                    { (image || cameraActive) && (
                        <Button
                            type="text"
                            shape="circle"
                            icon={ <ArrowLeftOutlined /> }
                            onClick={ reset }
                            style={{ marginRight: 8, marginLeft: -8 }}
                        />
                    ) }
                    { croppedImage ? `Confirm` : image ? `Crop and scale` : `Change profile picture` }
                </div>
            }
            centered
            open={ open }
            onCancel={ () => setOpen(false) }
            footer={
                image ? (
                    <Fragment>
                        {/* <Button onClick={ () => setOpen(false) }>Cancel</Button> */}
                        <Button type="primary" onClick={ onOk }>
                            { croppedImage ? `Save` : `Next` }
                        </Button>
                    </Fragment>
                ) : null
            }
            className="change-avatar-modal"
            destroyOnClose
            { ...props }
        >
            { croppedImage ? (
                <Result
                    status="info"
                    title={ <span style={{ fontSize: 22 }}>Confirm profile picture</span> }
                    subTitle="Your profile picture will be visible to others. Please confirm you want to use this picture."
                    icon={ <UserAvatarIcon size={ 128 } src={ croppedImage } style={{ marginBottom: -16 }} /> }
                    style={{ paddingTop: 24, paddingBottom: 24 }}
                />
            ) : image ? (
                <SizeMe>
                    { ({ size }) => (
                        <AvatarEditor
                            imageUrl={ image }
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
                <AvatarUpload
                    cameraActive={ cameraActive }
                    setCameraActive={ setCameraActive }
                    onConfirm={ onImageUpload }
                    style={{ padding: 48 }}
                />
            ) }
        </Modal>
    )
}