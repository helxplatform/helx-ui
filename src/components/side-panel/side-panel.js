import React, { useState } from 'react';
import { Badge, Button, Drawer, Tag } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useActivity } from '../../contexts';
import TimeAgo from 'timeago-react';
import './side-panel.css';

export const SidePanel = () => {
    const { activity } = useActivity();
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

    return (
        <div className="side-panel-open">
            {!visible && (<Button onClick={openSidePanel}><Badge count={activity.length - lastSeenCounts}><LeftOutlined style={{ paddingRight: activity.length - lastSeenCounts === 0 ? '0px' : '10px' }} /></Badge></Button>)}
            <Drawer
                title="Activity Monitor"
                placement="right"
                closable={true}
                visible={visible}
                mask={false}
                style={{ marginTop: '64px' }}
                width={'300px'}
                onClose={closeSidePanel}
            >
                {activity.length !== 0 ? activity.map(this_activity =>
                    <div>
                        <Tag color={this_activity['status'] === 'pending' ? 'processing' : this_activity['status']}>{this_activity['status']}</Tag>
                        <span><TimeAgo datetime={this_activity['timestamp']} /></span>
                        <div>{this_activity['message']}</div>
                        <hr />
                    </div>
                ) : <span>No activity</span>
                }
            </Drawer>
        </div>
    )
}