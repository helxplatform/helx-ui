import React, { Fragment, useState } from 'react';
import { Button, Card, Spin, Slider, Col, Tooltip, Typography, Row } from 'antd';
import { Link, navigate } from '@gatsbyjs/reach-router';
import { RocketOutlined, InfoCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { toBytes, bytesToMegabytes, formatBytes } from '../../utils/memory-converter';
import { useActivity, useInstance, useAnalytics, useEnvironment, useWorkspacesAPI } from "../../contexts";
import './app-card.css';

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
    const { api } = useWorkspacesAPI();
    const { addActivity } = useActivity();
    const { analyticsEvents } = useAnalytics();
    const { context } = useEnvironment()
    const [launchTab, setLaunchTab] = useState(true);
    const [isLaunching, setLaunching] = useState(false);
    const { pollingInstance } = useInstance();
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
        try {
            const data = await api.launchApp(app_id, currentCpu, currentGpu, bytesToMegabytes(currentMemory))
            const sid = data.url.split("/")[6];
            let newActivity = {
                'sid': sid,
                'app_name': name,
                'status': 'processing',
                'timestamp': new Date(),
                'message': `${name} is launching.`
            }
            analyticsEvents.appLaunched(name, sid, currentCpu, currentGpu, currentMemory, false)
            addActivity(newActivity)
            // start polling service and navigate to active tab if the launch is successful
            pollingInstance(app_id, sid, data.url, name);
            navigate('/helx/workspaces/active');
        } catch (e) {
            let newActivity = {
                'sid': 'none',
                'app_name': name,
                'status': 'error',
                'timestamp': new Date(),
                'message': `Failed to launch ${name}.`
            }
            // Same as other event, but indicate that it failed. +no sid, since the app did not launch.
            analyticsEvents.appLaunched(name, null, currentCpu, currentGpu, currentMemory, true)
            addActivity(newActivity)
        }
        // store user's preference of each app configuration in localStorage
        localStorage.setItem(`${app_id}-cpu`, currentCpu);
        localStorage.setItem(`${app_id}-gpu`, currentGpu);
        localStorage.setItem(`${app_id}-memory`, currentMemory);
        setLaunching(false);
    }

    const getLogoUrl = (app_id) => {
        return `https://github.com/helxplatform/helx-apps/raw/${context.dockstore_branch}/app-specs/${app_id}/icon.png`
    }

    return (
        <Card
            style={{ width: '400px', height: '450px' }}
            actions={[
                launchTab ? (isLaunching ? <Spin /> : <div className="launch_control"><Tooltip title={available ? "" : "The maximum number of instances is currently running"}><Button icon={<RocketOutlined />} disabled={!available} onClick={appLauncher}>Launch</Button></Tooltip><Button icon={<InfoCircleOutlined />} onClick={() => setLaunchTab(false)}>About</Button></div>) :
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