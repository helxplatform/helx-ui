import React, { Fragment, useEffect, useState } from 'react';
import { Button, Layout, Spin } from 'antd';
import { DeleteOutlined, RightCircleOutlined } from '@ant-design/icons';
import { NavigationTabGroup } from '../../components/workspaces/navigation-tab-group';
import { openNotificationWithIcon } from '../../components/notifications';
import { useInstance } from '../../contexts/instance-context';
import DataTable from 'react-data-table-component';
import { Modal } from "../../components/modal/Modal";
import { Breadcrumbs } from '../../components/layout'
import TimeAgo from 'timeago-react';

export const ActiveView = () => {
    const [instances, setInstances] = useState();
    const [refresh, setRefresh] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const { loadInstances, stopInstance, updateInstance } = useInstance();
    const [modalOpen, setModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState("");
    const workspaceN = React.createRef();
    const cpu = React.createRef();
    const memory = React.createRef();
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
    const updateOne = async (event, record, theWorkSpace, theCpu, theMemory) => {
        await updateInstance(record, theWorkSpace, theCpu, theMemory)
            .then(res => {
                if (res.data.status === "success") {
                    openNotificationWithIcon('success', 'Success', `Instance has been successfully updated ${record.name}.`)
                    setRefresh(!refresh);
                }
            }).catch(e => {
                openNotificationWithIcon('error', 'Error', `Error occured when updating instance ${record.name}.`)
            })
    };

    const handleModalOpen = (e, sid) => {
        setCurrentRecord(sid);
        setModalOpen(true);
    };

    const validateResources = (e) => {
        const name = e.target.name;
        const value = parseInt(e.target.value);
        if (name === "cpu") {
            if (value < 1 || value > 8 || !(/^\d+$/.test(e.target.value))) {
                cpu.current.value = "";
                openNotificationWithIcon('error', 'Error', `CPU cannot exceed 8 cores.`)
            }
        }
        if (name === "memory") {
            if (value < 1 || value > 64000 || !(/^\d+$/.test(e.target.value))) {
                memory.current.value = "";
                openNotificationWithIcon('error', 'Error', `Memory cannot exceed 64000 Mi.`)
            }
        };
    }

    const column = [
        {
            name: 'App Name',
            selector: 'name',
            sortable: true,
            grow: 2
        },
        {
            name: 'Workspace',
            selector: 'workspace_name',
            sortable: true
        },
        {
            key: "action",
            text: "Action",
            className: "action",
            width: 100,
            center: true,
            sortable: false,
            name: 'Connect',
            cell: (record) => {
                return (
                    <Fragment>
                        <button onClick={() => window.open(record.url, "_blank")}>
                            <RightCircleOutlined />
                        </button>
                    </Fragment>
                );
            },
        },
        {
            name: 'Creation Time',
            selector: 'creation_time',
            sortable: true,
            grow: 2,
            cell: (record) => {
                return(
                    <Fragment>
                        <TimeAgo datetime={record.creation_time} />
                    </Fragment>
                )
            }
        },
        {
            name: 'CPU',
            selector: (row) => { return row.cpus / 1000 + ' Core' + (row.cpus / 1000 > '1' ? 's' : '') },
            sortable: true
        },
        {
            name: 'GPU',
            selector: (row) => { return row.gpus / 1000 + ' Core' + (row.gpus / 1000 > '1' ? 's' : '') },
            sortable: true
        },
        {
            name: 'Memory',
            // Note: Memory in the response does not contain unit, but it matches the one when we post them (MB by default).
            selector: (row) => { return row.memory + ' GB' },
            sortable: true
        }, {
            key: "action",
            text: "Action",
            className: "action",
            width: 100,
            center: true,
            sortable: false,
            name: <Button type="primary" danger onClick={stopAllInstanceHandler}>Stop All</Button>,
            cell: (record) => {
                return (
                    <Fragment>
                        <button onClick={() => stopInstanceHandler(record.sid)}>
                            <DeleteOutlined />
                        </button>
                    </Fragment>
                );
            },
        }, {
            key: "action",
            text: "Action",
            className: "action",
            width: 100,
            center: true,
            sortable: false,
            name: "Update",
            cell: (record) => {
                return (
                    <Fragment>
                        <button type="button" value="update" onClick={(e) => handleModalOpen(e, record.sid)}>Update</button>
                        {modalOpen ?
                            <Modal>
                                <Modal.Content>
                                    <Modal.FormGroup>
                                        <Modal.FormButton style={{ top: "20px" }} type="button" className="close" onClick={() => setModalOpen(false)}>&times;</Modal.FormButton>
                                        <Modal.FormLabel>Workspace Name</Modal.FormLabel>
                                        <Modal.FormInput
                                            ref={workspaceN}
                                            type="text"
                                            name="workspace_name"
                                            placeholder="work instance 1 (Optional)"
                                            value={workspaceN.current}
                                        />
                                        <Modal.FormLabel key="formKey">CPU in cores</Modal.FormLabel>
                                        <Modal.FormInput
                                            ref={cpu}
                                            type="text"
                                            name="cpu"
                                            placeholder="1, 2... (Optional)"
                                            value={cpu.current}
                                            onChange={(e) => validateResources(e)}
                                        />
                                        <Modal.FormLabel key="formKey">Memory in Mi</Modal.FormLabel>
                                        <Modal.FormInput
                                            ref={memory}
                                            type="text"
                                            name="memory"
                                            placeholder="1000, 2500... (Optional)"
                                            value={memory.current}
                                            onChange={(e) => validateResources(e)}
                                        />
                                        <Modal.FormButton style={{ bottom: "20px" }} type="submit" value="Submit" onClick={(e) => updateOne(
                                            e,
                                            currentRecord,
                                            workspaceN.current.value,
                                            cpu.current.value,
                                            memory.current.value)
                                        }>Apply</Modal.FormButton>
                                    </Modal.FormGroup>
                                </Modal.Content>
                            </Modal>
                            : <div></div>
                        }
                    </Fragment>
                );
            },
        },
    ]

    return (
        <Layout>
            <Breadcrumbs crumbs={breadcrumbs} />
            <NavigationTabGroup currentKey="active" />
            { isLoading ? <Spin /> :
                (instances === undefined ?
                    <div></div> :
                    (instances.length > 0 ?
                        <DataTable columns={column} data={instances} /> : <div>No instances running</div>))}
        </Layout>
    )
}
