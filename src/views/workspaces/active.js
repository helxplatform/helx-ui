import React, { Fragment, useEffect, useState } from 'react';
import { Button, Col, Form, Input, Layout, Modal, Table, Typography, Slider, Spin, Row } from 'antd';
import { DeleteOutlined, RightCircleOutlined } from '@ant-design/icons';
import { NavigationTabGroup } from '../../components/workspaces/navigation-tab-group';
import { openNotificationWithIcon } from '../../components/notifications';
import { useActivity, useApp, useInstance } from '../../contexts';
import { Breadcrumbs } from '../../components/layout'
import TimeAgo from 'timeago-react';
import { toBytes, bytesToMegabytes, formatBytes } from '../../utils/memory-converter';
import { updateTabName } from '../../utils/update-tab-name';

const memoryFormatter = (value) => {
    return formatBytes(value, 2);
}

export const ActiveView = () => {
    const [instances, setInstances] = useState();
    const [apps, setApps] = useState();
    const [refresh, setRefresh] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const { addActivity } = useActivity();
    const { loadApps } = useApp();
    const { loadInstances, stopInstance, updateInstance, pollingInstance, addOrDeleteInstanceTab } = useInstance();
    const [modalOpen, setModalOpen] = useState(false);
    const [isUpdating, setUpdating] = useState(false);
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
        renderInstance();
        loadAppsConfig();
    }, [refresh])

    const stopInstanceHandler = async (app_id, name) => {
        addOrDeleteInstanceTab("close", app_id);
        await stopInstance(app_id)
            .then(r => {
                setRefresh(!refresh);
                let newActivity = {
                    'sid': 'none',
                    'app_name': name,
                    'status': 'success',
                    'timestamp': new Date(),
                    'message': `${name} is stopped.`
                }
                addActivity(newActivity)
                // openNotificationWithIcon('success', 'Success', `${name} is stopped.`)
            })
            .catch(e => {
                let newActivity = {
                    'sid': 'none',
                    'app_name': name,
                    'status': 'error',
                    'timestamp': new Date(),
                    'message': `An error has occurred while stopping ${name}.`
                }
                addActivity(newActivity)
                // openNotificationWithIcon('error', 'Error', `An error has occurred while stopping ${name}.`)
            })
    }

    const stopAllInstanceHandler = async () => {
        setLoading(true);
        for await (let this_app of instances) {
            stopInstanceHandler(this_app.sid, this_app.name);
        }
        setLoading(false);
    }

    //Update a running Instance.
    const updateOne = async (_workspace, _cpu, _gpu, _memory) => {
        setUpdating(true);
        await updateInstance(currentRecord.sid, _workspace, _cpu, _gpu, _memory)
            .then(res => {
                if (res.data.status === "success") {
                    setModalOpen(false);
                    setUpdating(false);
                    openNotificationWithIcon('success', 'Success', `${currentRecord.name} is updated and will be restarted.`)
                    let newActivity = {
                        'sid': currentRecord.sid,
                        'app_name': currentRecord.name,
                        'status': 'pending',
                        'timestamp': new Date(),
                        'message': `${currentRecord.name} is launching.`
                    }
                    addActivity(newActivity)
                    pollingInstance(currentRecord.aid, currentRecord.sid, currentRecord.url, currentRecord.name)
                    setRefresh(!refresh);
                    //splashScreen(currentRecord.url, currentRecord.aid, currentRecord.sid, currentRecord.name);
                }
                else {
                    setModalOpen(false);
                    setUpdating(false);
                    let newActivity = {
                        'sid': 'none',
                        'app_name': currentRecord.name,
                        'status': 'error',
                        'timestamp': new Date(),
                        'message': `Error occured when updating instance ${currentRecord.name}.`
                    }
                    addActivity(newActivity)
                    // openNotificationWithIcon('error', 'Error', `Error occured when updating instance ${currentRecord.name}.`)
                }
            }).catch(e => {
                setModalOpen(false);
                setUpdating(false);
                let newActivity = {
                    'sid': 'none',
                    'app_name': currentRecord.name,
                    'status': 'error',
                    'timestamp': new Date(),
                    'message': `Error occured when updating instance ${currentRecord.name}.`
                }
                addActivity(newActivity)
                // openNotificationWithIcon('error', 'Error', `Error occured when updating instance ${currentRecord.name}.`)
            })
    };

    const handleModalOpen = (record) => {
        // load current instance resources
        setCurrentRecord(record);
        setWorkspace(record.workspace_name);
        setCpu(record.cpus / 1000);
        setGpu(record.gpus / 1000);
        setMemory(toBytes(record.memory + 'G'));
        setModalOpen(true);
    };

    const splashScreen = (app_url, app_name, sid, app_displayName) => {
        const host = window.location.host
        const protocol = window.location.protocol
        const app_icon = `https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/${app_name}/icon.png`
        const url = `${protocol}//${host}/helx/workspaces/connect/${app_name}/${encodeURIComponent(app_url)}/${encodeURIComponent(app_icon)}`
        const connect_tab_ref = `${sid}-tab`
        const connect_tab = window.open(url, connect_tab_ref);
        updateTabName(connect_tab, app_displayName)
        addOrDeleteInstanceTab("add", sid, connect_tab);
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
                        <button onClick={() => splashScreen(record.url, record.aid, record.sid, record.name)}>
                            <RightCircleOutlined />
                        </button>
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
            title: <Button type="primary" danger onClick={stopAllInstanceHandler}>Stop All</Button>,
            align: 'center',
            render: (record) => {
                return (
                    <Fragment>
                        <button onClick={() => stopInstanceHandler(record.sid, record.name)}>
                            <DeleteOutlined />
                        </button>
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
                        <button type="button" value="update" onClick={() => handleModalOpen(record)}>Update</button>
                        {modalOpen ?
                            <Modal
                                title="Update Instance"
                                visible={modalOpen}
                                confirmLoading={isUpdating}
                                footer={[
                                    <Button key="cancel" onClick={() => { setModalOpen(false); setUpdating(false); }}>Cancel</Button>,
                                    <Button key="ok" onClick={() => updateOne(workspace, cpu, gpu, bytesToMegabytes(memory))}>{isUpdating ? <Spin /> : 'OK'}</Button>
                                ]}
                                onOk={() => updateOne(record, cpu, gpu, bytesToMegabytes(memory))}
                                onCancel={() => setModalOpen(false)}
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
                        <Table columns={columns} dataSource={instances} /> : <div style={{ textAlign: 'center' }}>No instances running</div>))}
        </Layout>
    )
}
