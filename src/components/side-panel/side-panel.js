import React, { useState } from 'react';
import { Button, Drawer, Tag } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useActivity } from '../../contexts';
import TimeAgo from 'timeago-react';
import './side-panel.css';

export const SidePanel = () => {
    const { activity } = useActivity();
    const [visible, setVisible] = useState(false);
    return (
        <div className="side-panel-open">
            {!visible && (<Button icon={<LeftOutlined />} onClick={() => setVisible(true)} />)}
            <Drawer
                title="Activity Monitor"
                placement="right"
                closable={true}
                visible={visible}
                mask={false}
                style={{marginTop: '64px'}}
                width={'300px'}
                onClose={() => setVisible(false)}
            >
                {activity.length !== 0 ? activity.map(this_activity =>
                    <div>
                        <Tag color={this_activity[0]}>{this_activity[0]}</Tag>
                        <span><TimeAgo datetime={this_activity[1]} /></span>
                        <div>{this_activity[2]}</div>
                        <hr />
                    </div>
                ) : <span>No activity</span>
                }
            </Drawer>
        </div>
    )
}