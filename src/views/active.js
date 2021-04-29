import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components'
import { Button } from '../components/button'
import { Container } from '../components/layout'
import { Icon } from '../components/icon'
import { useInstance } from '../contexts/instance-context';
import DataTable from 'react-data-table-component';
import { useNotifications } from '@mwatson/react-notifications'

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
    const { loadInstances, stopInstance } = useInstance();

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

    const column = [
        {
            name: 'App Name',
            selector: 'name',
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
        },
    ]

    return (
        <Container>
            { instances === undefined ? <div></div> : (instances.length > 0 ? <DataTable columns={column} data={instances} /> : <Status>No instances running</Status>)}
        </Container>
    )
}
