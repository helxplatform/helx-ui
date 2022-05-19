import { Fragment } from "react"
import { Button, Card, Empty, Grid } from "antd"
import { CloseOutlined } from "@ant-design/icons"
import { ConceptModalBody, useHelxSearch } from "../.."

const { useBreakpoint } = Grid

export const ExpandedResultsContent = ({ expanded, closeSelected }) => {
    const { selectedResult } = useHelxSearch()
    const { md } = useBreakpoint()

    const MobileWrapper = ({ children }) => !md && expanded ? (
        <div style={{ display: "none", overflow: "hidden" }}>
            {children}
        </div>
    ) : (
        <Fragment>{children}</Fragment>
    )
    if (selectedResult) return (
        <MobileWrapper>
            <Card
                className="expanded-result-container"
                title={ `${ selectedResult.name } (${ selectedResult.type })` }
                extra={[
                    // <Button icon={ <CompressOutlined /> } type="text" style={{ marginRight: "12px" }} />,
                    <Button icon={ <CloseOutlined /> } type="text" onClick={ closeSelected } />
                ]}
            >
                <ConceptModalBody result={ selectedResult } />
            </Card>
        </MobileWrapper>
    )
    else return (
        <MobileWrapper>
            <div className="" style={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Empty description="No result selected" />
            </div>
        </MobileWrapper>
    )
}