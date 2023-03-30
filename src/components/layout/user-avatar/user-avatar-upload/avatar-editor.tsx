import { useEffect, useRef, useState } from 'react'
import ReactAvatarEditor, { Position } from 'react-avatar-editor'

interface AvatarEditorProps extends React.HTMLProps<HTMLDivElement> {
    image: Blob
}

export const AvatarEditor = ({ image, style={}, ...props }: AvatarEditorProps) => {
    const [url, setUrl] = useState<string|undefined>()
    const [position, setPosition] = useState<Position|undefined>({ x: 0.5, y: 0.5 })
    const [borderRadius, setBorderRadius] = useState<number|undefined>()
    const editor = useRef<ReactAvatarEditor>(null)

    useEffect(() => {
        const url = URL.createObjectURL(image)
        setUrl(url)

        return () => {
            URL.revokeObjectURL(url)
        }
    }, [image])

    useEffect(() => {
        if (editor) {
            console.log(position)
            console.log(editor)
        }
    }, [position])

    return (
        <div className="avatar-editor" style={{ ...style }} { ...props }>
            <ReactAvatarEditor
                image={ url! }
                position={ position }
                // showGrid={ true }
                borderRadius={ borderRadius }
                scale={ 1.5 }
                width={ 200 }
                height={ 200 }
                rotate={ 0 }
                backgroundColor="rgba(0, 0, 0, 0)"
                onPositionChange={ setPosition }
                // style={{ width: "100%", height: "100%" }}
                ref={ editor }
            />
        </div>
    )
}