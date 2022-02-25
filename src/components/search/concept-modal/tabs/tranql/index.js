import React, { Fragment, useCallback, useMemo, useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import { Button, Divider, Input, Spin, Space, Typography } from 'antd'
import { useHelxSearch } from '../../../'
import { useAnalytics, useEnvironment } from '../../../../../contexts'
import { Link } from '../../../../link'
import { RocketOutlined as QueryIcon } from '@ant-design/icons'
import { useDebounce } from 'use-debounce'
import './tranql.css'

axios.defaults.timeout = 30000

const { Text, Title } = Typography
const { TextArea } = Input

const TRANQL_RESULT_LIMIT = 100;

export const TranQLTab = ({ result, graphs }) => {
  const analytics = useAnalytics()
  const { context } = useEnvironment()
  const { query } = useHelxSearch()
  const tranqlUrl = context.tranql_url

  const robokopUrl = "https://robokop.renci.org"

  const trackLink = (name, url) => {
    analytics.trackEvent({
      category: "UI Interaction",
      action: "TranQL tab URL clicked",
      label: `User opened URL for ${name}`,
      customParameters: {
        "User ID": "",
        "URL name": name,
        "URL": url
      }
    });
  }

  const makeTranqlQuery = () => {
    const tranqlQueries = graphs.map(({ knowledge_graph, question_graph, knowledge_map }) => {
      // Each question_graph has one edge and two nodes.
      const [ edge ] = question_graph.edges
      const [ n1, n2 ] = question_graph.nodes
      const boundNodes = question_graph.nodes.filter((n) => n.hasOwnProperty("curie"))

      const findKGNode = (curie) => knowledge_graph.nodes.find((n) => n.id === curie);
      const getQGNodeIdentifier = (n) => {
        return n.curie;
        /* Returns the English name of the curie */
        // return findKGNode(n.curie[0]).name;
      }

      const SELECT = `SELECT ${edge.source_id}->${edge.target_id}`
      const FROM = `FROM "/schema"`
      // Not entirely sure if DUG can return multiple bound nodes, so implementing it just in case it's possible.
      const WHERE = "WHERE " + boundNodes.map((n) => `${n.id}="${getQGNodeIdentifier(n)}"`).join(" AND ")
      const LIMIT = `LIMIT ${TRANQL_RESULT_LIMIT}`;
      const query = `${SELECT}
  ${FROM}
 ${WHERE}
 ${LIMIT}`
      return query;
    }).reduce((acc, cur) => {
      // Remove duplicate queries
      if (!acc.includes(cur)) acc.push(cur)
      return acc
    }, []);
    // Right now, TranQL only seems? to support one query at once (i.e., one SELECT statement per query is allowed)
    // so just use the first query that's there.
    return tranqlQueries[0]
  }

  const initialTranqlQuery = useMemo(makeTranqlQuery, [result, graphs])
  const [tranqlQuery, setTranqlQuery] = useState(initialTranqlQuery)
  const tranqlQueryUrl = useMemo(() => `${tranqlUrl}?q=${encodeURIComponent(tranqlQuery)}`, [tranqlQuery])
  // const [debouncedQuery] = useDebounce(tranqlQuery, 250)

  const [iframeLoading, setIframeLoading] = useState(true)

  const tranqlIframe = useRef(null);

  const handleChangeTranqlQuery = event => {
    setTranqlQuery(event.target.value)
  }

  if (tranqlQuery === undefined) return (
    <Fragment>
      <Title level={ 4 }>TranQL</Title>
      <Text>No query could be constructed from the result.</Text>
    </Fragment>
  );
  return (
    <Fragment>
      <Space direction="vertical">
        <div style={{position: "relative"}}>
          {/* Some really weird stuff happens when applying display: none to the TranQL iframe. I believe this is due to 
            * the size-detection that's used within the TranQL app, but it messes up the rendering. Instead, just make both the components
            * have the same dimensions and overlay each other, since only can be visible at once anyways.
            */}
          <div style={{position: "absolute", display: iframeLoading ? "flex" : "none", justifyContent: "center", alignItems: "center", height: "500px", width: "100%"}}>
            <Spin/>
          </div>
          <div style={{position: "relative", visibility: iframeLoading ? "hidden": "visible"}}>
            <iframe src={`${tranqlUrl}?embed=FULL&use_last_view&q=${encodeURIComponent(tranqlQuery)}`}
                    height="500"
                    ref={tranqlIframe}
                    onLoad={() => setIframeLoading(false)}
                    style={{borderWidth: "0", width: "100%"}}
            />
            <div style={{position: "absolute", top: "12px", right: "12px"}}>
              <Space direction="vertical" style={{alignItems: "flex-end"}}>
                <Link to={tranqlQueryUrl} onClick={() => trackLink("TranQL", tranqlQueryUrl)}>
                  View in TranQL
                </Link>
                {/* <Link to={robokopUrl} onClick={() => trackLink("Robokop", robokopUrl)}>
                  Open ROBOKOP
                </Link> */}
              </Space>
            </div>
          </div>
        </div>
        {/* <Link to={robokopUrl} onClick={() => trackLink("Robokop", robokopUrl)}>Open Robokop</Link> */}
      </Space>
    </Fragment>
  );
}
