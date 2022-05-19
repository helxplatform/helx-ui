import { Fragment } from 'react'
import { Grid, Space, Spin, Typography } from 'antd'
import { ArrowRightOutlined, LeftOutlined, RightOutlined, MenuOutlined } from '@ant-design/icons'
import { ResultsHeader } from '..'
import { ConceptCard, PaginationTray, SearchForm, useHelxSearch } from "../.."
import classNames from 'classnames'
import "./expanded-results-sidebar.css"


const { Title, Link } = Typography
const { useBreakpoint } = Grid 

export const ExpandedResultsSidebar = ({ expanded, setExpanded }) => {
    const {
        concepts, selectedResult, setSelectedResult,
        pageCount, isLoadingConcepts, setLayout
    } = useHelxSearch()
    const { md } = useBreakpoint()

    return (
        <Space
            direction="vertical"
            className={classNames("results results-sidebar", expanded ? "expanded" : "minimized", !md && "mobile")}
        >
            <div className="results-upper-side-container">
                <Link className="collapse-results" type="secondary" onClick={ () => setExpanded(!expanded) }>
                    {
                        expanded ? (
                            <LeftOutlined style={{ fontSize: "16px" }} />
                            ) : (
                            <MenuOutlined style={{ fontSize: "16px" }}/>
                        )
                    }
                </Link>
                <div className="results-list-container">
                    <Spin spinning={isLoadingConcepts}>
                        <div className="results-list grid" style={{ whiteSpace: "normal", maxWidth: md ? "500px" : undefined }}>
                            {
                                concepts.map((result, i) => (
                                    <ConceptCard
                                        key={result.id}
                                        className={classNames("expanded-result-option-concept-card", result.id === selectedResult?.id && "selected")}
                                        result={result}
                                        icon={result.id === selectedResult?.id ? null : ArrowRightOutlined}
                                        openModalHandler={ () => setSelectedResult(result) }
                                    />
                                ))
                            }
                        </div>
                    </Spin>
                </div>
            </div>
            { expanded && pageCount > 1 && <div style={{ marginTop: "8px" }}><PaginationTray showTotal={false} /></div> }
        </Space>
    )
}