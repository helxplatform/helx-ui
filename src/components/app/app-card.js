import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components'
import { Button } from '../button'
import { Card } from '../card'
import { Link } from '../link'
import { Icon } from '../icon'
import { Slider } from '../slider';
import { Paragraph } from '../typography'
import { useApp } from '../../contexts/app-context';
import { useEnvironment } from '../../contexts';
import { useNotifications } from '@mwatson/react-notifications'

const AppHeader = styled.div(({ theme }) => `
    display: flex;
    justify-content: space-between;
`)

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
  overflow: scroll;
  & * {
    font-family: monospace;
    font-size: 16px;
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
  width: 80px;
`

const Spec = styled.span(({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: center;
`)
const SpecContainer = styled.div(({ theme }) => `
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.small};
  width: 100%;
  height: 45px;
`)
const SpecDefaultText = styled.span`
  width: 60vw;
  @media screen and (min-width: 992px) {
    width: 30vw;
    max-width: 450px;
}
`

const SpecMinMax = styled.div(({ theme }) => `
width: 20vw;
@media screen and (min-width: 992px) {
  width: 10vw;
  max-width: 150px;
}
`)

const SliderMinMaxContainer = styled.span(({ theme }) => `
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 60vw;
  @media screen and (min-width: 992px) {
    width: 30vw;
    max-width: 450px;
}
`)

const bytePower = (unit_type) => {
  let ut = unit_type.toLowerCase()
  const power = {
    'k': 3,
    'm': 6,
    'g': 9,
    't': 12,
    'p': 15,
    'e': 18,
    'z': 21,
    'y': 24,
  }

  return power[ut];
}

const toBytes = (config) => {
  let units = config.substring(0, config.length - 1);
  let power_value = bytePower(config[config.length - 1])
  return units * Math.pow(10, power_value);
}

// convert bytes to human readable unit type
const formatBytes = (bytes, decimals) => {
  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const parsed = parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
  return parsed;
}

const formatMemory = (mb, decimals = 2) => {
  let bytes = toBytes(mb);
  return formatBytes(bytes, decimals);
}


// each app config value from localstorage will be validated here
const validateLocalstorageValue = (config, app_id, min, max) => {
  let prev = localStorage.getItem(`${app_id}-${config}`);
  if (prev !== null && prev >= min && prev <= max) {
    return prev;
  }
  else {
    return min;
  }
}

export const AppCard = ({ name, app_id, description, detail, docs, status, minimum_resources, maximum_resources }) => {
  const theme = useTheme()
  const { addNotification } = useNotifications();
  const { launchApp } = useApp();
  const { helxAppstoreCsrfToken, helxAppstoreUrl } = useEnvironment();
  const [flipped, setFlipped] = useState(false)
  const [currentMemory, setMemory] = useState(validateLocalstorageValue('memory', app_id, toBytes(minimum_resources.memory), toBytes(maximum_resources.memory)));
  const [currentCpu, setCpu] = useState(validateLocalstorageValue('cpu', app_id, minimum_resources.cpus, maximum_resources.cpus));
  const [currentGpu, setGpu] = useState(validateLocalstorageValue('gpu', app_id, minimum_resources.gpus, maximum_resources.gpus));

  const toggleConfig = event => setFlipped(!flipped)

  //app can be launched here using axios to hit the /start endpoint
  const appLauncher = () => {
    launchApp(app_id, currentCpu, currentGpu, formatBytes(currentMemory))
      .then(res => {
        addNotification({ type: 'success', text: 'Launching app successful.' })
      }).catch(e => {
        addNotification({ type: 'error', text: 'Error occurs when launching apps. Please try again!' })
      })
    localStorage.setItem(`${app_id}-cpu`, currentCpu);
    localStorage.setItem(`${app_id}-gpu`, currentGpu);
    localStorage.setItem(`${app_id}-memory`, currentMemory);
  }

  const getLogoUrl = (app_id) => {
    return `https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/${app_id}/icon.png`
  }

  return (
    <Card style={{ minHeight: '350px' }}>
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
            <SpecContainer><SpecName>CPU</SpecName>{minimum_resources.cpus === maximum_resources.cpus ? <SpecDefaultText>Locked: {minimum_resources.cpus} Core{minimum_resources.cpus > 1 ? 's' : ''}</SpecDefaultText> : <SliderMinMaxContainer><SpecMinMax>Min: {minimum_resources.cpus} Core{minimum_resources.cpus > 1 ? 's' : ''}</SpecMinMax><Spec><b>{currentCpu}</b><Slider type="range" min={minimum_resources.cpus} max={maximum_resources.cpus} step="1" value={currentCpu} onChange={(e) => setCpu(e.target.value)} /></Spec><SpecMinMax>Max: {maximum_resources.cpus} Core{maximum_resources.cpus > 1 ? 's' : ''}</SpecMinMax></SliderMinMaxContainer>}</SpecContainer>
            <SpecContainer><SpecName>GPU</SpecName>{minimum_resources.gpus === maximum_resources.gpus ? <SpecDefaultText>Locked: {minimum_resources.gpus} Core{minimum_resources.gpus > 1 ? 's' : ''}</SpecDefaultText> : <SliderMinMaxContainer><SpecMinMax>Min: {minimum_resources.gpus} Core{minimum_resources.gpus > 1 ? 's' : ''}</SpecMinMax><Spec><b>{currentGpu}</b><Slider type="range" min={minimum_resources.gpus} max={maximum_resources.gpus} step="1" value={currentGpu} onChange={(e) => setGpu(e.target.value)} /></Spec><SpecMinMax>Max: {maximum_resources.gpus} Core{maximum_resources.gpus > 1 ? 's' : ''}</SpecMinMax></SliderMinMaxContainer>}</SpecContainer>
            <SpecContainer><SpecName>Memory</SpecName>{minimum_resources.memory === maximum_resources.memory ? <SpecDefaultText>Locked: {formatMemory(minimum_resources.memory)}</SpecDefaultText> : <SliderMinMaxContainer><SpecMinMax>Min: {formatMemory(minimum_resources.memory)}</SpecMinMax><Spec><b>{formatBytes(currentMemory, 2)}</b><Slider type="range" min={toBytes(minimum_resources.memory)} max={toBytes(maximum_resources.memory)} step={toBytes("0.25G")} value={currentMemory} onChange={(e) => setMemory(e.target.value)} /></Spec><SpecMinMax>Max: {formatMemory(maximum_resources.memory)}</SpecMinMax></SliderMinMaxContainer>}</SpecContainer>
          </div>
          <div className="actions">
            <Button small variant="success" onClick={() => { appLauncher(); toggleConfig(); }} style={{ width: '150px' }}>
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