import React, { useState } from 'react'
import { Button, Drawer, Menu } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { Link } from '@gatsbyjs/reach-router'
import { useEnvironment } from '../../../contexts/environment-context'
import { useAnalytics, useWorkspacesAPI } from '../../../contexts'
import '../layout.css'

export const MobileMenu = ({menu}) => {
    const [visible, setVisible] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false)
    const { context } = useEnvironment();
    const { api, loggedIn, loading: apiLoading } = useWorkspacesAPI()
    const { analyticsEvents } = useAnalytics();

    const baseLinkPath = context.workspaces_enabled === 'true' ? '/helx' : ''

    const logout = async () => {
        setLoggingOut(true)
        analyticsEvents.workspacesLogout()
        try {
          await api.logout()
        } catch (e) {}
        setLoggingOut(false)
      }

    return (
        <div className="mobile-menu-toggle">
            <Button onClick={() => setVisible(true)}><MenuOutlined /></Button>
            <Drawer
                title={ 
                    context?.brand === 'heal' 
                    ? 'NIH HEAL Semantic Search'
                    : context?.meta.title ?? 'HeLx'
                }
                placement="right"
                closable={false}
                onClose={() => setVisible(false)}
                visible={visible}
            >
                <Menu mode="vertical" style={{ border: 0 }}>
                    {
                        menu.map(m => m['text'] !== '' && (
                            <Menu.Item key={m.text}><Link to={`${baseLinkPath}${m.path}`}>{m.text}</Link></Menu.Item>
                        )) }
                    { context.workspaces_enabled === 'true' && !apiLoading && loggedIn && (
                        <Menu.Item key="logout" className="logout"><Button onClick={ logout } disabled={ loggingOut }>LOG OUT</Button></Menu.Item>
                    ) }
                </Menu>
            </Drawer>
        </div>
    )
}