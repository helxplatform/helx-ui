import React, { Fragment, useMemo, useCallback } from 'react'
import { Spin, Grid as AntGrid, Typography, Radio, Tooltip, Empty } from 'antd'
import { ConceptCard, useHelxSearch, SearchLayout, ExpandedResultsLayout } from '../../'
import InfiniteScroll from 'react-infinite-scroll-component'
import { BackTop } from '../../../layout'
import { ResultsHeader } from '../'

const { Text } = Typography
const { useBreakpoint } = AntGrid

export const ConceptSearchResults = () => {
	const { query, conceptPages, perPage, currentPage, pageCount,
			isLoadingConcepts, error, setCurrentPage, setSelectedResult } = useHelxSearch()
	const { md } = useBreakpoint();
	const concepts = useMemo(() => Object.values(conceptPages).flat(), [conceptPages])
	const hasMore = useMemo(() => (
		!isLoadingConcepts && (currentPage < pageCount || pageCount === 0)
	), [isLoadingConcepts, currentPage, pageCount])
	const getNextPage = useCallback(() => {
		setCurrentPage(currentPage + 1)
	}, [currentPage])

	const gridClass = useMemo(() => `results-list grid${md ? " md" : ""}`, [md])
    
	return (
		<Fragment>
			{
				query && (
					<Fragment>
					<div className="results" style={{ flexGrow: 1 }}>
						{ error.message ? (
							<span style={{ marginTop: -144, padding: "0 6px" }}>{ error.message }</span>
						) : concepts.length === 0 && !isLoadingConcepts ? (
							<Empty style={{ marginTop: -24 }} description={
								<Text type="secondary">No results were found for &quot;{ query }&quot;</Text>
							} />
							// <span style={{ marginTop: -144, padding: "0 6px" }}>No results found</span>
						) : null }
						{concepts.length > 0 && <ResultsHeader />}
						<InfiniteScroll
							dataLength={concepts.length}
							next={getNextPage}
							hasMore={hasMore}
						>
							<div className={gridClass}>
								{
									concepts.map((result, i) => {
										const index = (currentPage - 1) * perPage + i + 1
										return (
											<ConceptCard
												key={ result.id }
												index={ index }
												result={ result }
												openModalHandler={ () => setSelectedResult(result) }
											/>
										)
									})
								}
							</div>
						</InfiniteScroll>
						{
							currentPage === pageCount ? (
								null
							) : (
								(currentPage === 0 || currentPage < pageCount || isLoadingConcepts) && (
									<Spin style={{ display: "block", margin: "32px" }} />
								)
							)
						}
					</div>
					<BackTop />
					</Fragment>
				)
			}
		</Fragment>
	)
}

