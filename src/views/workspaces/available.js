import React, { useEffect, useState } from 'react'
import { Layout, Col, Spin } from 'antd'
import { AppCard } from '../../components/workspaces'
import { NavigationTabGroup } from '../../components/workspaces/navigation-tab-group'
import { useApp } from '../../contexts/app-context'
import { openNotificationWithIcon } from '../../components/notifications';
import { Breadcrumbs } from '../../components/layout'
import '../../components/workspaces/app-card.css'


export const AvailableView = () => {
    const [apps, setApps] = useState();
    const { loadApps } = useApp();
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
                    // setApps({"filebrowser":{"name":"File Browser","app_id":"filebrowser","description":"File Browser - a utility for browsing files through a web interface","detail":"File Browser provides a web interface for browsing files in a cloud environment.","docs":"https://filebrowser.org/","spec":"https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/filebrowser/docker-compose.yaml","minimum_resources":{"cpus":"1","gpus":0,"memory":"4000M"},"maximum_resources":{"cpus":"8","gpus":0,"memory":"64000M"}},"jupyter-ds":{"name":"Jupyter Data Science","app_id":"jupyter-ds","description":"Jupyter DataScience - A Jupyter notebook for exploring and visualizing data.","detail":"Includes R, Julia, and Python.","docs":"https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-datascience-notebook","spec":"https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/jupyter-ds/docker-compose.yaml","minimum_resources":{"cpus":"1","gpus":0,"memory":"4000M"},"maximum_resources":{"cpus":"8","gpus":0,"memory":"64000M"}},"octave":{"name":"Octave","app_id":"octave","description":"A scientific programming language largely compatible with MATLAB.","detail":"GNU Octave is a high-level language, primarily intended for numerical computations.","docs":"https://www.gnu.org/software/octave","spec":"https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/octave/docker-compose.yaml","minimum_resources":{"cpus":"1","gpus":0,"memory":"4000M"},"maximum_resources":{"cpus":"8","gpus":0,"memory":"64000M"}}})
                })
            setLoading(false);
        }
        renderApp();
    }, [loadApps])

    return (
        <Layout>
            <Breadcrumbs crumbs={breadcrumbs} />
            <NavigationTabGroup currentKey="available" />
            {isLoading ?
                <Spin size="large" /> :
                (apps !== undefined ?
                    (Object.keys(apps).length !== 0 ?
                        <div className="grid">{Object.keys(apps).sort().map(appKey => <Col><AppCard key={appKey} {...apps[appKey]} /></Col>)}</div>
                        : <div>No Apps Available</div>)
                    : <div></div>)}
        </Layout>
    )
}