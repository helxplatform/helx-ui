import { useCallback, useEffect, useMemo, useState } from 'react'
import { Divider, Empty, Space, Typography } from 'antd'
import _InfiniteScroll from 'react-infinite-scroll-component'
import { StudyListItem } from './study-list-item'
import { VariableListItem } from './variable-list-item'
import { VariableFilterMenuButton } from '../variable-filter-menu'
import { useVariableView } from '../variable-view-context'
import { StudyDataSourcesList } from '../study-data-source-list'
import { BackTop } from '../../../../layout'

const InfiniteScroll = _InfiniteScroll as any
const { Text } = Typography

// Loads this many more variables when reaching the bottom of infinite scroll
const ITEMS_PER_PAGE = 20

export const VariableList = () => {
    const { filteredVariables, variablesSource, filteredStudies, studiesSource, collapseIntoVariables, isFiltered } = useVariableView()!
    
    const [currentPage, setCurrentPage] = useState<number>(1)

    const totalPages = useMemo(() => {
        const items = collapseIntoVariables ? filteredVariables : filteredStudies
        return Math.ceil(items.length / ITEMS_PER_PAGE)
    }, [filteredVariables, filteredStudies, collapseIntoVariables])

    const hasMore = useMemo(() => currentPage < totalPages, [currentPage, totalPages])

    const renderedVariables = useMemo(() => {
        return filteredVariables.slice(0, currentPage * ITEMS_PER_PAGE)
    }, [filteredVariables, currentPage])

    const renderedStudies = useMemo(() => {
        return filteredStudies.slice(0, currentPage * ITEMS_PER_PAGE)
    }, [filteredStudies, currentPage])

    const getNextPage = useCallback(() => {
        setCurrentPage((page) => page + 1)
    }, [])

    useEffect(() => {
        if (collapseIntoVariables) setCurrentPage(1)
    }, [filteredVariables, collapseIntoVariables])

    useEffect(() => {
        if (!collapseIntoVariables) setCurrentPage(1)
    }, [filteredStudies, collapseIntoVariables])
    

    return (
        <div className="variable-list">
            <Divider orientation="left" orientationMargin={ 0 } style={{
                fontSize: 15,
                marginTop: 24,
                marginBottom: 0
            }}>
                { collapseIntoVariables ? "Variables" : "Studies" }
            </Divider>
            { isFiltered && (
                <div style={{ marginTop: 6, marginBottom: -4 }}>
                    <Text type="secondary" style={{ fontSize: 14, fontStyle: "italic" }}>
                        {
                            collapseIntoVariables
                                ? `Showing ${ filteredVariables.length } of ${ variablesSource.length } variables`
                                : `Showing ${ filteredStudies.length } of ${ studiesSource.length } studies`
                        }
                    </Text>
                </div>
            ) }
            <div style={{ display: "flex", marginTop: 8, gap: 8 }}>
                <StudyDataSourcesList />
                <VariableFilterMenuButton />
            </div>
            <InfiniteScroll
                dataLength={ renderedVariables.length }
                next={ getNextPage }
                hasMore={ hasMore }
            >
                <Space direction="vertical" className="variables-collapse" style={{ marginTop: 8 }}>
                    { collapseIntoVariables ? renderedVariables.map((variable, i) => (
                        <VariableListItem key={ variable.id } variable={ variable } style={ i === 0 ? { marginTop: 4 } : {} } />
                    )) : renderedStudies.map((study) => (
                        <StudyListItem key={ study.c_id } study={ study } />
                    )) }
                    { (collapseIntoVariables ? renderedVariables.length === 0 : renderedStudies.length === 0) && (
                        <Empty description={
                            <Text type="secondary">No results were found matching your filters.</Text>
                        } />
                    ) }
                </Space>
            </InfiniteScroll>
            <BackTop />
        </div>
    )
}