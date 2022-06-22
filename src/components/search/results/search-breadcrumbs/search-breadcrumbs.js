import { useMemo } from "react"
import { Breadcrumb, Menu } from "antd"
import { useHelxSearch } from "../../"
import "./search-breadcrumbs.css"

export const SearchBreadcrumbs = ({}) => {
    const { breadcrumbs, goToBreadcrumb, setSelectedResult, query } = useHelxSearch()

    const searchCrumbs = useMemo(() => (
        // The Breadcrumb component doesn't support custom components, children *have* to be Breadcrumb.Item.
        breadcrumbs.map((crumb, i) => {
            const { parent, children } = crumb
            const isActiveCrumb = parent === query
            let body
            if (isActiveCrumb) body = (
                <span>
                    {parent}
                </span>
            )
            else body = (
                <a role="button" onClick={() => goToBreadcrumb(crumb)}>
                    {parent}
                </a>
            )
            const props = {
                className: `ant-breadcrumb-link ${isActiveCrumb ? "active-crumb" : ""}`,
                key: parent
            }
            if (children.length === 0) return (
                <Breadcrumb.Item {...props}>
                    {body}
                </Breadcrumb.Item>
            )
            return (
                <Breadcrumb.Item
                    overlay={(
                        <Menu
                            items={children.map((crumbResult) => {
                                const hasDuplicates = children.filter((x) => x.name === crumbResult.name).length > 1
                                return {
                                    key: crumbResult.id,
                                    label: (
                                        <a role="button" onClick={() => setSelectedResult(crumbResult, true)}>
                                            {crumbResult.name}{hasDuplicates || true && ` (${crumbResult.type})`}
                                        </a>
                                    )
                                }
                            })}
                        />
                    )}
                    dropdownProps={{
                        placement: "bottomLeft"
                    }}
                    {...props}
                >
                    {body}
                </Breadcrumb.Item>
            )
        })
    ), [breadcrumbs, query])

    if (breadcrumbs.length <= 1) {
        return null
    }
    return (
        <Breadcrumb separator="/" className="search-breadcrumbs" style={{ marginBottom: "16px" }}>
            {searchCrumbs}
        </Breadcrumb>
    )
}