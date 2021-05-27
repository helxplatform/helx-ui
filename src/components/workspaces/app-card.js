import React, { Fragment, useState } from 'react';
import { Card, Avatar, Slider, InputNumber, Col, Row } from 'antd';
import { useApp } from '../../contexts/app-context';
import { Link } from '@reach/router';
import { EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { toBytes, bytesToMegabytes, formatBytes, formatMemory } from '../../utils/memory-converter';

const { Meta } = Card;

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
    const { launchApp } = useApp();
    const [flipped, setFlipped] = useState(false)
    const [isLaunching, setLaunching] = useState(false);
    const [currentMemory, setMemory] = useState(validateLocalstorageValue('memory', app_id, toBytes(minimum_resources.memory), toBytes(maximum_resources.memory)));
    const [currentCpu, setCpu] = useState(validateLocalstorageValue('cpu', app_id, minimum_resources.cpus, maximum_resources.cpus));
    const [currentGpu, setGpu] = useState(validateLocalstorageValue('gpu', app_id, minimum_resources.gpus, maximum_resources.gpus));

    const toggleConfig = event => setFlipped(!flipped)

    const ConfigView = () => <div>
        <Row>
            <Col span={12}>
                <Slider
                    min={1}
                    max={20}
                    onChange={(e) => setCpu(e.target.value)}
                    value={typeof currentCpu === 'number' ? currentCpu : 0}
                />
            </Col>
            <Col span={4}>
                <InputNumber
                    min={1}
                    max={20}
                    style={{ margin: '0 16px' }}
                    value={currentCpu}
                    onChange={(e) => setCpu(e.target.value)}
                />
            </Col>
        </Row>
    </div>


    //app can be launched here using axios to hit the /start endpoint
    const appLauncher = async () => {
        setLaunching(true);
        // NOTE: Memory is converted to MB when posting an instance
        await launchApp(app_id, currentCpu, currentGpu, bytesToMegabytes(currentMemory))
            .then(res => {
                // addNotification({ type: 'success', text: 'Launching app successful.' })
            }).catch(e => {
                // addNotification({ type: 'error', text: 'An error has occurred while launching apps. Please try again!' })
            })
        localStorage.setItem(`${app_id}-cpu`, currentCpu);
        localStorage.setItem(`${app_id}-gpu`, currentGpu);
        localStorage.setItem(`${app_id}-memory`, currentMemory);
        setLaunching(false);
        toggleConfig();
    }

    const getLogoUrl = (app_id) => {
        return `https://github.com/helxplatform/app-support-prototype/raw/master/dockstore-yaml-proposals/${app_id}/icon.png`
    }

    return (
        <Card
            style={{ width: '100%' }}
            actions={[
                flipped ? <EllipsisOutlined key="ellipsis" onClick={toggleConfig} /> :
                    <SettingOutlined key='setting' onClick={toggleConfig} />
            ]}
        >
            {flipped ? <ConfigView /> : <div>
                <div style={{ display: 'flex', justifyContent: 'center' }}><img style={{ width: '150px', height: '150px', objectFit: 'scale-down', padding: '8px' }} src={'' + getLogoUrl(app_id)}></img></div>
                <Meta
                    title={name}
                    description={description}
                />
                <Meta
                    description={detail}
                />
                <Link to={docs}>About {name}</Link></div>}
        </Card >
    )
}