import React, { Fragment, useEffect, useState } from 'react';
import { Button, Col, Form, Input, Layout, Modal, Table, Typography, Slider, Spin, Row } from 'antd';
import { DeleteOutlined, RightCircleOutlined } from '@ant-design/icons';
import { NavigationTabGroup } from '../../components/workspaces/navigation-tab-group';
import { openNotificationWithIcon } from '../../components/notifications';
import { useApp, useInstance } from '../../contexts';
import { Breadcrumbs } from '../../components/layout'
import TimeAgo from 'timeago-react';
import { toBytes, bytesToMegabytes, formatBytes, formatMemory } from '../../utils/memory-converter';

const memoryFormatter = (value) => {
    return formatBytes(value, 2);
}

export const ActiveView = () => {
    const [instances, setInstances] = useState();
    const [apps, setApps] = useState();
    const [refresh, setRefresh] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const { loadInstances, stopInstance, updateInstance, checkInstance } = useInstance();
    const { loadApps } = useApp();
    const [modalOpen, setModalOpen] = useState(false);

    const [isUpdating, setUpdating] = useState(false);
    const [workspace, setWorkspace] = useState();
    const [cpu, setCpu] = useState();
    const [gpu, setGpu] = useState();
    const [memory, setMemory] = useState();
    // const workspaceN = React.createRef();
    // const cpu = React.createRef();
    // const memory = React.createRef();
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
                    // setInstances([{ "name": "Jupyter Data Science", "docs": "https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-datascience-notebook", "aid": "jupyter-ds", "sid": "6645e9724f8649b896619969c41bd276", "fqsid": "jupyter-ds-6645e9724f8649b896619969c41bd276", "workspace_name": "jupyter-ds", "creation_time": "6-8-2021 14:54:0", "cpus": 2000.0, "gpus": 0, "memory": "11.0", "url": "https://heal-dev.blackbalsam-cluster.edc.renci.org/private/jupyter-ds/connectbo/6645e9724f8649b896619969c41bd276/", "status": "ready" }, { "name": "Octave", "docs": "https://www.gnu.org/software/octave", "aid": "octave", "sid": "08233bffc946442494f3162f7656dab3", "fqsid": "octave-08233bffc946442494f3162f7656dab3", "workspace_name": "octave", "creation_time": "6-8-2021 14:54:8", "cpus": 3000.0, "gpus": 0, "memory": "49.75", "url": "https://heal-dev.blackbalsam-cluster.edc.renci.org/private/octave/connectbo/08233bffc946442494f3162f7656dab3/", "status": "ready" }])
                    setInstances(r.data);
                })
                .catch(e => {
                    // setInstances([{"name":"Jupyter Data Science","docs":"https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-datascience-notebook","aid":"jupyter-ds","sid":"2e3e2bf8-d521-41ec-9cd9-49ae51efe2d4","fqsid":"jupyter-ds","workspace_name":"","creation_time":"6-6-2021 21:18:11","cpus":0.0,"gpus":0,"memory":"0.0","url":"https://localhost:8000/private/jupyter-ds/admin/2e3e2bf8-d521-41ec-9cd9-49ae51efe2d4/","status":"ready"},{"name":"Jupyter Data Science","docs":"https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-datascience-notebook","aid":"jupyter-ds","sid":"2e3e2bf8-d521-41ec-9cd9-49ae51efe2d4","fqsid":"jupyter-ds","workspace_name":"","creation_time":"6-6-2021 21:18:11","cpus":0.0,"gpus":0,"memory":"0.0","url":"https://localhost:8000/private/jupyter-ds/admin/2e3e2bf8-d521-41ec-9cd9-49ae51efe2d4/","status":"ready"},{"name":"Jupyter Data Science","docs":"https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-datascience-notebook","aid":"jupyter-ds","sid":"2e3e2bf8-d521-41ec-9cd9-49ae51efe2d4","fqsid":"jupyter-ds","workspace_name":"","creation_time":"time","cpus":0.0,"gpus":0,"memory":"0.0","url":"https://localhost:8000/private/jupyter-ds/admin/2e3e2bf8-d521-41ec-9cd9-49ae51efe2d4/","status":"ready"},{"name":"Jupyter Data Science","docs":"https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-datascience-notebook","aid":"jupyter-ds","sid":"2e3e2bf8-d521-41ec-9cd9-49ae51efe2d4","fqsid":"jupyter-ds","workspace_name":"","creation_time":"time","cpus":0.0,"gpus":0,"memory":"0.0","url":"https://localhost:8000/private/jupyter-ds/admin/2e3e2bf8-d521-41ec-9cd9-49ae51efe2d4/","status":"ready"},{"name":"Jupyter Data Science","docs":"https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-datascience-notebook","aid":"jupyter-ds","sid":"2e3e2bf8-d521-41ec-9cd9-49ae51efe2d4","fqsid":"jupyter-ds","workspace_name":"","creation_time":"time","cpus":0.0,"gpus":0,"memory":"0.0","url":"https://localhost:8000/private/jupyter-ds/admin/2e3e2bf8-d521-41ec-9cd9-49ae51efe2d4/","status":"ready"}])
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
                    // setApps({ "filebrowser": { "name": "File Browser", "app_id": "filebrowser", "description": "File Browser - a utility for browsing files through a web interface", "detail": "File Browser provides a web interface for browsing files in a cloud environment.", "docs": "https://filebrowser.org/", "spec": "https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/filebrowser/docker-compose.yaml", "minimum_resources": { "cpus": "1", "gpus": 0, "memory": "4000M" }, "maximum_resources": { "cpus": "8", "gpus": 0, "memory": "64000M" } }, "jupyter-ds": { "name": "Jupyter Data Science", "app_id": "jupyter-ds", "description": "Jupyter DataScience - A Jupyter notebook for exploring and visualizing data.", "detail": "Includes R, Julia, and Python.", "docs": "https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-datascience-notebook", "spec": "https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/jupyter-ds/docker-compose.yaml", "minimum_resources": { "cpus": "1", "gpus": 0, "memory": "4000M" }, "maximum_resources": { "cpus": "8", "gpus": 0, "memory": "64000M" } }, "octave": { "name": "Octave", "app_id": "octave", "description": "A scientific programming language largely compatible with MATLAB.", "detail": "GNU Octave is a high-level language, primarily intended for numerical computations.", "docs": "https://www.gnu.org/software/octave", "spec": "https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/octave/docker-compose.yaml", "minimum_resources": { "cpus": "1", "gpus": 0, "memory": "4000M" }, "maximum_resources": { "cpus": "8", "gpus": 0, "memory": "64000M" } } })
                    setApps({});
                    openNotificationWithIcon('error', 'Error', 'An error has occurred while loading app configuration.')
                })
        }
        renderInstance();
        loadAppsConfig();
    }, [loadInstances, refresh])

    const stopInstanceHandler = async (app_id, name) => {
        await stopInstance(app_id)
            .then(r => {
                setRefresh(!refresh);
                openNotificationWithIcon('success', 'Success', `${name} instance is stopped.`)
            })
            .catch(e => {
                openNotificationWithIcon('error', 'Error', `An error has occurred while stopping ${name}.`)
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
    const updateOne = async (record, theWorkSpace, theCpu, theMemory) => {
        setUpdating(true);
        await updateInstance(record, theWorkSpace, theCpu, theMemory)
            .then(res => {
                if (res.data.status === "success") {
                    setUpdating(false);
                    openNotificationWithIcon('success', 'Success', `Instance has been successfully updated ${record.name}.`)
                    setRefresh(!refresh);
                }
            }).catch(e => {
                setUpdating(false);
                openNotificationWithIcon('error', 'Error', `Error occured when updating instance ${record.name}.`)
            })
    };

    const handleModalOpen = (record) => {
        // load current instance resources
        setWorkspace(record.workspace_name);
        setCpu(record.cpus / 1000);
        setGpu(record.gpus / 1000);
        setMemory(toBytes(record.memory + 'G'));
        setModalOpen(true);
    };

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
                        <button onClick={() => window.open(record.connect, "_blank")}>
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
                        <TimeAgo datetime={new Date(record+' UTC')} opts={{ relativeDate: new Date().toUTCString()}}/>
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
                                onOk={() => updateOne(record, cpu, gpu, bytesToMegabytes(memory))}
                                onCancel={() => setModalOpen(false)}
                            >
                                <Form>
                                    <Form.Item label="Workspace"><Input value={workspace} onChange={(e) => setWorkspace(e.target.value)} /></Form.Item>
                                    <Form.Item>
                                        <Row align="middle">
                                            <Col span={3}>CPU</Col>
                                            {apps[record.aid].minimum_resources.cpus === apps[record.aid].maximum_resources.cpus ?
                                                <Col>Locked: {record.cpus} Core{record.cpus > 1 ? 's' : ''}</Col> :
                                                <Fragment><Col span={16}><Slider min={parseInt(apps[record.aid].minimum_resources.cpus)} max={parseInt(apps[record.aid].maximum_resources.cpus)} value={cpu} onChange={(value) => { setCpu(value) }} /></Col><Col style={{ paddingLeft: '10px' }} span={5}><Typography>{cpu} Core{cpu > 1 ? 's' : ''}</Typography></Col></Fragment>}
                                        </Row>
                                    </Form.Item>
                                    <Form.Item>
                                        <Row align="middle">
                                            <Col span={3}>GPU</Col>
                                            {apps[record.aid].minimum_resources.gpus === apps[record.aid].maximum_resources.gpus ?
                                                <Col>Locked: {record.gpus} Core{record.gpus > 1 ? 's' : ''}</Col> :
                                                <Fragment><Col span={16}><Slider min={parseInt(apps[record.aid].minimum_resources.gpus)} max={parseInt(apps[record.aid].maximum_resources.gpus)} value={gpu} onChange={(value) => { setGpu(value) }} /></Col><Col style={{ paddingLeft: '10px' }} span={5}><Typography>{gpu} Core{gpu > 1 ? 's' : ''}</Typography></Col></Fragment>}
                                        </Row>
                                    </Form.Item>
                                    <Form.Item>
                                        <Row align="middle">
                                            <Col span={3}>Memory</Col>
                                            {apps[record.aid].minimum_resources.memory === apps[record.aid].maximum_resources.memory ?
                                                <Col>Locked: {record.memory}</Col> :
                                                <Fragment><Col span={16}><Slider min={parseInt(toBytes(apps[record.aid].minimum_resources.memory))} max={parseInt(toBytes(apps[record.aid].maximum_resources.memory))} value={parseInt(memory)} step={toBytes("0.25G")} onChange={(value) => { setMemory(value) }} tipFormatter={memoryFormatter} /></Col><Col style={{ paddingLeft: '10px' }} span={5}><Typography>{formatBytes(memory, 2)}</Typography></Col></Fragment>}
                                        </Row>
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
            { isLoading ? <Spin /> :
                (instances === undefined ?
                    <div></div> :
                    (instances.length > 0 ?
                        <Table columns={columns} dataSource={instances} /> : <div style={{ textAlign: 'center' }}>No instances running</div>))}
        </Layout>
    )
}
