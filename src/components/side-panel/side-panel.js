import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Collapse, Descriptions, Divider, Drawer, Modal, Space, Tabs, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LeftOutlined, SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import TimeAgo from 'timeago-react';
import { useActivity, useAnalytics, useInstance, useWorkspacesAPI } from '../../contexts';
import { updateTabName } from '../../utils/update-tab-name';
import { InfoButton } from '../';
import { useLocalStorage } from '../../hooks'
import './side-panel.css';

const { Panel } = Collapse

const ActivityLog = ({ events, setShowEventInfo }) => {
    const { appSpecs } = useActivity()

    const [collapsed, setCollapsed] = useState(true)
    const cleanedEvents = useMemo(() => events.filter((event) => {
        // If an event exists for an app that has been removed from
        // the available apps list, then we need to remove that event.
        return event.hasOwnProperty("data") && appSpecs.hasOwnProperty(event.data.appId)
    }), [events, appSpecs])
    const [latestActivity, ...otherActivities] = useMemo(() => cleanedEvents, [cleanedEvents])

    return (
        <Collapse
            ghost
            className="activity-log"
            activeKey={collapsed ? undefined : `${ latestActivity.data.systemId }-activity-log-collapse-panel`}
            onChange={ () => setCollapsed(!collapsed) }
        >
            <Panel
                key={`${ latestActivity.data.systemId }-activity-log-collapse-panel`}
                header={
                    <ActivityEntry
                        event={ latestActivity }
                        full={ true }
                        setShowEventInfo={ setShowEventInfo }
                    />
                }
                className="activity-log-collapse-panel"
            >
                <Space direction="vertical" size="middle">
                    {
                        otherActivities.length !== 0 ? otherActivities.map((event) => (
                            <ActivityEntry
                                key={ event.uid }
                                event={ event }
                                full={ false }
                                setShowEventInfo={ setShowEventInfo }
                            />
                        )) : (
                            <i style={{ color: "rgba(0, 0, 0, 0.45)" }}>No other events have occurred so far</i>
                        )
                    }
                </Space>
            </Panel>
        </Collapse>
    )
}

const ActivityEntry = ({ event, full, setShowEventInfo }) => {
    const { appSpecs } = useActivity()

    const {
        statusIndicator,
        statusText,
        statusColor,
        statusMessage
    } = useMemo(() => {
        let statusIndicator = null
        let statusText = null
        let statusColor = null
        let statusMessage = null

        const appSpec = appSpecs[event.data.appId]
        switch (event.data.status) {
            case "LAUNCHING":
                statusIndicator = <SyncOutlined spin />
                statusText = "Processing"
                statusColor = "processing"
                statusMessage = (
                    <span>
                        { appSpec.name } is launching and will be available soon.
                    </span>
                )
                break
            case "LAUNCHED":
                statusIndicator = <CheckCircleOutlined />
                statusText = "Launched"
                statusColor = "success"
                statusMessage = (
                    <span>
                        { appSpec.name } is up and ready for use.
                    </span>
                )
                break
            case "FAILED":
                statusIndicator = <ExclamationCircleOutlined />
                statusText = "Failed"
                statusColor = "error"
                statusMessage = (
                    <span>
                        { appSpec.name } has failed and is unavailable.
                    </span>
                )
                break
            case "SUSPENDING":
                statusIndicator = <SyncOutlined spin />
                statusText = "Suspending"
                statusColor = "warning"
                statusMessage = (
                    <span>
                        { appSpec.name } is being suspended and will terminate soon.
                    </span>
                )
                break
            case "TERMINATED":
                statusIndicator = <CloseCircleOutlined />
                statusText = "Terminated"
                statusColor = "default"
                statusMessage = (
                    <span>
                        { appSpec.name } has successfully shut down.
                    </span>
                )
                break
        }
        return {
            statusIndicator,
            statusText,
            statusColor,
            statusMessage
        }
    }, [event.data.status])
    return (
        <div className="activity-entry">
            <div>
                <Tag
                    icon={ full ? statusIndicator : undefined }
                    color={ statusColor }
                >
                    { statusText }
                </Tag>
                <span><TimeAgo datetime={event.timestamp * 1000} /></span>
                <InfoButton
                    onClick={ (e) => {
                        e.stopPropagation()
                        setShowEventInfo(event)
                    } }
                    iconProps={{ filled: false, style: { fontSize: 14 } }}
                />
            </div>
            <div style={{ marginTop: 4 }}>{ statusMessage } </div>
        </div>
    )
}

export const SidePanel = () => {
    const { appActivityCache, clearActivity } = useActivity();
    const { wsApi } = useWorkspacesAPI();
    const [visible, setVisible] = useState(false);
    const [seenActivities, setSeenActivities] = useLocalStorage("seen_activities", [])
    const [eventModalInfo, setShowEventInfo] = useState()
    
    const activities = useMemo(() => appActivityCache.reduce((acc, cur) => {
        const sid = cur.data.systemId
        if (!acc[sid]) acc[sid] = []
        acc[sid].push(cur)
        return acc
    }, {}), [appActivityCache])
    const notificationCount = useMemo(() => {
        return appActivityCache.filter((event) => !seenActivities.includes(event.uid)).length
    }, [appActivityCache, seenActivities])

    const openSidePanel = () => {
        setVisible(true)
    }

    const closeSidePanel = () => {
        setVisible(false)
    }

    useEffect(() => {
        if (!visible) return
        const newUids = appActivityCache.map((event) => event.uid)
        setSeenActivities((oldSeenActivities) => ([
            ...oldSeenActivities.filter((oldUid) => !newUids.includes(oldUid)),
            ...newUids
        ]))
    }, [visible, appActivityCache])


    return (
        <div id="helx-side-panel" className="side-panel-open">
            {!visible && (
                <Button onClick={openSidePanel}>
                    <Badge count={(notificationCount) ? notificationCount : ''}>
                        <LeftOutlined style={{ paddingRight: notificationCount === 0 ? '0px' : '10px' }} />
                    </Badge>
                </Button>
            )}
            <Drawer
                title="Activity Monitor"
                placement="right"
                closable={true}
                visible={visible}
                keyboard={true}
                mask={true}
                maskClosable={true}
                maskStyle={{ animation: 'none', opacity: 0 }}
                bodyStyle={{ padding: '16px 8px', paddingBottom: 0 }}
                style={{ marginTop: '66px' }}
                width={'300px'}
                onClose={closeSidePanel}
            >
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ flexGrow: 1, overflow: "auto" }}>
                    {
                        Object.keys(activities).length !== 0 ? Object.keys(activities).map((systemId, i) => (
                            <Fragment key={ systemId }>
                                <ActivityLog
                                    events={ activities[systemId] }
                                    setShowEventInfo={ setShowEventInfo }
                                />
                                { i !== Object.keys(activities).length - 1 && (
                                    <Divider style={{ marginTop: 16, marginBottom: 16 }} />
                                )}
                            </Fragment>
                        )) : <span style={{ padding: '8px 16px' }}>No activity</span>
                    }
                    </div>
                    <div style={{ padding: '12px 4px', display: "flex", justfiyContent: "center", alignItems: "center" }}>
                        <Button
                            type="ghost"
                            size="small"
                            block
                            onClick={ () => {
                                wsApi?.clearLogs()
                                clearActivity()
                            } }
                        >
                            Clear logs
                        </Button>
                    </div>
                </div>
            </Drawer>
            <Modal
                visible={ !!eventModalInfo }
                title={ `Event ${ eventModalInfo?.uid }` }
                onOk={ () => setShowEventInfo(undefined) }
                onCancel={ () => setShowEventInfo(undefined) }
                cancelButtonProps={{ style: { display: "none" } }}
            >
                <Space direction="vertical" size="large">
                    <Descriptions title="Event info"  column={ 1 } size="small" bordered>
                        <Descriptions.Item label="Status">{ eventModalInfo?.data.status }</Descriptions.Item>
                        <Descriptions.Item label="App ID">{ eventModalInfo?.data.appId }</Descriptions.Item>
                        <Descriptions.Item label="System ID">{ eventModalInfo?.data.systemId }</Descriptions.Item>
                        <Descriptions.Item label="Timestamp">
                            { eventModalInfo?.timestamp } <small>({ new Date(eventModalInfo?.timestamp * 1000).toString() })</small>
                        </Descriptions.Item>
                    </Descriptions>
                    { eventModalInfo?.data.containerStates && (
                        <Space direction="vertical" size={ 4 }>
                            <div className="ant-descriptions-title">Container states</div>
                            <Tabs items={ eventModalInfo?.data.containerStates.map((state) => ({
                                key: `${ eventModalInfo?.uid }-${ state.container_name }`,
                                label: state.container_name,
                                children: (
                                    <Descriptions column={ 1 } size="small" bordered>
                                        { Object.keys(state.container_state).map((key) => (
                                            <Descriptions.Item key={ key } label={ key }>
                                                { state.container_state[key] }
                                            </Descriptions.Item>
                                        )) }
                                    </Descriptions>
                                )
                            })) } />
                        </Space>
                    ) }
                </Space>
            </Modal>
        </div>
    )
}