import { useState } from 'react';
import { Layout as AntLayout, Button, Menu, Grid, Divider, Badge, Popover, Typography, Tag, Space } from 'antd'
import { ShoppingCartOutlined as ShoppingCartIcon } from '@ant-design/icons'
import { useLocation, Link, redirectTo, navigate } from '@reach/router'
import { useEnvironment, useAnalytics } from '../../contexts';
import { logoutHandler } from '../../api/';
import { MobileMenu } from './menu';
import { SidePanel } from '../side-panel/side-panel';
import { CartPopoverButton } from 'antd-shopping-cart';
import './layout.css';

const { Text, Title } = Typography
const { Header, Content, Footer } = AntLayout
const { useBreakpoint } = Grid

export const Layout = ({ children }) => {
  const { helxAppstoreUrl, routes, context, basePath } = useEnvironment()
  const { analyticsEvents } = useAnalytics()
  const { md } = useBreakpoint()
  const baseLinkPath = context.workspaces_enabled === 'true' ? '/helx' : ''
  const location = useLocation();

  const logoutButton = context.workspaces_enabled === 'true'

  const logout = () => {
    analyticsEvents.logout()
    logoutHandler(helxAppstoreUrl)
  }

  return (
    <AntLayout className="layout">
      <Header className="helx-header" style={{ display: 'flex', zIndex: 1, width: '100%', background: '#fff' }}>
        {context !== undefined ? <Link to={basePath}><img className="brand_img" src={'' + context.logo_url} alt={context.brand}></img></Link> : <span />}
        {md ? (
          <div style={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}>
            <Menu
              className="menu-toggle"
              theme="light"
              mode="horizontal"
              selectedKeys={[location.pathname]}
              style={{ display: "flex", flexGrow: 1, justifyContent: "flex-end" }}
            >
              <Menu.Item style={{ visibility: 'hidden' }}></Menu.Item>
              <Menu.Item style={{ visibility: 'hidden' }}></Menu.Item>
              <Menu.Item style={{ visibility: 'hidden' }}></Menu.Item>
              {routes.map(m => m['text'] !== '' && (
                <Menu.Item key={`${baseLinkPath}${m.path}`}><Link to={`${baseLinkPath}${m.path}`}>{m.text}</Link></Menu.Item>
              ))}
            </Menu>
            {/* <Divider
              type="vertical"
              style={{
                height: "calc(100% - 16px)",
                marginLeft: "8px",
                marginRight: "16px",
                top: 0,
                marginTop: "0",
                marginBottom: "0",
              }}
            /> */}
            <div style={{ height: "100%" }}>
              <CartPopoverButton
                onCheckout={ () => navigate(`${baseLinkPath}/cart`) }
                buttonProps={{ style: { marginRight: !logoutButton ? 8 : undefined } }}
              />
            </div>
            {logoutButton && (
              <div style={{ height: "100%" }}>
                <Button style={{ marginRight: 14 }} type="primary" ghost className="logout-button" onClick={logout}>LOG OUT</Button>
              </div>
            )}
          </div>
        ) : (
          <MobileMenu menu={routes} />
        )}
      </Header>
      <Content className>
        {children}
        {context.workspaces_enabled === 'true' && <SidePanel />}
      </Content>
      <Footer style={{ textAlign: 'center', paddingTop: 0 }}>&copy; HeLx {new Date().getFullYear()}</Footer>
    </AntLayout>
  )
}