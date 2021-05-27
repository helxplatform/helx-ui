import React, { Fragment, useEffect, useState } from 'react'
import { Layout, Col, Row, Spin } from 'antd'
import { AppCard } from '../../components/workspaces'
import { NavigationTabGroup } from '../../components/workspaces/navigation-tab-group'
import { useApp } from '../../contexts/app-context'
import { openNotificationWithIcon } from '../../components/notifications';

export const AvailableView = () => {
    const [apps, setApps] = useState();
    const { loadApps } = useApp();
    const [isLoading, setLoading] = useState(false);

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
            <NavigationTabGroup currentKey="available" />
            {isLoading ?
                <Spin size="large" /> :
                (apps != undefined ?
                    (Object.keys(apps).length !== 0 ?
                        <Row justify="space-around" wrap="true">{Object.keys(apps).sort().map(appKey => <Col span={4}><AppCard key={appKey} {...apps[appKey]} /></Col>)}</Row>
                        : <div>No Apps Available</div>)
                    : <div></div>)}
        </Layout>
    )
}