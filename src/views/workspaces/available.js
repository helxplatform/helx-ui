import React, { Fragment, useEffect, useState } from 'react';
import { Card, Avatar, Grid, Layout, Spin } from 'antd';
import { useApp } from '../../contexts/app-context';

const { Meta } = Card;

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
                })
            setLoading(false);
        }
        renderApp();
    }, [])

    return (
        <Fragment>
            {isLoading ? <Spin size="large" /> : (apps != undefined ? (Object.keys(apps).length !== 0 ? <Grid>{Object.keys(apps).sort().map(appKey => <Meta>test</Meta>)}</Grid> : <div>No Apps Available</div>) : <div></div>)}
        </Fragment>
    )
}