import { Layout as AntLayout, Button, Menu, Grid } from 'antd'
import { useLocation, Link } from '@reach/router'
import { useEnvironment, useAnalytics } from '../../contexts';
import { logoutHandler } from '../../api/';
import { MobileMenu } from './menu';
import { SidePanel } from '../side-panel/side-panel';
import './layout.css';

const { Header, Content, Footer } = AntLayout
const { useBreakpoint } = Grid

export const Layout = ({ children }) => {
  const { helxAppstoreUrl, routes, context, basePath } = useEnvironment()
  const { analyticsEvents } = useAnalytics()
  const { md } = useBreakpoint()
  const baseLinkPath = context.workspaces_enabled === 'true' ? '/helx' : ''
  const location = useLocation();

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
            <Menu className="menu-toggle" theme="light" mode="horizontal" selectedKeys={[location.pathname]}>
              <Menu.Item style={{ visibility: 'hidden' }}></Menu.Item>
              <Menu.Item style={{ visibility: 'hidden' }}></Menu.Item>
              <Menu.Item style={{ visibility: 'hidden' }}></Menu.Item>
              {routes.map(m => m['text'] !== '' && (
                <Menu.Item key={`${baseLinkPath}${m.path}`}><Link to={`${baseLinkPath}${m.path}`}>{m.text}</Link></Menu.Item>
              ))}
            </Menu>
            {context.workspaces_enabled === 'true' && (
              <div style={{ height: "100%" }}>
                <Button type="primary" ghost className="logout-button" onClick={logout}>LOG OUT</Button>
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