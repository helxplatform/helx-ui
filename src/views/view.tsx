import { ComponentType, useEffect } from 'react'

interface ViewProps {
    // Note: a null title is equivalent to an empty string or empty array, it will just display "HeLx UI" as the title.
    title: string | string[] | null
}

/** Notes:
 * An empty string "" or empty array will just use the "Helx UI" component as the title.
 * A null value will not update the title. It disables the hook. This may be useful in components
 *  that wrap views conditionally, e.g. loading view that wraps other views.
 * The "HeLx UI" component is appended to the end of all titles, does not need to be included.
 */
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