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
import { useEnvironment } from '../contexts'

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
  }
  &:nth-child(1) { z-index: -1; }
  &:nth-child(2) { z-index: -2; }
  &:nth-child(3) { z-index: -3; }
`

const ConfigSlider = styled(Card.Body)(({ theme, visible }) => `
  height: 100%;
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

const RunningStatus = styled.div(({ theme }) => `
    height: 25px;
    width: 25px;
    background-color: #00ff00;
    border-radius: 50%;
    display: inline-block;
    margin-right: 5px;
`)

const Status = styled.div(({ theme }) => `
    display: flex;
    align-items: center;
    color: black;
`)

const StopButton = styled(Button)(({ theme }) => `
    background-color: #ff0000;
    color: white;
`)

const AppHeader = styled.div(({ theme }) => `
    display: flex;
    justify-content: space-between;
`)

const SpecsInput = styled(Input)`
  width: 15%;
  height: 30px;
`

const AppCard = ({ name, app_id, description, detail, docs, status, cpu, gpu, memory }) => {
  const theme = useTheme()
  const helxAppstoreUrl = useEnvironment().helxAppstoreUrl;
  const [flipped, setFlipped] = useState(false)

  //create 3 state variables to store specs information
  const [currentMemory, setMemory] = useState(memory.substring(0, memory.length - 1));
  const [currentCpu, setCpu] = useState(cpu);
  const [currentGpu, setGpu] = useState(gpu);

  const toggleConfig = event => setFlipped(!flipped)

  //app can be launched here using axios to hit the /start endpoint
  const launchApp = event => {
    axios({
      method: 'GET',
      url: `${helxAppstoreUrl}/service/`,
      params: {
        app_id: app_id,
        cpu: currentCpu,
        memory: currentMemory,
        gpu: currentGpu
      }
    })
    alert(`Launching ${name} with ${currentCpu} CPU core, ${currentGpu} GPU Core and ${currentMemory} GB Memory.`)
  }
  const gpuSpecs = [];
  const cpuSpecs = []
  const memorySpecs = [];
  for (let i = 0; i <= 4; i += 0.25) {
    if (i % 1 == 0) gpuSpecs.push(i);
    cpuSpecs.push(i);
    memorySpecs.push(i);
  }

  const handleMemoryChange = event => {
    setMemory(event.target.value);
  }

  const handleCpuChange = event => {
    setCpu(event.target.value);
  }

  const handleGpuChange = event => {
    setGpu(event.target.value);
  }


  return (
    <Card style={{ minHeight: '300px', margin: `${theme.spacing.large} 0` }}>
      <Card.Header><AppHeader>{name} {status === "Running" ? <Status class><RunningStatus />Running</Status> : <span />}</AppHeader></Card.Header>
      <Relative>
        <Card.Body>
          <Paragraph>{description}</Paragraph>
          <Paragraph dense>{detail}</Paragraph>
          <Link to={docs}>App Documentation</Link>
        </Card.Body>
        <ConfigSlider visible={flipped}>
          <h5>App Config</h5>
          <ul>
            <li>CPU<Slider type="range" min={cpu} max="8" value={currentCpu} onChange={(e) => setCpu(e.target.value)} /> {currentCpu}</li>
            <li>GPU<Slider type="range" min={gpu} max="8" value={currentGpu} onChange={(e) => setGpu(e.target.value)} /> {currentGpu}</li>
            <li>Memory<Slider type="range" min={memory.substring(0, memory.length - 1)} max="10000" value={currentMemory} onChange={(e) => setMemory(e.target.value)} /> {currentMemory}M</li>
            {/* <Dropdown value={currentMemory} id="memory" placeholder="Memory" onChange={handleMemoryChange}>
              {memorySpecs.map(memory => <option value={memory}>{memory} GB Memory</option>)}
            </Dropdown>
            <Dropdown value={currentCpu} placeholder="CPU" onChange={handleCpuChange}>
              {cpuSpecs.map(cpu => <option value={cpu}>{cpu} CPU Core</option>)}
            </Dropdown>
            <Dropdown value={currentGpu} placeholder="GPU" onChange={handleGpuChange}>
              {gpuSpecs.map(gpu => <option value={gpu}>{gpu} GPU Core</option>)}
            </Dropdown> */}
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
        {status === "Running" ? <StopButton small>Stop App</StopButton> :
          <Button small variant={flipped ? 'danger' : 'info'} onClick={toggleConfig} style={{ width: '150px' }}>
            <Icon icon={flipped ? 'close' : 'launch'} fill="#eee" />{flipped ? 'Cancel' : 'Launch App'}
          </Button>}
      </Card.Footer>
    </Card>
  )
}

const ServiceCard = ({ name, docs, sid, fqsid, creation_time, cpu, gpu, memory }) => {
  const theme = useTheme()
  return (
    <Card style={{ minHeight: '300px', margin: `${theme.spacing.large} 0` }}>
      <Card.Header><AppHeader>{name} <Status class><RunningStatus />Running</Status></AppHeader></Card.Header>
      <Relative>
        <Card.Body>
          <Paragraph style={{ display: 'flex', fontSize: 20, justifyContent: 'space-between' }}><span>CPU: {cpu}</span> <span>GPU: {gpu}</span> <span>Memory: {memory}</span></Paragraph>
          <Paragraph>Creation Time: {creation_time}</Paragraph>
          <Link to={docs}>App Documentation</Link>
        </Card.Body>
      </Relative>
      <Card.Footer style={{
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
        <StopButton small>Stop App</StopButton>
      </Card.Footer>
    </Card>
  )
}

export const Apps = () => {
  const context = useEnvironment().config.context;
  const helxAppstoreUrl = useEnvironment().helxAppstoreUrl;
  const helxAppstoreCsrfToken = useEnvironment().csrfToken;
  const [apps, setApps] = useState({});
  const [services, setServices] = useState([]);
  const [active, setActive] = useState('Apps');

  useEffect(async () => {
    if (active === 'Apps') {

      // hit /apps endpoint and store apps info
      const response = await axios({
        url: `${helxAppstoreUrl}/apps`,
        method: 'GET',
        headers: {
          'X-CSRFToken': helxAppstoreCsrfToken
        }
      }).then((res) => {
        setApps(res);
      }).catch((e) => {
        console.log(e);
      })
      setServices([]);
    }
    else {
      setApps({});

      // hit /services endpoint and store all running apps
      const response = await axios({
        url: `${helxAppstoreUrl}/services`,
        method: 'GET',
        headers: {
          'X-CSRFToken': helxAppstoreCsrfToken
        }
      }).then((res) => {
        setServices(res);
      }).catch((e) => {
        console.log(e);
      })
    }
  }, [active])

  if (!apps) return (
    <Container>
      <Title>Apps</Title>
      <Paragraph>
        Sorry &mdash; no apps found!
      </Paragraph>
    </Container>
  )

  return (
    <Container>
      <TabGroup>
        <Tab active={active === 'Apps'} onClick={() => setActive('Apps')}>Apps</Tab>
        <Tab active={active === 'Services'} onClick={() => setActive('Services')}>Services</Tab>
      </TabGroup>
      {Object.keys(apps).sort().map(appKey => <AppCard key={appKey} {...apps[appKey]} />)}
      {services.map(service => <ServiceCard key={service.sid} {...service} />)}

    </Container>
  )
}
