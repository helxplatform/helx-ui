import React, { useEffect, useState } from 'react'
import { Layout, Col, Spin } from 'antd'
import { AppCard } from '../../components/workspaces'
import { NavigationTabGroup } from '../../components/workspaces/navigation-tab-group'
import { useApp, useInstance } from '../../contexts'
import { openNotificationWithIcon } from '../../components/notifications';
import { Breadcrumbs } from '../../components/layout'
import '../../components/workspaces/app-card.css'


export const AvailableView = () => {
    const [apps, setApps] = useState();
    const [runningInstances, setRunningInstances] = useState();
    const [filteredApps, setFilteredApps] = useState();
    const { lastLaunchedTime, loadApps } = useApp();
    const { loadInstances } = useInstance();
    const [isLoading, setLoading] = useState(false);
    const breadcrumbs = [
        { text: 'Home', path: '/helx' },
        { text: 'Workspaces', path: '/helx/workspaces' },
        { text: 'Available', path: '/helx/workspaces/available' },
    ]

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
    }, [lastLaunchedTime])

    useEffect(() => {
        const filterApps = async (a) => {
            // timeout 1 second before we load instance list
            const instance_result = await loadInstances()
                .then(r => {
                    setRunningInstances(r.data);
                })
                .catch(e => {
                    setRunningInstances([])
                })
            setLoading(false);
        }
        setTimeout(filterApps(), 1000);
    }, [apps])

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
                // will receive max limit from tycho, set as 1 for now
                if (appUsage.has(currApps[currAppName].name)) {
                    currApps[currAppName].available = false;
                }
                else {
                    currApps[currAppName].available = true;
                }
            }
            setFilteredApps(currApps)
        }
    }, [runningInstances])


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
}