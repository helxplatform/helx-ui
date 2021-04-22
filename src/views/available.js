import React, { useEffect, useState } from 'react';
import styled from 'styled-components'
import { Container } from '../components/layout'
import { useApp } from '../contexts/app-context';
import { AppCard } from '../components/app';

const AppContainer = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  justify-content: space-around;
`
const Status = styled.div`
  padding-top: 15vh;
  text-align: center;
`

export const Available = () => {
    const [apps, setApps] = useState();
    const { loadApps } = useApp();

    useEffect(() => {
        const renderApp = async () => {
            await loadApps()
                .then(r => {
                    setApps(r.data);
                })
                .catch(e => {
                    setApps({})
                })
        }
        renderApp();
    }, [])

    return (
        <Container>
            {apps !== undefined ? (Object.keys(apps).length !== 0 ?
                <AppContainer>{Object.keys(apps).sort().map(appKey => <AppCard key={appKey} {...apps[appKey]} />)}</AppContainer> : <Status>No apps available</Status>) : <div></div>}
        </Container>
    )
}