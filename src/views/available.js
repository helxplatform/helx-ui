import React, { Fragment, useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components'
import { Button } from '../components/button'
import { Card } from '../components/card'
import { Container } from '../components/layout'
import { Link } from '../components/link'
import { Icon } from '../components/icon'
import { Slider } from '../components/slider';
import { Paragraph } from '../components/typography'
import { useApp } from '../contexts/app-context';
import { useEnvironment } from '../contexts';
import { useNotifications } from '@mwatson/react-notifications'
import DataTable from 'react-data-table-component';

const AppHeader = styled.div(({ theme }) => `
    display: flex;
    justify-content: space-between;
`)

const AppContainer = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  justify-content: space-around;
`

const Relative = styled.div`
  position: relative;
  flex: 1;
  & ${Card.Body} {
    z-index: -1;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-around;
  }
  &:nth-child(1) { z-index: -1; }
  &:nth-child(2) { z-index: -2; }
  &:nth-child(3) { z-index: -3; }
`

const ConfigSlider = styled(Card.Body)(({ theme, visible }) => `
  height: 100%;
  flex-direction: column;
  transform: translateY(${visible ? '0' : '100%'});
  background-color: ${visible ? theme.color.black : theme.color.grey.dark};
  transition: transform 250ms, background-color 750ms;
  color: ${theme.color.white};
  & * {
    font-family: monospace;
  }
  & a {
    color: ${theme.color.primary.light};
    transition: filter 250ms;
  }
  & a:hover {
    filter: brightness(0.75);
  }
  & .actions {
    position: absolute;
    right: ${theme.spacing.medium};
    bottom: ${theme.spacing.medium};
    display: flex;
    justify-content: flex-end;
    gap: ${theme.spacing.medium};
  }

`)

const AppLogo = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 10px;
  object-fit: scale-down;
`

const AppInfo = styled.div`
  margin-left: 20px;
`

const SpecName = styled.span`
  width: 5vw;
`

const Spec = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
`
const SpecContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0px;
  width: 100%;
`
const SpecDefaultText = styled.span`
  padding-right: 10vw;
`

const SpecMinMax = styled.span`
  width: 8.5vw;
`

const SliderMinMaxContainer = styled.span`
  display: flex;
  align-items: center;
`

const Status = styled.div`
  padding-top: 15vh;
  text-align: center;
`

const AppCard = ({ name, app_id, description, detail, docs, status, minimum_resources, maximum_resources }) => {
    const theme = useTheme()
    const { addNotification } = useNotifications();
    const { launchApp } = useApp();
    const { helxAppstoreCsrfToken, helxAppstoreUrl } = useEnvironment();
    const [flipped, setFlipped] = useState(false)

    //create 3 state variables to store specs information
    const [currentMemory, setMemory] = useState(localStorage.getItem('currentMemory') === null && localStorage.getItem('currentMemory') < minimum_resources.memory.substring(0, minimum_resources.memory.length - 1) ? minimum_resources.memory.substring(0, minimum_resources.memory.length - 1) : localStorage.getItem('currentMemory'));
    const [currentCpu, setCpu] = useState(localStorage.getItem('currentCpu') === null && localStorage.getItem('currentCpu') < minimum_resources.cpus ? minimum_resources.cpus : localStorage.getItem('currentCpu'));
    const [currentGpu, setGpu] = useState(localStorage.getItem('currentGpu') === null && localStorage.getItem('currentGpu') < minimum_resources.gpus ? minimum_resources.gpus : localStorage.getItem('currentGpu'));

    const toggleConfig = event => setFlipped(!flipped)

    //app can be launched here using axios to hit the /start endpoint
    const appLauncher = () => {
        launchApp()
            .then(res => {
                addNotification({ type: 'success', text: 'Launching app successful.' })
            }).catch(e => {
                addNotification({ type: 'error', text: 'Error occurs when launching apps. Please try again!' })
            })
        localStorage.setItem('currentCpu', currentCpu);
        localStorage.setItem('currentGpu', currentGpu);
        localStorage.setItem('currentMemory', currentMemory);
    }

    const getLogoUrl = (app_id) => {
        return `https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/${app_id}/icon.png`
    }

    return (
        <Card style={{ minHeight: '350px', margin: `${theme.spacing.medium}` }}>
            <Card.Header><AppHeader><b>{name} {flipped ? "- App Config" : <span />}</b></AppHeader></Card.Header>
            <Relative>
                <Card.Body>
                    <AppLogo src={'' + getLogoUrl(app_id)} />
                    <AppInfo>
                        <Paragraph>{description}</Paragraph>
                        <Paragraph dense>{detail}</Paragraph>
                        <Link to={docs}>About {name}</Link>
                    </AppInfo>
                </Card.Body>
                <ConfigSlider visible={flipped}>
                    <div className="specs">
                        <SpecContainer><SpecName>CPU</SpecName><SliderMinMaxContainer><SpecMinMax>Min: {minimum_resources.cpus} {minimum_resources.cpus > 1 ? 'Cores' : 'Core'}</SpecMinMax><Spec><b>{currentCpu}</b><Slider type="range" min={minimum_resources.cpus} max={maximum_resources.cpus} step="1" value={currentCpu} onChange={(e) => setCpu(e.target.value)} /></Spec><SpecMinMax>Max: {maximum_resources.cpus} {maximum_resources.cpus > 1 ? 'Cores' : 'Core'}</SpecMinMax></SliderMinMaxContainer></SpecContainer>
                        <SpecContainer><SpecName>GPU</SpecName>{minimum_resources.gpus === maximum_resources.gpus ? <SpecDefaultText>Default Setting: {minimum_resources.gpus} Core</SpecDefaultText> : <SliderMinMaxContainer><SpecMinMax>Min: {minimum_resources.gpus} {minimum_resources.gpus > 1 ? 'Cores' : 'Core'}</SpecMinMax><Spec><b>{currentGpu}</b><Slider type="range" min={minimum_resources.gpus} max={maximum_resources.gpus} step="1" value={currentGpu} onChange={(e) => setGpu(e.target.value)} /></Spec><SpecMinMax>Max: {maximum_resources.gpus} {maximum_resources.gpus > 1 ? 'Cores' : 'Core'}</SpecMinMax></SliderMinMaxContainer>}</SpecContainer>
                        <SpecContainer><SpecName>Memory</SpecName><SliderMinMaxContainer><SpecMinMax>Min: {minimum_resources.memory.substring(0, minimum_resources.memory.length - 1) / 1024} G</SpecMinMax><Spec><b>{currentMemory}</b><Slider type="range" min={minimum_resources.memory.substring(0, minimum_resources.memory.length - 1) / 1024} max={maximum_resources.memory.substring(0, maximum_resources.memory.length - 1) / 1024} step="1.25" value={currentMemory} onChange={(e) => setMemory(e.target.value)} /></Spec><SpecMinMax>Max: {maximum_resources.memory.substring(0, maximum_resources.memory.length - 1) / 1024} G</SpecMinMax></SliderMinMaxContainer></SpecContainer>
                    </div>
                    <div className="actions">
                        <Button small variant="success" onClick={() => { launchApp(); toggleConfig(); }} style={{ width: '150px' }}>
                            <Icon icon="check" fill="#eee" /> Confirm
              </Button>
                    </div>
                </ConfigSlider>
            </Relative>
            <Card.Footer style={{
                display: 'flex',
                justifyContent: 'flex-end',
                transition: 'background-color 400ms'
            }}>
                <Button small variant={flipped ? 'danger' : 'info'} onClick={toggleConfig} style={{ width: '150px' }}>
                    <Icon icon={flipped ? 'close' : 'launch'} fill="#eee" />{flipped ? 'Cancel' : 'Launch App'}
                </Button>
            </Card.Footer>
        </Card>
    )
}

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
                <AppContainer>{Object.keys(apps).sort().map(appKey => <AppCard key={appKey} {...apps[appKey]} />)} : <Status>No apps available</Status></AppContainer> : <Status>No apps available</Status>) : <div></div>}
        </Container>
    )
}