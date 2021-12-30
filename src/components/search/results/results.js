import React, { Fragment, useState, useMemo } from 'react'
import { Link } from '../../link'
import { Radio, notification, Spin, Tooltip as TooltipAnt, Typography, Collapse, List } from 'antd'
import {
  LinkOutlined as LinkIcon,
  TableOutlined as GridViewIcon,
  UnorderedListOutlined as ListViewIcon,
  DatabaseOutlined as ConceptViewIcon,
  SmallDashOutlined as VariableViewIcon
} from '@ant-design/icons'
import { PaginationTray, SearchResultCard, useHelxSearch } from '../'
import './results.css'
import { useAnalytics, useEnvironment } from '../../../contexts'
import {
  Label,
  LineChart,
  Line,
  BarChart, Bar, Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceArea,
  ResponsiveContainer,
  Legend,
  Tooltip as TooltipRc
} from 'recharts';

const { Panel } = Collapse
const { Text } = Typography

const GRID = 'GRID'
const LIST = 'LIST'
const initialData = [
  { name: 1, cost: 4.11 },
  { name: 2, cost: 2.39 },
  { name: 3, cost: 1.37 },
  { name: 4, cost: 1.16 },
  { name: 5, cost: 2.29 },
  { name: 6, cost: 3 },
  { name: 7, cost: 0.53},
  { name: 8, cost: 2.52 },
  { name: 9, cost: 1.79 },
  { name: 10, cost: 2.94 },
  { name: 11, cost: 4.3 },
  { name: 12, cost: 4.41 },
  { name: 13, cost: 2.1},
  { name: 14, cost: 8 },
  { name: 15, cost: 0 },
  { name: 16, cost: 9 },
  { name: 17, cost: 3 },
  { name: 18, cost: 2},
  { name: 19, cost: 3 },
  { name: 20, cost: 7 },
];

const getAxisYDomain = (from, to, ref, offset) => {
  const refData = initialData.slice(from - 1, to);
  let [bottom, top] = [refData[0][ref], refData[0][ref]];
  refData.forEach((d) => {
    if (d[ref] > top) top = d[ref];
    if (d[ref] < bottom) bottom = d[ref];
  });

  return [(bottom | 0) - offset, (top | 0) + offset];
};

const initialState = {
  data: initialData,
  left: 'dataMin',
  right: 'dataMax',
  refAreaLeft: '',
  refAreaRight: '',
  top: 'dataMax+1',
  bottom: 'dataMin-1',
  top2: 'dataMax+20',
  bottom2: 'dataMin-20',
  animation: true,
};


export const SearchResults = () => {
  const { query, results, totalResults, perPage, currentPage, pageCount, isLoadingResults, error, setSelectedResult, studyResults, totalStudyResults, totalVariableResults, variableError, isLoadingVariableResults } = useHelxSearch()
  const { basePath } = useEnvironment()
  const analytics = useAnalytics()
  const [layout, setLayout] = useState(GRID)
  const [conceptView, setConceptView] = useState(true)
  const NotifyLinkCopied = () => {
    notification.open({ key: 'key', message: 'Link copied to clipboard' })
    navigator.clipboard.writeText(window.location.href)
    analytics.trackEvent({
      category: "UI Interaction",
      action: "Search URL copied",
      label: "User copied sharable link for search query",
      customParameters: {
        "Search term": query,
        "User ID": ""
      }
    })
  }

  const StudyListWithVariables = () => {
    return (
      <Collapse ghost className="variables-collapse">
        {
          studyResults.map((study, i) => {
            return (
              <Panel
                key={ `panel_${ study.c_name }` }
                header={
                  <Text>
                    { study.c_name }{ ` ` }
                    (<Link to={ study.c_link }>{ study.c_id }</Link>)
                  </Text>
                }
                extra={ <Text>{ study.elements.length } variable{ study.elements.length === 1 ? '' : 's' }</Text> }
              >
                <List
                  className="study-variables-list"
                  dataSource={ study.elements }
                  renderItem={ variable => (
                    <div className="study-variables-list-item">
                      <Text className="variable-name">
                        { variable.name } &nbsp;
                        ({ variable.e_link ? <a href={ variable.e_link }>{ variable.id }</a> : variable.id })
                      </Text><br />
                      <Text className="variable-description"> { variable.description }</Text>
                    </div>
                  ) }
                />
              </Panel>
            )
          })
        }
      </Collapse>
    )
  }

  const ConceptsList = () => {
    return (
      results.map((result, i) => {
        const index = (currentPage - 1) * perPage + i + 1
        return (
          <SearchResultCard
            key={ `${query}_result_${index}` }
            index={ index }
            result={ result }
            openModalHandler={ () => setSelectedResult(result) }
          />
        )
      })
    )
  }

  const handleChangeLayout = (event) => {
    const newLayout = event.target.value;
    setLayout(newLayout)
    // Only track when layout changes
    if (layout !== newLayout) {
      analytics.trackEvent({
        category: "UI Interaction",
        action: "Search layout changed",
        label: `Layout set to "${newLayout}"`,
        customParameters: {
          "Search term": query,
          "User ID": "",
          "Changed from": layout,
          "Changed to": newLayout
        }
      })
    }
  }

  const handleDataDisplayChange = (event) => {
    setConceptView(event.target.value)
  }

  const MemoizedResultsHeader = useMemo(() => (
    <div className="header">
      <Text>{totalResults} concepts and {totalStudyResults} studies with {totalVariableResults} variables for "{query}" ({pageCount} page{pageCount > 1 && 's'})</Text>
      <TooltipAnt title="Results Toggle" placement="top">
        <Radio.Group value={conceptView} onChange={handleDataDisplayChange}>
          <Radio.Button value={true}><ConceptViewIcon /></Radio.Button>
          <Radio.Button value={false}><VariableViewIcon /></Radio.Button>
        </Radio.Group>
      </TooltipAnt>
      <TooltipAnt title="Layout Toggle" placement="top">
        <Radio.Group value={layout} onChange={handleChangeLayout}>
          <Radio.Button value={GRID}><GridViewIcon /></Radio.Button>
          <Radio.Button value={LIST}><ListViewIcon /></Radio.Button>
        </Radio.Group>
      </TooltipAnt>
      <TooltipAnt title="Shareable link" placement="top">
        <Link to={`${basePath}search?q=${query}&p=${currentPage}`} onClick={NotifyLinkCopied}><LinkIcon /></Link>
      </TooltipAnt>
    </div>
  ), [currentPage, layout, pageCount, totalResults, query, totalStudyResults, totalVariableResults, conceptView])

  if (isLoadingResults) {
    return <Spin style={{ display: 'block', margin: '4rem' }} />
  }

  class TestPlot extends React.Component {
    constructor(props) {
      super(props);
      this.state = initialState;
    }

    zoom() {
      console.log("ZOOMING")
      let { refAreaLeft, refAreaRight } = this.state;
      const { data } = this.state;

      if (refAreaLeft === refAreaRight || refAreaRight === '') {
        this.setState(() => ({
          refAreaLeft: '',
          refAreaRight: '',
        }));
        return;
      }

      // xAxis domain
      if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

      // // yAxis domain
      const [bottom, top] = getAxisYDomain(refAreaLeft, refAreaRight, 'cost', 1);

      this.setState(() => ({
        refAreaLeft: '',
        refAreaRight: '',
        data: data.slice(),
        left: refAreaLeft,
        right: refAreaRight,
        bottom,
        top
      }));
    }

    zoomOut() {
      const { data } = this.state;
      this.setState(() => ({
        data: data.slice(),
        refAreaLeft: '',
        refAreaRight: '',
        left: 'dataMin',
        right: 'dataMax',
        top: 'dataMax+1',
        bottom: 'dataMin',
        top2: 'dataMax+50',
        bottom2: 'dataMin+50',
      }));
    }

    render() {
      const { data, barIndex, left, right, refAreaLeft, refAreaRight, top, bottom, top2, bottom2 } = this.state;
      console.log(this.state)
      return (
        <div className="highlight-bar-charts" style={{ userSelect: 'none', width: '100%' }}>
          <button type="button" className="btn update" onClick={this.zoomOut.bind(this)}>
            Zoom Out
          </button>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              width={800}
              height={300}
              data={data}
              onMouseDown={(e) => this.setState({ refAreaLeft: e.activeLabel })}
              onMouseMove={(e) => this.state.refAreaLeft && this.setState({ refAreaRight: e.activeLabel })}
              // // eslint-disable-next-line react/jsx-no-bind
              onMouseUp={this.zoom.bind(this)}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis allowDataOverflow domain={[left, right]} type="number" dataKey="name" />
              <YAxis allowDataOverflow type="number" />
              <TooltipRc />
              <Bar dataKey="cost" fill="#8884d8" />


            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
  }



  return (
    <Fragment>

      { error && <span>{ error.message }</span> }

      {
        query && !error.message && (
          <div className="results">
            { results.length >= 1 && MemoizedResultsHeader }
            { conceptView ? <div/> : <TestPlot name="Sara"/> }

            <div className={ layout === GRID ? 'results-list grid' : 'results-list list' }>
              { conceptView ? <ConceptsList/> : <StudyListWithVariables/> }
            </div>
          </div>
        )
      }

      <br/><br/>

      { pageCount > 1 && conceptView ? <PaginationTray /> : <div/> }

    </Fragment>
  )
}
