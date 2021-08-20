import React, { Fragment, useState } from 'react';
import { Button, Card, Spin, Slider, Col, Typography, Row } from 'antd';
import { useApp } from '../../contexts/app-context';
import { Link } from '@reach/router';
import { RocketOutlined, InfoCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { toBytes, bytesToMegabytes, formatBytes, formatMemory } from '../../utils/memory-converter';
import { openNotificationWithIcon } from '../notifications'
import './app-card.css';
import { useActivity, useInstance } from "../../contexts";
import { updateTabName } from '../../utils/update-tab-name';

const { Meta } = Card;

// each app config value from localstorage will be validated here
const validateLocalstorageValue = (config, app_id, min, max) => {
    let prev = localStorage.getItem(`${app_id}-${config}`);
    if (prev !== null && prev >= min && prev <= max) {
        return parseFloat(prev);
    }
    else {
        return parseFloat(min);
    }
}

export const AppCard = ({ name, app_id, description, detail, docs, status, minimum_resources, maximum_resources, available }) => {
    const { launchApp } = useApp();
    const { addActivity } = useActivity();
    const [launchTab, setLaunchTab] = useState(true)
    const [isLaunching, setLaunching] = useState(false);
    const { pollingInstance, addOrDeleteInstanceTab } = useInstance();
    const [currentMemory, setMemory] = useState(validateLocalstorageValue('memory', app_id, toBytes(minimum_resources.memory), toBytes(maximum_resources.memory)));
    const [currentCpu, setCpu] = useState(validateLocalstorageValue('cpu', app_id, minimum_resources.cpus, maximum_resources.cpus));
    const [currentGpu, setGpu] = useState(validateLocalstorageValue('gpu', app_id, minimum_resources.gpus, maximum_resources.gpus));

    const memoryFormatter = (value) => {
        return formatBytes(value, 2);
    }

    //app can be launched here using axios to hit the /start endpoint
    const appLauncher = async () => {
        setLaunching(true);
        // NOTE: Memory is converted to MB when posting an instance
        await launchApp(app_id, currentCpu, currentGpu, bytesToMegabytes(currentMemory))
            .then(res => {
                const sid = res.data.url.split("/")[6];
                let newActivity = {
                    'sid': sid,
                    'app_name': name,
                    'status': 'processing',
                    'timestamp': new Date(),
                    'message': `${name} is launching.`
                }
                addActivity(newActivity)
                pollingInstance(app_id, sid, res.data.url, name);
            }).catch(e => {
                let newActivity = {
                    'sid': 'none',
                    'app_name': name,
                    'status': 'error',
                    'timestamp': new Date(),
                    'message': `Failed to launch ${name}.`
                }
                addActivity(newActivity)
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
            style={{ width: '400px', height: '450px' }}
            actions={[
                launchTab ? (isLaunching ? <Spin /> : <div className="launch_control"><Button icon={<RocketOutlined />} disabled={!available} onClick={appLauncher}>Launch</Button><Button icon={<InfoCircleOutlined />} onClick={() => setLaunchTab(false)}>About</Button></div>) :
                    <Button icon={<SettingOutlined />} key='setting' onClick={() => setLaunchTab(true)}>Configuration</Button>
            ]}
        >
            <div className="app_logo_container">
                <img className="app_logo" src={'' + getLogoUrl(app_id)} alt="" />
            </div>
            {launchTab ? <div className="app_content">
                <Meta
                    title={name}
                    description={description}
                />
                <br />
                {minimum_resources.cpus === maximum_resources.cpus ? '' : <Row align="middle">
                    <Col span={4}>CPU</Col>
                    <Fragment>
                        <Col span={14}>
                            <Slider
                                min={parseFloat(minimum_resources.cpus)}
                                max={parseFloat(maximum_resources.cpus)}
                                onChange={(value) => { setCpu(value) }}
                                value={typeof currentCpu === 'number' ? currentCpu : 0}
                                step={0.5}
                            />
                        </Col>
                        <Col className="app_config_value" span={6}>
                            {currentCpu} Core{currentCpu > 1 ? 's' : ''}
                        </Col>
                    </Fragment>
                </Row>}
                {minimum_resources.gpus === maximum_resources.gpus ? '' :
                    <Row align="middle">
                        <Col span={4}>GPU</Col>
                        <Fragment>
                            <Col span={14}>
                                <Slider
                                    min={parseFloat(minimum_resources.gpus)}
                                    max={parseFloat(maximum_resources.gpus)}
                                    onChange={(value) => { setGpu(value) }}
                                    value={typeof currentGpu === 'number' ? currentGpu : 0}
                                    step={0.5}
                                />
                            </Col>
                            <Col className="app_config_value" span={6}>
                                {currentGpu} Core{currentGpu > 1 ? 's' : ''}
                            </Col>
                        </Fragment>
                    </Row>}
                {minimum_resources.memory === maximum_resources.memory ? '' : <Row align="middle">
                    <Col span={4}>Memory</Col>
                    <Fragment>
                        <Col span={14}>
                            <Slider
                                min={parseInt(toBytes(minimum_resources.memory))}
                                max={parseInt(toBytes(maximum_resources.memory))}
                                onChange={(value) => { setMemory(value) }}
                                value={typeof currentMemory === 'number' ? currentMemory : 0}
                                step={toBytes("0.25G")}
                                tipFormatter={memoryFormatter}
                            />
                        </Col>
                        <Col className="app_config_value" span={6}>
                            {formatBytes(currentMemory, 2)}
                        </Col>
                    </Fragment>
                </Row>
                }
            </div> : <div>
                <div className="app_content">
                    <br />
                    <Typography>{detail}</Typography>
                    <Link to={docs}>About {name}</Link></div></div>}
        </Card >
    )
}