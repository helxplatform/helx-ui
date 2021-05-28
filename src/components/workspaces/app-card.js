import React, { Fragment, useState } from 'react';
import { Button, Card, Spin, Slider, InputNumber, Col, Typography, Row } from 'antd';
import { useApp } from '../../contexts/app-context';
import { Link } from '@reach/router';
import { CloseOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { toBytes, bytesToMegabytes, formatBytes, formatMemory } from '../../utils/memory-converter';
import { openNotificationWithIcon } from '../notifications'
import './app-card.css';

const { Meta } = Card;

// each app config value from localstorage will be validated here
const validateLocalstorageValue = (config, app_id, min, max) => {
    let prev = localStorage.getItem(`${app_id}-${config}`);
    if (prev !== null && prev >= min && prev <= max) {
        return parseInt(prev);
    }
    else {
        return parseInt(min);
    }
}

export const AppCard = ({ name, app_id, description, detail, docs, status, minimum_resources, maximum_resources }) => {
    const { launchApp } = useApp();
    const [flipped, setFlipped] = useState(false)
    const [isLaunching, setLaunching] = useState(false);
    const [currentMemory, setMemory] = useState(validateLocalstorageValue('memory', app_id, toBytes(minimum_resources.memory), toBytes(maximum_resources.memory)));
    const [currentCpu, setCpu] = useState(validateLocalstorageValue('cpu', app_id, minimum_resources.cpus, maximum_resources.cpus));
    const [currentGpu, setGpu] = useState(validateLocalstorageValue('gpu', app_id, minimum_resources.gpus, maximum_resources.gpus));

    const toggleConfig = event => setFlipped(!flipped)

    const memoryFormatter = (value) => {
        return formatBytes(value, 2);
    }


    //app can be launched here using axios to hit the /start endpoint
    const appLauncher = async () => {
        setLaunching(true);
        // NOTE: Memory is converted to MB when posting an instance
        await launchApp(app_id, currentCpu, currentGpu, bytesToMegabytes(currentMemory))
            .then(res => {
                openNotificationWithIcon('success', 'Success', `${name} launched.`)
            }).catch(e => {
                openNotificationWithIcon('error', 'Error', `Failed to launch ${name}.`)
            })
        localStorage.setItem(`${app_id}-cpu`, currentCpu);
        localStorage.setItem(`${app_id}-gpu`, currentGpu);
        localStorage.setItem(`${app_id}-memory`, currentMemory);
        setLaunching(false);
    }

    const getLogoUrl = (app_id) => {
        return `https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/${app_id}/icon.png`
    }

    return (
        <Card
            style={{ width: '400px', height: '400px' }}
            actions={[
                flipped ? (isLaunching ? <Spin /> : <div className="launch_control"><Button size="small" onClick={appLauncher}>Launch</Button><CloseOutlined key="ellipsis" onClick={toggleConfig} /></div>) :
                    <SettingOutlined key='setting' onClick={toggleConfig} />
            ]}
        >
            <div className="app_logo_container">
                <img className="app_logo" src={'' + getLogoUrl(app_id)} />
            </div>
            {flipped ? <div className="app_content">
                <Typography>Resource Configuration</Typography>
                <br />
                <Row align="middle">
                    <Col span={4}>CPU</Col>
                    {minimum_resources.cpus === maximum_resources.cpus ? <Col span={12}><Typography>Locked: {minimum_resources.cpus} Core{minimum_resources.cpus > 1 ? 's' : ''}</Typography></Col> :
                        <Fragment>
                            <Col span={16}>
                                <Slider
                                    min={parseInt(minimum_resources.cpus)}
                                    max={parseInt(maximum_resources.cpus)}
                                    onChange={(value) => { setCpu(value) }}
                                    value={typeof currentCpu === 'number' ? currentCpu : 0}
                                    step={1}
                                />
                            </Col>
                        </Fragment>}
                </Row>
                <Row align="middle">
                    <Col span={4}>GPU</Col>
                    {minimum_resources.gpus === maximum_resources.gpus ? <Col span={12}><Typography>Locked: {minimum_resources.gpus} Core{minimum_resources.gpus > 1 ? 's' : ''}</Typography></Col> :
                        <Fragment>
                            <Col span={16}>
                                <Slider
                                    min={parseInt(minimum_resources.gpus)}
                                    max={parseInt(maximum_resources.gpus)}
                                    onChange={(value) => { setGpu(value) }}
                                    value={typeof currentGpu === 'number' ? currentGpu : 0}
                                    step={1}
                                />
                            </Col>
                        </Fragment>}
                </Row>
                <Row align="middle">
                    <Col span={4}>Memory</Col>
                    {minimum_resources.memory === maximum_resources.memory ? <Col span={12}><Typography>Locked: {formatMemory(minimum_resources.memory)}G</Typography></Col> :
                        <Fragment>
                            <Col span={16}>
                                <Slider
                                    min={parseInt(toBytes(minimum_resources.memory))}
                                    max={parseInt(toBytes(maximum_resources.memory))}
                                    onChange={(value) => { setMemory(value) }}
                                    value={typeof currentMemory === 'number' ? currentMemory : 0}
                                    step={toBytes("0.25G")}
                                    tipFormatter={memoryFormatter}
                                />
                            </Col>
                        </Fragment>}
                </Row>
            </div> : <div>
                <div className="app_content">
                    <Meta
                        title={name}
                        description={description}
                    />
                    <br />
                    <Typography>{detail}</Typography>
                    <Link to={docs}>About {name}</Link></div></div>}
        </Card >
    )
}