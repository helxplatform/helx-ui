import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components'
import { Button } from '../components/button'
import { Container } from '../components/layout'
import { Icon } from '../components/icon'
import { useInstance } from '../contexts/instance-context';
import DataTable from 'react-data-table-component';
import { useNotifications } from '@mwatson/react-notifications'
import {Modal} from "../components/modal/Modal";

const StopButton = styled(Button)(({ theme }) => `
    background-color: #ff0000;
    color: white;
    padding: 10px;
`)

const Status = styled.div`
  padding-top: 15vh;
  text-align: center;
`

export const Active = () => {
    const [instances, setInstances] = useState();
    const [refresh, setRefresh] = useState(false);
    const { addNotification } = useNotifications();
    const { loadInstances, stopInstance, updateInstance } = useInstance();
    const [modalOpen, setModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState("");
    const workspaceN = React.createRef();
    const cpu = React.createRef();
    const memory = React.createRef();

    useEffect(() => {
        const renderInstance = async () => {
            await loadInstances()
                .then(r => {
                    setInstances(r.data);
                })
                .catch(e => {
                    setInstances([])
                })
        }
        renderInstance();
    }, [refresh])

    const stopInstanceHandler = async (app_id) => {
        await stopInstance(app_id)
            .then(r => {
                setRefresh(!refresh);
                addNotification({ type: 'info', text: `Instance ${app_id} is stopped.` })
            })
            .catch(e => {
                addNotification({ type: 'error', text: `Error occurs when stopping instance ${app_id}.` })
            })
    }

    const stopAllInstanceHandler = async () => {
        for await (let this_app of instances) {
            stopInstanceHandler(this_app.sid);
        }
    }

    //Update a running Instance.
    const updateOne = async (event, record, theWorkSpace, theCpu, theMemory) => {
        await updateInstance(record, theWorkSpace, theCpu, theMemory)
            .then(res => {
                if (res.data.status === "success") {
                    addNotification({type: 'success', text: `Instance has been successfully updated ${record}`})
                    setRefresh(!refresh);
                }
            }).catch(e => {
                addNotification({ type: 'error', text: `Error occured when updating instance ${record.sid}` })
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
            if (value < 1 || value > 8) {
                cpu.current.value = "";
                addNotification({ type: 'error', text: 'CPU cannot exceed 8 cores.' })
            }
        }
        if (name === "memory") {
            if (value < 1 || value > 64000) {
                memory.current.value = "";
                addNotification({ type: 'error', text: 'Memory cannot exceed 64000 Mi.'})
            }
        }
    };

    const column = [
        {
            name: 'App Name',
            selector: 'name',
            sortable: true
        },
        {
            name: 'WorkSpace Name',
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
                            <Icon icon="launch"></Icon>
                        </button>
                    </Fragment>
                );
            },
        },
        {
            name: 'Creation Time',
            selector: 'creation_time',
            sortable: true
        },
        {
            name: 'CPU',
            selector: 'cpus',
            sortable: true
        },
        {
            name: 'GPU',
            selector: 'gpus',
            sortable: true
        },
        {
            name: 'Memory',
            selector: 'memory',
            sortable: true
        }, {
            key: "action",
            text: "Action",
            className: "action",
            width: 100,
            center: true,
            sortable: false,
            name: <StopButton onClick={stopAllInstanceHandler}>Stop All</StopButton>,
            cell: (record) => {
                return (
                    <Fragment>
                        <button onClick={() => stopInstanceHandler(record.sid)}>
                            <Icon icon="close"></Icon>
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
                                        <Modal.FormButton style={{top: "20px"}} type="button" className="close" onClick={() => setModalOpen(false)}>&times;</Modal.FormButton>
                                        <Modal.FormLabel>Workspace Name</Modal.FormLabel>
                                        <Modal.FormInput
                                            ref={workspaceN}
                                            type="text"
                                            name="workspace_name"
                                            placeholder="work instance 1"
                                            value={workspaceN.current}
                                        />
                                        <Modal.FormLabel key="formKey">CPU in cores</Modal.FormLabel>
                                        <Modal.FormInput
                                            ref={cpu}
                                            type="text"
                                            name="cpu"
                                            placeholder="1, 2...."
                                            value={cpu.current}
                                            onChange={(e) => validateResources(e)}
                                        />
                                        <Modal.FormLabel key="formKey">Memory in Mi</Modal.FormLabel>
                                        <Modal.FormInput
                                            ref={memory}
                                            type="text"
                                            name="memory"
                                            placeholder="1000, 2500...."
                                            value={memory.current}
                                            onChange={(e) => validateResources(e)}
                                        />
                                        <Modal.FormButton style={{bottom: "20px"}} type="submit" value="Submit" onClick={(e) => updateOne(
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
        <Container>
            { instances === undefined ? <div></div> : (instances.length > 0 ? <DataTable columns={column} data={instances} /> : <Status>No instances running</Status>)}
        </Container>
    )
}
