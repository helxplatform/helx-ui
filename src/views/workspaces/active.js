import React, { Fragment, useEffect, useState } from 'react';
import { Button, Col, Form, Input, Layout, Modal, Table, Typography, Slider, Spin, Row, Popconfirm } from 'antd';
import { DeleteOutlined, RightCircleOutlined } from '@ant-design/icons';
import { NavigationTabGroup } from '../../components/workspaces/navigation-tab-group';
import { openNotificationWithIcon } from '../../components/notifications';
import { useActivity, useApp, useInstance, useAnalytics } from '../../contexts';
import { Breadcrumbs } from '../../components/layout'
import TimeAgo from 'timeago-react';
import { toBytes, bytesToMegabytes, formatBytes } from '../../utils/memory-converter';
import { updateTabName } from '../../utils/update-tab-name';
import { navigate } from '@reach/router';

const memoryFormatter = (value) => {
    return formatBytes(value, 2);
}

export const ActiveView = () => {
    const [instances, setInstances] = useState();
    const [apps, setApps] = useState();
    const [refresh, setRefresh] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const { addActivity, updateActivity } = useActivity();
    const { analyticsEvents } = useAnalytics();
    const { loadApps } = useApp();
    const { loadInstances, stopInstance, updateInstance, pollingInstance, addOrDeleteInstanceTab, stopPolling } = useInstance();
    const [updateModalVisibility, setUpdateModalVisibility] = useState(false);
    const [stopModalVisibility, setStopModalVisibility] = useState(false);
    const [stopAllModalVisibility, setStopAllModalVisibility] = useState(false);
    const [isUpdating, setUpdating] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const [isStoppingAll, setIsStoppingAll] = useState(false);
    const [currentRecord, setCurrentRecord] = useState();
    const [workspace, setWorkspace] = useState();
    const [cpu, setCpu] = useState();
    const [gpu, setGpu] = useState();
    const [memory, setMemory] = useState();
    const breadcrumbs = [
        { text: 'Home', path: '/helx' },
        { text: 'Workspaces', path: '/helx/workspaces' },
        { text: 'Active', path: '/helx/workspaces/active' },
    ]

    useEffect(() => {
        const renderInstance = async () => {
            setLoading(true);
            await loadInstances()
                .then(r => {
                    setInstances(r.data);
                })
                .catch(e => {
                    setInstances([]);
                    openNotificationWithIcon('error', 'Error', 'An error has occurred while loading instances.')
                })
            setLoading(false);
        }
        renderInstance();
    }, [refresh])

    useEffect(() => {
        // load all app configuration for input validation
        const loadAppsConfig = async () => {
            await loadApps()
                .then(r => {
                    setApps(r.data)
                })
                .catch(e => {
                    setApps({});
                    openNotificationWithIcon('error', 'Error', 'An error has occurred while loading app configuration.')
                })
        }
        if (instances && instances.length === 0) setTimeout(() => navigate('/helx/workspaces/available'), 1000)
        else loadAppsConfig();

    }, [instances])

    const stopInstanceHandler = async () => {
        setIsStopping(true);
        addOrDeleteInstanceTab("close", currentRecord.sid);
        stopPolling(currentRecord.sid)
        await stopInstance(currentRecord.sid)
            .then(r => {
                let newActivity = {
                    'sid': currentRecord.sid,
                    'app_name': currentRecord.name,
                    'status': 'success',
                    'timestamp': new Date(),
                    'message': `${currentRecord.name} is stopped.`
                }
                analyticsEvents.appDeleted(currentRecord.name, currentRecord.sid, null);
                updateActivity(newActivity)
                setRefresh(!refresh)
            })
            .catch(e => {
                let newActivity = {
                    'sid': currentRecord.sid,
                    'app_name': currentRecord.name,
                    'status': '',
                    'timestamp': new Date(),
                    'message': ``
                }
                switch (e.response.status) {
                    case 403: {
                        newActivity['status'] = 'error'
                        newActivity['message'] = `Sorry, you don't have the permission to stop this instance.`
                        break;
                    }
                    case 404: {
                        newActivity['status'] = 'warning'
                        newActivity['message'] = `${currentRecord.name} no longer exists.`
                        setTimeout(() => setRefresh(!refresh), 1000)
                        break;
                    }
                    default: {
                        newActivity['status'] = 'error'
                        newActivity['message'] = `An error has occurred while stopping ${currentRecord.name}.`
                    }
                }
                analyticsEvents.appDeleted(currentRecord.name, currentRecord.sid, newActivity.message);
                updateActivity(newActivity)
            })
        setStopModalVisibility(false);
        setIsStopping(false);
    }

    const stopAllInstanceHandler = async () => {
        setIsStoppingAll(true);
        for (let this_app of instances) {
            addOrDeleteInstanceTab("close", this_app.sid);
            await stopInstance(this_app.sid)
                .then(r => {
                })
                .catch(e => {
                    let newActivity = {
                        'sid': 'none',
                        'app_name': this_app.name,
                        'status': 'error',
                        'timestamp': new Date(),
                        'message': `An error has occurred while stopping ${this_app.name}.`
                    }
                    addActivity(newActivity)
                })
        }
        analyticsEvents.allAppsDeleted()
        setRefresh(!refresh)
        setStopAllModalVisibility(false);
        setIsStoppingAll(false);
    }

    const connectInstance = (aid, sid, url, name) => {
        try {
            const urlObject = new URL(url);
            const appUrl = `${window.location.origin}/helx/connect/${aid}/${encodeURIComponent(urlObject.pathname)}`;
            const connectTabRef = `${sid}-tab`;
            const connectTab = window.open(appUrl, connectTabRef);
            updateTabName(connectTab,name);
            addOrDeleteInstanceTab("add",sid,connectTab);
            analyticsEvents.appOpened(name, sid);
        }
        catch(e) {
            // if invalid URL parse error do nothing
            console.log(`error trying to connect to instance ${e}`)
        }
    }

    //Update a running Instance.
    const updateOne = async (_workspace, _cpu, _gpu, _memory) => {
        setUpdating(true);
        const appUpdatedAnalyticsEvent = (failed=false) => (
            analyticsEvents.appUpdated(currentRecord.name, currentRecord.sid, _workspace, _cpu, _gpu, _memory, failed)
        );
        await updateInstance(currentRecord.sid, _workspace, _cpu, _gpu, _memory)
            .then(res => {
                if (res.data.status === "success") {
                    setUpdateModalVisibility(false);
                    setUpdating(false);
                    let newActivity = {
                        'sid': currentRecord.sid,
                        'app_name': currentRecord.name,
                        'status': 'processing',
                        'timestamp': new Date(),
                        'message': `${currentRecord.name} is launching.`
                    }
                    appUpdatedAnalyticsEvent(false)
                    addActivity(newActivity)
                    pollingInstance(currentRecord.aid, currentRecord.sid, currentRecord.url, currentRecord.name)
                    setRefresh(!refresh);
                }
                else {
                    setUpdateModalVisibility(false);
                    setUpdating(false);
                    let newActivity = {
                        'sid': 'none',
                        'app_name': currentRecord.name,
                        'status': 'error',
                        'timestamp': new Date(),
                        'message': `Error occured when updating instance ${currentRecord.name}.`
                    }
                    appUpdatedAnalyticsEvent(true)
                    addActivity(newActivity)
                }
            }).catch(e => {
                setUpdateModalVisibility(false);
                setUpdating(false);
                let newActivity = {
                    'sid': 'none',
                    'app_name': currentRecord.name,
                    'status': 'error',
                    'timestamp': new Date(),
                    'message': `Error occured when updating instance ${currentRecord.name}.`
                }
                appUpdatedAnalyticsEvent(true)
                addActivity(newActivity)
            })
    };

    const handleUpdateModalOpen = (record) => {
        // load current instance resources
        setCurrentRecord(record);
        setWorkspace(record.workspace_name);
        setCpu(record.cpus / 1000);
        setGpu(record.gpus / 1000);
        setMemory(toBytes(record.memory + 'G'));
        setUpdateModalVisibility(true);
    };

    const handleDeleteModalOpen = (record) => {
        setCurrentRecord(record);
        setStopModalVisibility(true);
    }

    const columns = [
        {
            title: 'App Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Workspace',
            dataIndex: 'workspace_name',
            key: 'workspace',
        },
        {
            title: 'Connect',
            key: 'action',
            align: 'center',
            render: (record) => {
                return (
                    <Fragment>
                        <Button icon={<RightCircleOutlined />} onClick={() => connectInstance(record.aid, record.sid, record.url, record.name)} />
                    </Fragment>
                )
            }
        },
        {
            title: 'Creation Time',
            dataIndex: 'creation_time',
            render: (record) => {
                return (
                    <Fragment>
                        <TimeAgo datetime={new Date(record + ' UTC')} opts={{ relativeDate: new Date().toUTCString() }} />
                    </Fragment>
                )
            }
        },
        {
            title: 'CPU',
            render: (record) => { return record.cpus / 1000 + ' Core' + (record.cpus / 1000 > '1' ? 's' : '') },
        },
        {
            title: 'GPU',
            render: (record) => { return record.gpus / 1000 + ' Core' + (record.gpus / 1000 > '1' ? 's' : '') },
        },
        {
            title: 'Memory',
            // Note: Memory in the response does not contain unit, but it matches the one when we post them (MB by default).
            render: (record) => { return record.memory + ' GB' },
        },
        {
            title: <Fragment>
                {stopAllModalVisibility ? <Modal
                    visible={stopAllModalVisibility}
                    title='Stop All Instances'
                    footer={[
                        <Button key="stop" onClick={() => setStopAllModalVisibility(false)}>Cancel</Button>,
                        <Button type="primary" key="stop" onClick={() => stopAllInstanceHandler()} danger>{isStoppingAll ? <Spin /> : 'Stop'}</Button>
                    ]}
                    onCancel={() => setStopAllModalVisibility(false)}
                >
                    <div>Are you sure to stop all instances?</div>
                </Modal> : <div></div>}
                <Button type="primary" danger onClick={() => setStopAllModalVisibility(true)}>Stop All</Button>
            </Fragment>,
            align: 'center',
            render: (record) => {
                return (
                    <Fragment>
                        {stopModalVisibility ? <Modal
                            visible={stopModalVisibility}
                            title='Stop Instance'
                            footer={[
                                <Button key="stop" onClick={() => setStopModalVisibility(false)}>Cancel</Button>,
                                <Button type="primary" key="stop" onClick={() => stopInstanceHandler()} danger>{isStopping ? <Spin /> : 'Stop'}</Button>
                            ]}
                            onCancel={() => setStopModalVisibility(false)}
                        >
                            <div>Are you sure to stop <b>{currentRecord.name}</b>?</div>
                        </Modal> : <div></div>}
                        <Button icon={<DeleteOutlined />} onClick={() => handleDeleteModalOpen(record)} />
                    </Fragment>
                );
            }
        },
        {
            title: 'Update',
            align: 'center',
            render: (record) => {

                return (
                    <Fragment>
                        <Button type="button" value="update" onClick={() => handleUpdateModalOpen(record)}>Update</Button>
                        {updateModalVisibility ?
                            <Modal
                                title="Update Instance"
                                visible={updateModalVisibility}
                                confirmLoading={isUpdating}
                                footer={[
                                    <Button key="cancel" onClick={() => { setUpdateModalVisibility(false); setUpdating(false); }}>Cancel</Button>,
                                    <Button type="primary" key="ok" onClick={() => updateOne(workspace, cpu, gpu, bytesToMegabytes(memory))}>{isUpdating ? <Spin /> : 'Update'}</Button>
                                ]}
                                onOk={() => updateOne(record, cpu, gpu, bytesToMegabytes(memory))}
                                onCancel={() => setUpdateModalVisibility(false)}
                            >
                                <Form>
                                    <Form.Item label="Workspace"><Input value={workspace} onChange={(e) => setWorkspace(e.target.value)} /></Form.Item>
                                    {apps[record.aid].minimum_resources.cpus === apps[record.aid].maximum_resources.cpus ?
                                        '' : <Form.Item>
                                            <Row align="middle">
                                                <Col span={3}>CPU</Col>
                                                <Fragment><Col span={16}><Slider min={parseInt(apps[record.aid].minimum_resources.cpus)} max={parseInt(apps[record.aid].maximum_resources.cpus)} value={cpu} onChange={(value) => { setCpu(value) }} /></Col><Col style={{ paddingLeft: '10px' }} span={5}><Typography>{cpu} Core{cpu > 1 ? 's' : ''}</Typography></Col></Fragment>
                                            </Row>
                                        </Form.Item>}
                                    {apps[record.aid].minimum_resources.gpus === apps[record.aid].maximum_resources.gpus ?
                                        '' :
                                        <Form.Item>
                                            <Row align="middle">
                                                <Col span={3}>GPU</Col><Fragment><Col span={16}><Slider min={parseInt(apps[record.aid].minimum_resources.gpus)} max={parseInt(apps[record.aid].maximum_resources.gpus)} value={gpu} onChange={(value) => { setGpu(value) }} /></Col><Col style={{ paddingLeft: '10px' }} span={5}><Typography>{gpu} Core{gpu > 1 ? 's' : ''}</Typography></Col></Fragment>
                                            </Row>
                                        </Form.Item>}
                                    {apps[record.aid].minimum_resources.memory === apps[record.aid].maximum_resources.memory ?
                                        '' :
                                        <Form.Item>
                                            <Row align="middle">
                                                <Col span={3}>Memory</Col><Fragment><Col span={16}><Slider min={parseInt(toBytes(apps[record.aid].minimum_resources.memory))} max={parseInt(toBytes(apps[record.aid].maximum_resources.memory))} value={parseInt(memory)} step={toBytes("0.25G")} onChange={(value) => { setMemory(value) }} tipFormatter={memoryFormatter} /></Col><Col style={{ paddingLeft: '10px' }} span={5}><Typography>{formatBytes(memory, 2)}</Typography></Col></Fragment>
                                            </Row>
                                        </Form.Item>}
                                    <Form.Item>
                                        <Typography>Updating will restart the application. </Typography>
                                    </Form.Item>
                                </Form>
                            </Modal>
                            : <div></div>
                        }
                    </Fragment>
                )
            }
        }
    ]

    return (
        <Layout>
            <Breadcrumbs crumbs={breadcrumbs} />
            <NavigationTabGroup currentKey="active" />
            {isLoading ? <Spin /> :
                (instances === undefined ?
                    <div></div> :
                    (instances.length > 0 ?
                        <Table columns={columns} dataSource={instances}>
                        </Table> : <div style={{ textAlign: 'center' }}>No instances running. Redirecting to apps...</div>))}
        </Layout>
    )
}
