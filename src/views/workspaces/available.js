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
                    setApps({ "cloud-top": { "name": "Cloud Top", "app_id": "cloud-top", "description": "CloudTop is a cloud native, browser accessible Linux desktop.", "detail": "A Ubuntu graphical desktop environment for experimenting with native applications in the cloud.", "docs": "https://helxplatform.github.io/cloudtop-docs/", "spec": "https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/cloud-top/docker-compose.yaml", "minimum_resources": { "cpus": "0.5", "gpus": 0, "memory": "2000M" }, "maximum_resources": { "cpus": "0.5", "gpus": 0, "memory": "2000M" } }, "filebrowser": { "name": "File Browser", "app_id": "filebrowser", "description": "File Browser - a utility for browsing files through a web interface", "detail": "File Browser provides a web interface for browsing files in a cloud environment.", "docs": "https://filebrowser.org/", "spec": "https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/filebrowser/docker-compose.yaml", "minimum_resources": { "cpus": "0.5", "gpus": 0, "memory": "2000M" }, "maximum_resources": { "cpus": "0.5", "gpus": 0, "memory": "2000M" } }, "jupyter-education": { "name": "Jupyter Data Science for Education", "app_id": "jupyter-education", "description": "Jupyter DataScience - A Jupyter notebook for exploring and visualizing data.", "detail": "Includes R, Julia, and Python.", "docs": "https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-datascience-notebook", "spec": "https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/jupyter-education/docker-compose.yaml", "minimum_resources": { "cpus": "0.5", "gpus": 0, "memory": "2000M" }, "maximum_resources": { "cpus": "0.5", "gpus": 0, "memory": "2000M" } } })
                })
        }
        renderApp();
    }, [lastLaunchedTime])

    useEffect(() => {
        const filterApps = async (a) => {
            const instance_result = await loadInstances()
                .then(r => {
                    setRunningInstances(r.data);
                })
                .catch(e => {
                    setRunningInstances([]);
                    setRunningInstances([{ "name": "File Browser", "docs": "https://filebrowser.org/", "aid": "filebrowser", "sid": "f19df050c20d4570919eb6b85d72a13d", "fqsid": "filebrowser", "workspace_name": "filebrowser", "creation_time": "8-20-2021 18:34:43", "cpus": 500.0, "gpus": 0, "memory": "2.0", "url": "https://eduhelx-dev.renci.org/private/filebrowser/bo7/f19df050c20d4570919eb6b85d72a13d/", "status": "ready" }, { "name": "Jupyter Data Science for Education", "docs": "https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-datascience-notebook", "aid": "jupyter-education", "sid": "d7fdddcab3df4488bceef069db7d0b84", "fqsid": "jupyter-education", "workspace_name": "jupyter-education", "creation_time": "8-20-2021 17:59:0", "cpus": 500.0, "gpus": 0, "memory": "2.0", "url": "https://eduhelx-dev.renci.org/private/jupyter-education/bo7/d7fdddcab3df4488bceef069db7d0b84/", "status": "ready" }])
                })
            setLoading(false);
        }
        filterApps();
    }, [apps])

    useEffect(() => {
        if (runningInstances !== undefined && runningInstances.length > 0) {
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
                if(appUsage.has(currApps[currAppName].name) && appUsage.get(currApps[currAppName].name) >= 1){
                    currApps[currAppName].available = false;
                }
                else{
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
                    (Object.keys(apps).length !== 0 ?
                        <div className="grid">{Object.keys(filteredApps).sort().map(appKey => <Col><AppCard key={appKey} {...apps[appKey]} /></Col>)}</div>
                        : <div>No Apps Available</div>)
                    : <div></div>)}
        </Layout>
    )
}