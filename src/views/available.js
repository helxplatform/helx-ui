import React, { useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components'
import { Container } from '../components/layout'
import { useApp } from '../contexts/app-context';
import { AppCard } from '../components/app';
import { WorkSpaceTabGroup } from '../components/workspace/workspace-tab-group';
import { LoadingSpinner } from '../components/spinner/loading-spinner';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: auto;
  justify-content: space-around;
  @media screen and (min-width: 992px) {
    grid-template-columns: repeat(2, auto);
    grid-gap: 2vw;
}
`

const AppContainer = styled.div(({ theme }) => `
  width: 90vw;
  margin: ${theme.spacing.medium};
  @media screen and (min-width: 992px) {
    min-width: 20%;
    max-width: 600px;
}
`)

const Status = styled.div`
  padding-top: 15vh;
  text-align: center;
`

export const Available = () => {
    const theme = useTheme();
    const [apps, setApps] = useState();
    const [isLoading, setLoading] = useState(false);
    const { loadApps } = useApp();

    useEffect(() => {
        const renderApp = async () => {
            setLoading(true)
            await loadApps()
                .then(r => {
                    setApps(r.data);
                })
                .catch(e => {
                    setApps({"filebrowser":{"name":"File Browser","app_id":"filebrowser","description":"File Browser - a utility for browsing files through a web interface","detail":"File Browser provides a web interface for browsing files in a cloud environment.","docs":"https://filebrowser.org/","spec":"https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/filebrowser/docker-compose.yaml","minimum_resources":{"cpus":"1","gpus":0,"memory":"4000M"},"maximum_resources":{"cpus":"8","gpus":0,"memory":"64000M"}},"jupyter-ds":{"name":"Jupyter Data Science","app_id":"jupyter-ds","description":"Jupyter DataScience - A Jupyter notebook for exploring and visualizing data.","detail":"Includes R, Julia, and Python.","docs":"https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-datascience-notebook","spec":"https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/jupyter-ds/docker-compose.yaml","minimum_resources":{"cpus":"1","gpus":0,"memory":"4000M"},"maximum_resources":{"cpus":"8","gpus":0,"memory":"64000M"}},"octave":{"name":"Octave","app_id":"octave","description":"A scientific programming language largely compatible with MATLAB.","detail":"GNU Octave is a high-level language, primarily intended for numerical computations.","docs":"https://www.gnu.org/software/octave","spec":"https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/octave/docker-compose.yaml","minimum_resources":{"cpus":"1","gpus":0,"memory":"4000M"},"maximum_resources":{"cpus":"8","gpus":0,"memory":"64000M"}}})
                })
            setLoading(false);
        }
        renderApp();
    }, [])

    return (
        <Container>
            <WorkSpaceTabGroup tab="available" />
            { isLoading ? <LoadingSpinner style={{ margin: theme.spacing.extraLarge }} /> :
                (apps !== undefined ? (Object.keys(apps).length !== 0 ?
                    <GridContainer>{Object.keys(apps).sort().map(appKey => <AppContainer><AppCard key={appKey} {...apps[appKey]} /></AppContainer>)}</GridContainer> : <Status>No apps available</Status>) : <div></div>)}
        </Container>
    )
}