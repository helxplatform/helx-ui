import { useMemo } from "react"
import { Breadcrumb, Menu } from "antd"
import { useHelxSearch } from "../../"

export const SearchBreadcrumbs = ({}) => {
    const { breadcrumbs, goToBreadcrumb, setSelectedResult } = useHelxSearch()

    const searchCrumbs = useMemo(() => (
        // The Breadcrumb component doesn't support custom components, children *have* to be Breadcrumb.Item.
        breadcrumbs.map((crumb, i) => {
            const { parent, children } = crumb
            const isLastCrumb = i === breadcrumbs.length - 1
            if (children.length === 0) {
                if (isLastCrumb) return (
                    <Breadcrumb.Item>
                        <span>
                            {parent}
                        </span>
                    </Breadcrumb.Item>
                )
                else return (
                    <Breadcrumb.Item>
                        <a role="button" onClick={() => null}>
                            {parent}
                        </a>
                    </Breadcrumb.Item>
                )
            }
            return (
                <Breadcrumb.Item
                    overlay={(
                        <Menu
                            items={children.map((crumbResult) => {
                                const hasDuplicates = children.filter((x) => x.name === crumbResult.name).length > 1
                                return {
                                    key: crumbResult.id,
                                    label: (
                                        <a role="button" onClick={() => setSelectedResult(crumbResult)}>
                                            {crumbResult.name}{hasDuplicates && ` (${crumbResult.type})`}
                                        </a>
                                    )
                                }
                            })}
                        />
                    )}
                    dropdownProps={{
                        placement: "bottomLeft"
                    }}
                >
                    {parent}
                </Breadcrumb.Item>
            )
        })
    ), [breadcrumbs])

    if (breadcrumbs.length < 1) {
        return null
    }
    return (
        <Breadcrumb separator=">" style={{ marginBottom: "16px" }}>
            {searchCrumbs}
        </Breadcrumb>
    )
}