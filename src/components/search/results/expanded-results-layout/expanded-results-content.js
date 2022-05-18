import { Button, Card, Empty } from "antd"
import { CloseOutlined } from "@ant-design/icons"
import { ConceptModalBody, useHelxSearch } from "../.."

export const ExpandedResultsContent = ({ closeSelected }) => {
    const { selectedResult } = useHelxSearch()
    if (selectedResult) return (
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
    )
    else return (
        <div className="" style={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Empty description="No result selected" />
        </div>
    )
}