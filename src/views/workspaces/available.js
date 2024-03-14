import React, { useEffect, useMemo, useState } from 'react'
import { Layout, Col, Spin } from 'antd'
import { withWorkspaceAuthentication, WorkspaceProtectedView } from './'
import { withView } from '../'
import { AppCard } from '../../components/workspaces'
import { NavigationTabGroup } from '../../components/workspaces/navigation-tab-group'
import { useActivity, useApp, useEnvironment, useInstance, useWorkspacesAPI } from '../../contexts'
import { openNotificationWithIcon } from '../../components/notifications';
import { Breadcrumbs } from '../../components/layout'
import '../../components/workspaces/app-card.css'

export const AvailableView = withView(withWorkspaceAuthentication(() => {
    const { api } = useWorkspacesAPI()
    const { appSpecs: apps } = useActivity()
    const [runningInstances, setRunningInstances] = useState();
    const [filteredApps, setFilteredApps] = useState();
    // const { loadInstances } = useInstance();
    const breadcrumbs = [
        { text: 'Home', path: '/helx' },
        { text: 'Workspaces', path: '/helx/workspaces' },
        { text: 'Available', path: '/helx/workspaces/available' },
    ]

    const isLoading = useMemo(() => !apps || !runningInstances, [apps, runningInstances])

    useEffect(() => {
        const filterApps = async (a) => {
            try {
                const instances = await api.getAppInstances()
                setRunningInstances(instances)
            } catch (e) {
                setRunningInstances([])
            }
        }
        filterApps()
    }, [apps, api])

    useEffect(() => {
        if (apps !== null && runningInstances !== undefined && runningInstances.length >= 0) {
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
                    (Object.keys(filteredApps).length !== 0 ? (
                        <div className="grid">
                            {
                                Object.keys(filteredApps).sort().map(appKey => (
                                    <Col key={ appKey }><AppCard key={appKey} {...filteredApps[appKey]} /></Col>
                                ))
                            }
                        </div>
                    ) : <div>No Apps Available</div>)
                    : <div></div>)}
        </Layout>
    )
}), { title: "Workspaces" })