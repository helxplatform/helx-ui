import { ComponentType, useEffect } from 'react'

interface ViewProps {
    // Note: a null title is equivalent to an empty string or empty array, it will just display "HeLx UI" as the title.
    title: string | string[] | null
}

export const useTitle = (title: string | string[] | null) => {
    if (title === "") title = []
    const titleSegments = Array.isArray(title) ? title : [title]
    useEffect(() => {
        if (title !== null) document.title = [...titleSegments, "HeLx UI"].join(" · ")
    }, [titleSegments])
}

// export function withView<T extends object>(
//     View: ComponentType<T>,
//     { title }: ViewProps
// ) {
//     return (props: T) => {
//         useTitle(title)
//         return <View { ...props } />
//     }
// }