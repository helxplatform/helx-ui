import { Fragment } from "react"
import { Button, Card, Empty, Grid, Space, Typography } from "antd"
import { CloseOutlined, LeftOutlined, RightOutlined, ArrowLeftOutlined } from "@ant-design/icons"
import { ConceptModalBody, ConceptModalTitle, useHelxSearch } from "../../"

const { useBreakpoint } = Grid
const { Text } = Typography

const MobileWrapper = ({ expanded, children }) => {
    const { md } = useBreakpoint()

    if (!md && expanded) return (
        <div style={{ display: "none", overflow: "hidden" }}>
            {children}
        </div>
    )
    else return <Fragment>{children}</Fragment>
}

export const ExpandedResultsContent = ({ expanded, closeSelected }) => {
    const { selectedResult } = useHelxSearch()

    if (selectedResult) return (
        <MobileWrapper expanded={expanded}>
            <Card
                className="expanded-result-container"
                title={ <ConceptModalTitle result={ selectedResult } /> }
                extra={[
                    // <Button icon={ <CompressOutlined /> } type="text" style={{ marginRight: "12px" }} />,
                    <Button icon={ <CloseOutlined /> } type="text" onClick={ closeSelected } />
                ]}
                // Disabled for now, may be useful some time in the future to have this sort of functionality.
                actions={false && [
                    <Fragment>
                        <Button style={{ float: "left", marginLeft: "16px" }}><LeftOutlined /> Prev</Button>
                        <Button style={{ float: "right", marginRight: "16px" }}>Next <RightOutlined /></Button>
                    </Fragment>
                ]}
                style={{ display: "flex", flexDirection: "column", border: "1px solid rgba(0, 0, 0, 0.1)" }}
                bodyStyle={{ flexGrow: 1 }}
            >
                <ConceptModalBody result={ selectedResult } />
            </Card>
        </MobileWrapper>
    )
    else return (
        <MobileWrapper expanded={expanded}>
            <div className="" style={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Empty description="Please select a concept from the drawer to view it in detail." />
            </div>
        </MobileWrapper>
    )
}