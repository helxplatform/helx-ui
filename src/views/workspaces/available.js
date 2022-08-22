import React, { useEffect, useState } from 'react'
import { Layout, Col, Spin } from 'antd'
import { withWorkspaceAuthentication, WorkspaceProtectedView } from './'
import { AppCard } from '../../components/workspaces'
import { NavigationTabGroup } from '../../components/workspaces/navigation-tab-group'
import { useApp, useEnvironment, useInstance, useWorkspacesAPI } from '../../contexts'
import { openNotificationWithIcon } from '../../components/notifications';
import { Breadcrumbs } from '../../components/layout'
import '../../components/workspaces/app-card.css'


export const AvailableView = withWorkspaceAuthentication(() => {
    const [apps, setApps] = useState();
    const [runningInstances, setRunningInstances] = useState();
    const [filteredApps, setFilteredApps] = useState();
    const { loadApps } = useApp();
    const { loadInstances } = useInstance();
    const [isLoading, setLoading] = useState(false);
    const breadcrumbs = [
        { text: 'Home', path: '/helx' },
        { text: 'Workspaces', path: '/helx/workspaces' },
        { text: 'Available', path: '/helx/workspaces/available' },
    ]

    useEffect(() => {
        document.title = `Workspaces · HeLx UI`
    }, [])

    useEffect(() => {
        const renderApp = async () => {
            setLoading(true)
            await loadApps()
                .then(r => {
                    setApps(r.data);
                })
                .catch(e => {
                    setApps({})
                    openNotificationWithIcon('error', 'Error', 'An error has occurred while loading apps.')
                })
        }
        renderApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const filterApps = async (a) => {
            await loadInstances()
                .then(r => {
                    setRunningInstances(r.data);
                })
                .catch(e => {
                    setRunningInstances([])
                })
            setLoading(false);
        }
        filterApps()
    }, [apps, loadInstances])

    useEffect(() => {
        if (runningInstances !== undefined && runningInstances.length >= 0) {
            let currApps = apps;
            let appUsage = new Map();
            for (let instance of runningInstances) {
                if (appUsage.has(instance.name)) {
                    appUsage.set(instance.name, appUsage.get(instance.name) + 1)
                }
                else {
                    appUsage.set(instance.name, 1)
                }
            }
            for (let currAppName in currApps) {
                // receive max instance count from tycho and disabled app launch button if necessary
                if (appUsage.has(currApps[currAppName].name) && appUsage.get(currApps[currAppName].name) === currApps[currAppName].count) {
                    currApps[currAppName].available = false;
                }
                else {
                    currApps[currAppName].available = true;
                }
            }
            setFilteredApps(currApps)
        }
    }, [runningInstances, apps])


    return (
        <Layout>
            <Breadcrumbs crumbs={breadcrumbs} />
            <NavigationTabGroup currentKey="available" />
            {isLoading ?
                <Spin size="large" /> :
                (filteredApps !== undefined ?
                    (Object.keys(filteredApps).length !== 0 ?
                        <div className="grid">{Object.keys(filteredApps).sort().map(appKey => <Col><AppCard key={appKey} {...filteredApps[appKey]} /></Col>)}</div>
                        : <div>No Apps Available</div>)
                    : <div></div>)}
        </Layout>
    )
})