import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Result, Spin } from 'antd'
import Webcam from 'react-webcam'
import { setStatisticContainerStyle } from '@antv/g2plot/lib/utils/statistic'

enum WebcamState {
    REQUESTING_PERMISSION,
    NO_PERMISSION,
    NO_CAMERA,
    AVAILABLE,
    STARTED
}

interface OnUpload {
    (screenshot: string): void
}

interface WebcamUploadProps extends React.HTMLProps<HTMLDivElement> {
    onUpload: OnUpload
}

export const WebcamUpload = ({ onUpload, ...props }: WebcamUploadProps) => {
    const [webcamState, setWebcamState] = useState<WebcamState|null>(null)
    const webcamRef = useRef<Webcam>(null)

    const uploadPhoto = useCallback(() => {
        if (webcamRef.current) {
            const screenshot = webcamRef.current.getScreenshot()
            // `getScreenshot` can return null if the webcam isn't ready, but this can't be called unless the webcam is ready.
            if (screenshot !== null) onUpload(screenshot)
        }
    }, [])

    const requestWebcamPermission = useCallback(async () => {
        setWebcamState(WebcamState.REQUESTING_PERMISSION)
        const requestBrowserPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                (Webcam as any).stopMediaStream(stream)
                setWebcamState(WebcamState.AVAILABLE)
            } catch (e: any) {
                if (e.name === "NotAllowedError") {
                    setWebcamState(WebcamState.NO_PERMISSION)
                }
                else if (e.name === "NotFoundError") {
                    setWebcamState(WebcamState.NO_CAMERA)
                } else {
                    // Just for good measure, if an unexpected exception occurs.
                    setWebcamState(WebcamState.NO_CAMERA)
                }
            }
        }
        const res = await navigator.permissions.query({ name: "camera" as PermissionName })
        res.addEventListener("change", (e) => {
            requestBrowserPermission()
        })
        await requestBrowserPermission()
    }, [])

    useEffect(() => {
        requestWebcamPermission()
    }, [requestWebcamPermission])

    return (
        <Spin spinning={
            webcamState === null ||
            webcamState === WebcamState.REQUESTING_PERMISSION ||
            webcamState === WebcamState.AVAILABLE }>
            <div { ...props }>
                { webcamState === WebcamState.NO_PERMISSION ? (
                    <Result
                        status="warning"
                        title="Allow camera access"
                        subTitle="To take a photo, you need to allow access to your camera"
                    />
                ) : webcamState === WebcamState.NO_CAMERA ? (
                    <Result
                        status="warning"
                        title="No camera detected"
                        subTitle="To take a photo, you need to enable a camera on your system"
                    />
                ) : webcamState === WebcamState.AVAILABLE || webcamState === WebcamState.STARTED ? (
                    <div onClick={ uploadPhoto } style={{
                        display: "flex",
                        flexDirection: "column",
                        cursor: "pointer",
                    }}>
                        <Webcam
                            onUserMedia={ () => {
                                (webcamRef.current as any).video.onplay = () => {
                                    setWebcamState(WebcamState.STARTED)
                                }
                            }}
                            mirrored
                            style={{ flexGrow: 1, width: "100%" }}
                            ref={ webcamRef }
                        />
                        { webcamState === WebcamState.STARTED && (
                            <Alert
                                type="info"
                                message="Click anywhere to take a picture"
                                style={{
                                    marginTop: 0,
                                    borderTop: 0,
                                    borderTopLeftRadius: 0,
                                    borderTopRightRadius: 0,
                                    textAlign: "center"
                                }}
                            />
                        ) }
                    </div>
                ) : null }
            </div>
        </Spin>
    )
}