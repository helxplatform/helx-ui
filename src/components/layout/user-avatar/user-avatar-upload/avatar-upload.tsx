import { Fragment, useCallback, useState } from 'react'
import { Button, Divider, Empty, Space, Typography, message, Spin } from 'antd'
import { FileImageOutlined, UploadOutlined, CameraOutlined } from '@ant-design/icons'
import Dropzone, { FileRejection } from 'react-dropzone'
import './avatar-upload.css'

const { Text, Paragraph } = Typography


const MAX_UPLOAD_SIZE_BYTES = 8E6 // 8 MB

interface OnConfirm {
    (image: any): void
}

interface AvatarUploadProps extends React.HTMLProps<HTMLElement> {
    onConfirm: OnConfirm
}

export const AvatarUpload = ({ onConfirm, style={}, ...props }: AvatarUploadProps) => {
    const [uploading, setUploading] = useState<boolean>(false)

    const onDrop = useCallback(async ([ file ]: File[]) => {
        setUploading(true)
        const data = await file.arrayBuffer()
        const blob = new Blob([data], {
            type: file.type
        })

        setUploading(false)
        onConfirm(blob)
    }, [])
    const onDropRejected = useCallback(async ([ fileRejection ]: FileRejection[]) => {
        fileRejection.errors.forEach((error) => {
            let msg;
            switch (error.code) {
                case "file-invalid-type":
                    msg = "Please only upload PNG/JPEG images"
                    break
                case "file-too-large":
                    msg = `Please upload an image smaller than ${ MAX_UPLOAD_SIZE_BYTES / 1E6 } MB`
                    break
                case "too-many-files":
                    msg = "Please only upload a single picture"
                    break
                default:
                    msg = error.message
                    break
            }
            message.error(msg)
        })
    }, [])

    return (
        <Dropzone
            accept={{ "image/png": ["png"], "image/jpeg": ["jpg", "jpeg"] }}
            multiple={ false }
            onDropAccepted={ onDrop }
            onDropRejected={ onDropRejected }
            maxSize={ MAX_UPLOAD_SIZE_BYTES }
        >
            {({ getRootProps, getInputProps, isDragActive }) => (
                <section
                    { ...getRootProps() }
                    className="avatar-upload"
                    style={{
                        position: "relative",
                        borderRadius: 6,
                        ...(isDragActive ? {
                            outline: "2px solid #1890ff"
                        } : {}),
                        ...style
                    }}
                    onClick={ (e) => {} }
                    { ...props }
                >
                    <input { ...getInputProps() } />
                    <Spin delay={ 50 } spinning={ uploading }>
                        <Empty
                            image={
                                <FileImageOutlined style={{ fontSize: 80, color: "rgba(0, 0, 0, 0.15)" }} />
                            }
                            description={
                                <Fragment>
                                    <div style={{ marginTop: 0 }}>
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                        <Paragraph style={{ fontSize: 20, color: "rgba(0, 0, 0, 0.85)", marginBottom: 0 }}>Drag a picture here</Paragraph>
                                        {/* <Paragraph>or</Paragraph> */}
                                        <Divider plain style={{ margin: "12px 0 16px 0" }}>or</Divider>
                                        </div>
                                        <Space style={{ justifyContent: "center" }}>
                                            <Button
                                                type="ghost"
                                                icon={ <UploadOutlined /> }
                                                onClick={ getRootProps().onClick }
                                            >
                                                Select from computer
                                                </Button>
                                            <Button type="ghost" icon={ <CameraOutlined /> }>Take a picture</Button>
                                        </Space>
                                        <div style={{
                                            opacity: isDragActive ? 1 : 0,
                                            position: "absolute",
                                            width: "100%",
                                            height: "100%",
                                            top: 0,
                                            left: 0,
                                            background: "#1890ff08",
                                            pointerEvents: "none"
                                        }} />
                                    </div>
                                </Fragment>
                            }
                        />
                    </Spin>
                </section>
            )}
        </Dropzone>
    )
}