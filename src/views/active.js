import React, { Fragment, useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components'
import { Button } from '../components/button'
import { Container } from '../components/layout'
import { Icon } from '../components/icon'
import { LoadingSpinner } from '../components/spinner/loading-spinner';
import { useInstance } from '../contexts/instance-context';
import DataTable from 'react-data-table-component';
import { WorkSpaceTabGroup } from '../components/workspace/workspace-tab-group';
import { useNotifications } from '@mwatson/react-notifications';
import { formatMemory } from '../utils/memory-converter';

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
    const theme = useTheme()
    const [instances, setInstances] = useState();
    const [refresh, setRefresh] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const { addNotification } = useNotifications();
    const { loadInstances, stopInstance } = useInstance();

    useEffect(() => {
        const renderInstance = async () => {
            setLoading(true);
            await loadInstances()
                .then(r => {
                    setInstances(r.data);
                })
                .catch(e => {
                    setInstances([]);
                    addNotification({ type: 'error', text: `An error has occurred while loading instances.` })
                })
            setLoading(false);
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
                addNotification({ type: 'error', text: `An error has occurred while stopping instance ${app_id}.` })
            })
    }

    const stopAllInstanceHandler = async () => {
        setLoading(true);
        for await (let this_app of instances) {
            stopInstanceHandler(this_app.sid);
        }
        setLoading(false);
    }

    const column = [
        {
            name: 'App Name',
            selector: 'name',
            sortable: true,
            grow: 2
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
            sortable: true,
            grow: 2
        },
        {
            name: 'CPU',
            selector: (row) => { return row.cpus / 1000 },
            sortable: true
        },
        {
            name: 'GPU',
            selector: (row) => { return row.gpus / 1000 },
            sortable: true
        },
        {
            name: 'Memory',
            // Note: Memory in the response does not contain unit, but it matches the one when we post them (MB by default).
            selector: (row) => { return formatMemory(row.memory + 'M') },
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
            <WorkSpaceTabGroup tab="active" />
            { isLoading ? <LoadingSpinner style={{ margin: theme.spacing.extraLarge }} /> :
                (instances === undefined ? <div></div> : (instances.length > 0 ? <DataTable columns={column} data={instances} /> : <Status>No instances running</Status>))}
        </Container>
    )
}
