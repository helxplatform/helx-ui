import React, { Fragment, useEffect, useState } from 'react'
import { Layout, Col, Row, Spin } from 'antd'
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
                })
            setLoading(false);
        }
        renderApp();
    }, [])

    return (
        <Layout>
            <Breadcrumbs crumbs={breadcrumbs} />
            <NavigationTabGroup currentKey="available" />
            {isLoading ?
                <Spin size="large" /> :
                (apps != undefined ?
                    (Object.keys(apps).length !== 0 ?
                        <div className="grid">{Object.keys(apps).sort().map(appKey => <Col><AppCard key={appKey} {...apps[appKey]} /></Col>)}</div>
                        : <div>No Apps Available</div>)
                    : <div></div>)}
        </Layout>
    )
}