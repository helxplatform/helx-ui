import React, { Fragment, useState } from 'react'
import { Button, Drawer, Menu } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { logoutHandler } from '../../../api/'
import { Link } from '@reach/router'
import '../layout.css'

export const MobileMenu = ({menu}) => {
    const [visible, setVisible] = useState(false);

    return (
        <div className="mobile-menu-toggle">
            <Button onClick={() => setVisible(true)}><MenuOutlined /></Button>
            <Drawer
                title="HeLx UI"
                placement="right"
                closable={false}
                onClose={() => setVisible(false)}
                visible={visible}
            >
                <Menu mode="vertical" mode="inline">
                    {menu.map(m => <Menu.Item key={m.key}><Link to={m.path}>{m.title}</Link></Menu.Item>)}
                    <Menu.Item key="logout" className="logout"><Button onClick={() => logoutHandler()}>LOG OUT</Button></Menu.Item>
                </Menu>
            </Drawer>
        </div>
    )
}