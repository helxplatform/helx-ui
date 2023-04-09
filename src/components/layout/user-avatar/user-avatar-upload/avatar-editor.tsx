import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { Spin, Result, Button } from 'antd'
import ReactAvatarEditor, { Position } from 'react-avatar-editor'
import { CustomReactAvatarEditor } from './custom-react-avatar-editor'
import { SizeMeProps, withSize } from 'react-sizeme'

interface AvatarEditorProps extends React.HTMLProps<HTMLDivElement> {
    imageUrl: string
    canvasSize?: { width: number, height: number }
}


const BORDER_SIZE = 25
const MIN_IMAGE_SIZE = 64

export const AvatarEditor = forwardRef<any, any>(({ imageUrl, canvasSize, style, ...props }: AvatarEditorProps, ref) => {
    // const [url, setUrl] = useState<string|undefined>()
    const [scale, setScale] = useState<number>(1.5)
    const [invalid, setInvalid] = useState<boolean|undefined>(undefined)
    const [vertical, setVertical] = useState<boolean|undefined>(undefined)

    useEffect(() => {
        const imageElement = document.createElement("img")
        imageElement.onload = () => {
            setVertical(imageElement.height > imageElement.width)
            setInvalid(imageElement.width < MIN_IMAGE_SIZE || imageElement.height < MIN_IMAGE_SIZE)
        }
        imageElement.src = imageUrl

        return () => {
            imageElement.onload = null
            setInvalid(undefined)
        }
    }, [imageUrl])

    const [borderWidth, borderHeight] = useMemo(() => (
        [BORDER_SIZE, BORDER_SIZE]
    ), [])
    const loading = useMemo(() => invalid === undefined, [invalid])

    return (
        <Spin spinning={ loading } delay={ 50 }>
            <div
                className="avatar-editor"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    ...(style ?? {})
                }}
                { ...props }
            >
                { invalid ? (
                    <Result
                        status="error"
                        title="Invalid Image"
                        subTitle={ `Please only upload images larger than ${ MIN_IMAGE_SIZE }x${ MIN_IMAGE_SIZE }` }
                    />
                ) : (
                    <CustomReactAvatarEditor
                        image={ imageUrl }
                        scale={ scale }
                        rotate={ 0 }
                        color={[ 0, 0, 0, 0.375 ]}
                        gridColor={[ 191, 191, 191, 1 ]}
                        border={[ borderWidth, borderHeight ]}
                        width={ canvasSize ? canvasSize.width - borderWidth * 2 : undefined }
                        height={ canvasSize ? canvasSize.height - borderHeight * 2 : undefined }
                        minimumCropSize={ MIN_IMAGE_SIZE }
                        updateScale={ setScale }
                        ref={ ref }
                        // gridColor="#d9d9d9"
                        // backgroundColor="rgb(255, 255, 255)"
                        // If canvasSize is specified, let react-avatar-editor handle the css sizing rules.
                        // style={ canvasSize ? {} : { width: "100%", height: "100%" } }
                    />
                ) }
            </div>
        </Spin>
    )
})