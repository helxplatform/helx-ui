import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactAvatarEditor, { Position } from 'react-avatar-editor'
import { CustomReactAvatarEditor } from './custom-react-avatar-editor'
import { SizeMeProps, withSize } from 'react-sizeme'

interface AvatarEditorProps extends React.HTMLProps<HTMLDivElement> {
    image: Blob
    canvasSize?: { width: number, height: number }
}


const BORDER_SIZE = 50

export const AvatarEditor = ({ image, canvasSize, style, ...props }: AvatarEditorProps) => {
    const [url, setUrl] = useState<string|undefined>()
    const [imageDimensions, setImageDimensions] = useState<[number, number] | undefined>()

    useEffect(() => {
        const url = URL.createObjectURL(image)
        setUrl(url)

        const imageElement = new Image()
        imageElement.onload = () => {
            setImageDimensions([ imageElement.width, imageElement.height ])
        }
        imageElement.src = url

        return () => {
            URL.revokeObjectURL(url)
            imageElement.onload = null

            setUrl(undefined)
            setImageDimensions(undefined)
        }
    }, [image])

    const loading = useMemo(() => url === undefined || imageDimensions === undefined, [url, imageDimensions])
    const [borderWidth, borderHeight] = useMemo(() => {
        return [BORDER_SIZE, BORDER_SIZE]
        // if (!imageDimensions) return [0, 0]
        // if (imageDimensions.width > imageDimensions.height) return [BORDER_SIZE, 0]
        // else return [0, BORDER_SIZE]
    }, [imageDimensions])

    return (
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
            <CustomReactAvatarEditor
                image={ url! }
                scale={ 1.25 }
                rotate={ 0 }
                color={[ 0, 0, 0, 0.375 ]}
                gridColor={[ 191, 191, 191, 1 ]}
                border={[ borderWidth, borderHeight ]}
                width={ canvasSize ? canvasSize.width - borderWidth * 2 : undefined }
                height={ canvasSize ? canvasSize.height - borderHeight * 2 : undefined }
                // gridColor="#d9d9d9"
                backgroundColor="rgba(0, 0, 0, 0)"
                // If canvasSize is specified, let react-avatar-editor handle the css sizing rules.
                // style={ canvasSize ? {} : { width: "100%", height: "100%" } }
            />
        </div>
    )
}