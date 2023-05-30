import React, { useState } from 'react';
import { Badge, Button, Drawer, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LeftOutlined, SyncOutlined } from '@ant-design/icons';
import { useActivity, useInstance } from '../../contexts';
import TimeAgo from 'timeago-react';
import './side-panel.css';

export const SidePanel = () => {
    const { activity } = useActivity();
    const { addOrDeleteInstanceTab } = useInstance();
    const [visible, setVisible] = useState(false);
    const [lastSeenCounts, setLastSeenCounts] = useState(0);

    const openSidePanel = () => {
        setLastSeenCounts(activity.length);
        setVisible(true)
    }

    const closeSidePanel = () => {
        setLastSeenCounts(activity.length);
        setVisible(false)
    }

    const openApp = (sid, app_id, url) => {
        const connect_tab_ref = `${sid}-tab`
        const connect_tab = window.open(`${url}`, connect_tab_ref);
        addOrDeleteInstanceTab("add", app_id, connect_tab);
    }

    return (
        <div id="helx-side-panel" className="side-panel-open">
            {!visible && (<Button onClick={openSidePanel}><Badge count={(activity.length - lastSeenCounts) ? activity.length - lastSeenCounts : ''}><LeftOutlined style={{ paddingRight: activity.length - lastSeenCounts === 0 ? '0px' : '10px' }} /></Badge></Button>)}
            <Drawer
                title="Activity Monitor"
                placement="right"
                closable={true}
                visible={visible}
                keyboard={true}
                mask={true}
                maskClosable={true}
                maskStyle={{ animation: 'none', opacity: 0 }}
                style={{ marginTop: '66px' }}
                width={'300px'}
                onClose={closeSidePanel}
            >
                {activity.length !== 0 ? activity.map(this_activity =>
                    <div key={ this_activity['sid'] }>
                        <Tag icon={this_activity['status'] === 'processing' ? <SyncOutlined spin /> : (this_activity['status'] === 'success' ? <CheckCircleOutlined /> : <CloseCircleOutlined />)} color={this_activity['status']}>{this_activity['status']}</Tag>
                        <span><TimeAgo datetime={this_activity['timestamp']} /></span>
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <div>{this_activity['url'] ? <span><a role="button" onClick={() => openApp(this_activity['sid'], this_activity['app_id'], this_activity['url'])}>{this_activity['app_name']}</a> is up and ready for use.</span> : this_activity['message']}</div>
                        <hr />
                    </div>
                ) : <span>No activity</span>
                }
            </Drawer>
        </div>
    )
}