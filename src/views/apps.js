import React, { Fragment, useEffect, useState } from 'react'
import axios from 'axios';
import styled, { useTheme } from 'styled-components'
import { Container } from '../components/layout'
import { Title, Paragraph } from '../components/typography'
import { Card } from '../components/card'
import { List, ListGrid } from '../components/list'
import { Button } from '../components/button'
import { Icon } from '../components/icon'
import { Link } from '../components/link'
import { Input } from '../components/input';
import { Dropdown } from '../components/dropdown';
import { Slider } from '../components/slider';
import { Tab, TabGroup } from '../components/tab';
import { useEnvironment } from '../contexts';
import DataTable from 'react-data-table-component';
import { Notifications } from '@mwatson/react-notifications';

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
  & h5{
    padding-top: 3vh;
  }
`)

const RunningStatus = styled.div(({ theme }) => `
    height: 25px;
    width: 25px;
    background-color: #00ff00;
    border-radius: 50%;
    display: inline-block;
    margin-right: 5px;
`)

const Status = styled.div(({ theme }) => `
    margin-top: 10px;
`)

const StopButton = styled(Button)(({ theme }) => `
    background-color: #ff0000;
    color: white;
    padding: 10px;
`)

const AppHeader = styled.div(({ theme }) => `
    display: flex;
    justify-content: space-between;
`)

const AppLogo = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 10px;
  object-fit: scale-down;
`

const AppInfo = styled.div`
  width:80%;
`

const SpecsInput = styled(Input)`
  width: 15%;
  height: 30px;
`

const SpecName = styled.span`
  width: 6vw;
`

const Spec = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
`
const SpecContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`

const SpecMinMax = styled.span`
  width: 12vw;
`

const SliderMinMaxContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: 5vw;
  width: 50vw;
`

const AppCard = ({ name, app_id, description, detail, docs, status, minimum_resources, maximum_resources }) => {
  const theme = useTheme()
  const { helxAppstoreCsrfToken, helxAppstoreUrl } = useEnvironment();
  const [flipped, setFlipped] = useState(false)

  //create 3 state variables to store specs information
  const [currentMemory, setMemory] = useState(localStorage.getItem('currentMemory') === null ? minimum_resources.memory.substring(0, minimum_resources.memory.length - 1) : localStorage.getItem('currentMemory'));
  const [currentCpu, setCpu] = useState(localStorage.getItem('currentCpu') === null ? minimum_resources.cpus : localStorage.getItem('currentCpu'));
  const [currentGpu, setGpu] = useState(localStorage.getItem('currentGpu') === null ? minimum_resources.gpus : localStorage.getItem('currentGpu'));

  const toggleConfig = event => setFlipped(!flipped)

  //app can be launched here using axios to hit the /start endpoint
  const launchApp = () => {
    axios({
      method: 'POST',
      url: `${helxAppstoreUrl}/api/v1/instances/`,
      data: {
        app_id: app_id,
        cpus: currentCpu,
        memory: `${currentMemory}M`,
        gpu: currentGpu
      },
      headers: {
        "X-CSRFToken": helxAppstoreCsrfToken
      }
    })
    localStorage.setItem('currentCpu', currentCpu);
    localStorage.setItem('currentGpu', currentGpu);
    localStorage.setItem('currentMemory', currentMemory);
    alert(`Launching ${name} with ${currentCpu} CPU core, ${currentGpu} GPU Core and ${currentMemory} GB Memory.`)
  }

  const getLogoUrl = (app_id) => {
    return `https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/${app_id}/icon.png`
  }

  return (
    <Card style={{ minHeight: '300px', margin: `${theme.spacing.large} 0` }}>
      <Card.Header><AppHeader><b>{name}</b></AppHeader></Card.Header>
      <Relative>
        <Card.Body>
          <AppLogo src={'' + getLogoUrl(app_id)} />
          <AppInfo>
            <Paragraph>{description}</Paragraph>
            <Paragraph dense>{detail}</Paragraph>
            <Link to={docs}>App Documentation</Link>
          </AppInfo>
        </Card.Body>
        <ConfigSlider visible={flipped}>
          <h5>App Config</h5>
          <ul>
            <SpecContainer><SpecName>CPU</SpecName><SliderMinMaxContainer><SpecMinMax>Min: {minimum_resources.cpus} {minimum_resources.cpus > 1 ? 'Cores' : 'Core'}</SpecMinMax><Spec><b>{currentCpu}</b><Slider type="range" min={minimum_resources.cpus} max={maximum_resources.cpus} value={currentCpu} onChange={(e) => setCpu(e.target.value)} /></Spec><SpecMinMax>Max: {maximum_resources.cpus} {maximum_resources.cpus > 1 ? 'Cores' : 'Core'}</SpecMinMax></SliderMinMaxContainer></SpecContainer>
            <SpecContainer><SpecName>GPU</SpecName><SliderMinMaxContainer><SpecMinMax>Min: {minimum_resources.gpus} {minimum_resources.gpus > 1 ? 'Cores' : 'Core'}</SpecMinMax><Spec><b>{currentGpu}</b><Slider type="range" min={minimum_resources.gpus} max={maximum_resources.gpus} value={currentGpu} onChange={(e) => setGpu(e.target.value)} /></Spec><SpecMinMax>Max: {maximum_resources.gpus} {maximum_resources.gpus > 1 ? 'Cores' : 'Core'}</SpecMinMax></SliderMinMaxContainer></SpecContainer>
            <SpecContainer><SpecName>Memory</SpecName><SliderMinMaxContainer><SpecMinMax>Min: {minimum_resources.memory}</SpecMinMax><Spec><b>{currentMemory}</b><Slider type="range" min={minimum_resources.memory.substring(0, minimum_resources.memory.length - 1)} max={maximum_resources.memory.substring(0, maximum_resources.memory.length - 1)} value={currentMemory} onChange={(e) => setMemory(e.target.value)} /></Spec><SpecMinMax>Max: {maximum_resources.memory}</SpecMinMax></SliderMinMaxContainer></SpecContainer>
          </ul>
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

export const Apps = () => {
  const { helxAppstoreCsrfToken, helxAppstoreUrl } = useEnvironment();
  const [apps, setApps] = useState({});
  const [instances, setInstance] = useState([]);
  const [active, setActive] = useState('Available');

  // pass in app_id and stop instance
  const stopInstance = async (app_id) => {
    await axios({
      method: 'DELETE',
      url: `${helxAppstoreUrl}/api/v1/instances/${app_id}`,
      headers: {
        "X-CSRFToken": helxAppstoreCsrfToken
      }
    })
  }

  // iterate and stop all instances
  const stopAll = async () => {
    for await (let this_app of instances) {
      stopInstance(this_app.sid);
    }
  }

  const columns = [
    {
      name: 'App Name',
      selector: 'name',
      sortable: true
    },
    {
      key: "action",
      text: "Action",
      className: "action",
      width: 100,
      center: true,
      sortable: false,
      name: 'Connect',
      cell: (record) => {
        return (
          <Fragment>
            <button onClick={() => window.open(record.url, "_blank") }>
            <Icon icon="launch"></Icon>
            </button>
          </Fragment>
        );
      },
    },
    {
      name: 'Creation Time',
      selector: 'creation_time',
      sortable: true
    },
    {
      name: 'CPU',
      selector: 'cpus',
      sortable: true
    },
    {
      name: 'GPU',
      selector: 'gpus',
      sortable: true
    },
    {
      name: 'Memory',
      selector: 'memory',
      sortable: true
    }, {
      key: "action",
      text: "Action",
      className: "action",
      width: 100,
      center: true,
      sortable: false,
      name: <StopButton onClick={stopAll}>Stop All</StopButton>,
      cell: (record) => {
        return (
          <Fragment>
            <button onClick={() => stopInstance(record.sid)}>
            <Icon icon="close"></Icon>
            </button>
          </Fragment>
        );
      },
    },
  ]

  // handle tab bar switches
  useEffect(async () => {
    if (active === 'Available') {
      setInstance([]);
      const app_response = await axios({
        method: 'GET',
        url: `${helxAppstoreUrl}/api/v1/apps`,
        headers: {
          "X-CSRFToken": helxAppstoreCsrfToken
        }
      }).then(res => {
        setApps(res.data);
      })
    }
    else {
      setApps({});
      const instance_response = await axios({
        method: 'GET',
        url: `${helxAppstoreUrl}/api/v1/instances`,
        headers: {
          "X-CSRFToken": helxAppstoreCsrfToken
        }
      }).then(res => {
        setInstance(res.data)
      })
    }
  }, [active])

  return (
    <Container>
      <TabGroup>
        <Tab active={active === 'Available'} onClick={() => setActive('Available')}>Available</Tab>
        <Tab active={active === 'Active'} onClick={() => setActive('Active')}>Active</Tab>
      </TabGroup>
      {active === 'Available' && Object.keys(apps).length !== 0 && Object.keys(apps).sort().map(appKey => <AppCard key={appKey} {...apps[appKey]} />)}
      {active === 'Available' && Object.keys(apps).length === 0 && <Status>No apps available</Status>}
      {active === 'Active' && instances.length > 0 && < DataTable
        columns={columns}
        data={instances}
      />}
      {active === 'Active' && instances.length === 0 && <Status>No instances running</Status>}
    </Container>
  )
}
