import { ComponentType, Fragment, useEffect, useMemo, useState } from 'react'
import { useEnvironment, useWorkspacesAPI } from '../contexts'
import { Layout } from '../components/layout'
import { Spin } from 'antd'

interface ViewProps {
    // Note: a null title is equivalent to an empty string or empty array, it will just display "HeLx UI" as the title.
    title: string | string[] | null
    wrapper?: boolean
}

/** Notes:
 * An empty string "" or empty array will just use the "Helx UI" component as the title.
 * A null value will not update the title. It disables the hook. This may be useful in components
 *  that wrap views conditionally, e.g. loading view that wraps other views.
 * The "HeLx UI" component is appended to the end of all titles, does not need to be included.
 */
export const useTitle = (title: string | string[] | null) => {
    const { context } = useEnvironment() as any
    if (title === "") title = []
    const titleSegments = Array.isArray(title) ? title : [title]
    const websiteTitle = useMemo<string>(() => {
        return context?.meta.title ?? "HeLx UI"
    }, [context])
    useEffect(() => {
        if (title !== null) document.title = [...titleSegments, websiteTitle].join(" · ")
    }, [titleSegments, websiteTitle])
}

export function withView<T extends object>(
    View: ComponentType<T>,
    { title="", wrapper=false }: ViewProps
) {
    const Component = (props: T) => {
        const [_title, setTitle] = useState<string | string[] | null>(title)
        useTitle(_title)
        
        const workspacesContext = useWorkspacesAPI()
        const environmentContext = useEnvironment()
        
        const Wrapper = useMemo(() => wrapper ? Fragment : Layout, [wrapper])
        const child = useMemo(() => <Wrapper><View { ...props } setTitle={ setTitle } /></Wrapper>, [props, Wrapper])
        
        /** Since these are global contexts, we can make sure they're always defined in views
         * (i.e. not their initial, undefined value) by waiting to render views until they are setup.
         */
        if (workspacesContext === undefined || environmentContext === undefined) return null
        return child
    }
    // Mark the Component as a "View" component. This is used to confirm that every route in the router is a view.
    Component.__isRouterView = true
    return Component
}