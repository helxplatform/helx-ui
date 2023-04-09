import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Divider, Empty, Space, Typography, message, Spin, Result, Alert } from 'antd'
import { FileImageOutlined, UploadOutlined, CameraOutlined } from '@ant-design/icons'
import Dropzone, { FileRejection } from 'react-dropzone'
import Webcam from 'react-webcam'
import { SizeMe } from 'react-sizeme'
import './avatar-upload.css'
import { WebcamUpload } from './webcam-upload'

const { Text, Paragraph } = Typography


const MAX_UPLOAD_SIZE_BYTES = 8E6 // 8 MB

interface SetCameraActive {
    (active: boolean): void
}

interface OnConfirm {
    (image: any): void
}

interface AvatarUploadProps extends React.HTMLProps<HTMLElement> {
    cameraActive: boolean
    setCameraActive: SetCameraActive
    onConfirm: OnConfirm
}

export const AvatarUpload = ({ onConfirm, cameraActive: cameraActive, setCameraActive, style={}, ...props }: AvatarUploadProps) => {
    const [uploading, setUploading] = useState<boolean>(false)
    
    const webcamRef = useRef<Webcam>(null)
    const isMounted = useRef<boolean>(false)
    
    const onDrop = useCallback(async ([ file ]: File[]) => {
        setUploading(true)
        const data = await file.arrayBuffer()
        const blob = new Blob([data], {
            type: file.type
        })
        const url = URL.createObjectURL(blob)

        setUploading(false)
        isMounted.current && onConfirm(url)
    }, [])

    const onWebcamUpload = useCallback(async (url: string) => {
        onConfirm(url)
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

    useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
        }
    }, [])

    if (cameraActive) return (
        <SizeMe>
            { ({ size }) => (
                <WebcamUpload
                    onUpload={ onWebcamUpload }
                    style={ size ? {
                        width: size.width ?? undefined,
                        height: size.height ?? undefined
                    } : {} }
                />
            ) }
        </SizeMe>
    )
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
                                            <Button
                                                type="ghost"
                                                icon={ <CameraOutlined /> }
                                                onClick={ () => setCameraActive(true) }
                                            >
                                                Take a picture
                                            </Button>
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