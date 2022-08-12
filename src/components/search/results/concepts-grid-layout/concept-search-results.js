import React, { Fragment, useMemo, useCallback } from 'react'
import { Spin, Grid as AntGrid, Typography, Radio, Tooltip } from 'antd'
import { ConceptCard, useHelxSearch, SearchLayout, ExpandedResultsLayout } from '../../'
import InfiniteScroll from 'react-infinite-scroll-component'
import { BackTop } from '../../../layout'
import { ResultsHeader } from './../'

const { Text } = Typography
const { useBreakpoint } = AntGrid

export const ConceptSearchResults = () => {
	const { query, conceptPages, perPage, currentPage, pageCount, typeFilter, isLoadingVariableResults,
			isLoadingConcepts, error, layout, setCurrentPage, setSelectedResult } = useHelxSearch()
	const { md } = useBreakpoint();
	const concepts = useMemo(() => Object.values(conceptPages).flat(), [conceptPages])
	const hasMore = useMemo(() => (
		!typeFilter && !isLoadingConcepts && (currentPage < pageCount || pageCount === 0)
	), [typeFilter, isLoadingConcepts, currentPage, pageCount])
	const getNextPage = useCallback(() => {
		setCurrentPage(currentPage + 1)
	}, [currentPage])

	const gridClass = useMemo(() => `results-list grid${md ? " md" : ""}`, [md])
    
	return (
		<Fragment>
			{
				query && !error.message && (
					<Fragment>
					<div className="results" style={{ flexGrow: 1 }}>
						{concepts.length > 0 && <ResultsHeader concepts={concepts}/>}
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
								typeFilter ? (
									<Text style={{ textAlign: "center", marginTop: "24px" }}>Disable filters to load more results.</Text>
								) : (
									(currentPage === 0 || currentPage < pageCount || isLoadingConcepts) && (
										<Spin style={{ display: "block", margin: "32px" }} />
									)
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

