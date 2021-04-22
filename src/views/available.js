import React, { useEffect, useState } from 'react';
import styled from 'styled-components'
import { Container } from '../components/layout'
import { useApp } from '../contexts/app-context';
import { AppCard } from '../components/app';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  justify-content: space-around;
`

const AppContainer = styled.div(({ theme }) => `
  width: 40vw;
  margin: ${theme.spacing.medium};
`)

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
                <GridContainer>{Object.keys(apps).sort().map(appKey => <AppContainer><AppCard key={appKey} {...apps[appKey]} /></AppContainer>)}</GridContainer> : <Status>No apps available</Status>) : <div></div>}
        </Container>
    )
}