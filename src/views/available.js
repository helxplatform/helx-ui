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
                    setApps({"filebrowser":{"name":"File Browser","app_id":"filebrowser","description":"File Browser - a utility for browsing files through a web interface","detail":"File Browser provides a web interface for browsing files in a cloud environment.","docs":"https://filebrowser.org/","spec":"https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/filebrowser/docker-compose.yaml","minimum_resources":{"cpus":"1","gpus":0,"memory":"4000M"},"maximum_resources":{"cpus":"8","gpus":0,"memory":"64000M"}},"jupyter-ds":{"name":"Jupyter Data Science","app_id":"jupyter-ds","description":"Jupyter DataScience - A Jupyter notebook for exploring and visualizing data.","detail":"Includes R, Julia, and Python.","docs":"https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-datascience-notebook","spec":"https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/jupyter-ds/docker-compose.yaml","minimum_resources":{"cpus":"1","gpus":0,"memory":"4000M"},"maximum_resources":{"cpus":"8","gpus":0,"memory":"64000M"}}})
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