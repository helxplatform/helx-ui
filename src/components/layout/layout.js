import { Layout as AntLayout, Button, Menu, Space } from 'antd'
import { useLocation, Link } from '@reach/router'
import { useEnvironment, useAnalytics } from '../../contexts';
import { logoutHandler } from '../../api/';
import { MobileMenu } from './menu';
import { SidePanel } from '../side-panel/side-panel';
import './layout.css';

const { Header, Content, Footer } = AntLayout

export const Layout = ({ children }) => {
  const { helxAppstoreUrl, routes, context, basePath } = useEnvironment()
  const { analytics, analyticsEvents } = useAnalytics();
  const baseLinkPath = context.workspaces_enabled === 'true' ? '/helx' : ''
  const location = useLocation();

  const logout = () => {
    analyticsEvents.logout()
    logoutHandler(helxAppstoreUrl)
  }

  // Phased out in favor of global route tracking in app.js/Router.
  const routeClicked = (m) => {
    /*
    analytics.trackRoute({
      route: m.path,
      customParameters: {
        "Route name": m.text
      }
    })
    */
  }
  const baseRouteClicked = () => {
    const baseRoot = routes.find((m) => m.path === basePath)
    routeClicked({
      ...baseRoot,
      text: "{Base path}"
    })
  }

  return (
    <AntLayout className="layout">
      <Header id="helx-header" style={{ display: 'flex', zIndex: 1, width: '100%', background: '#fff' }}>
        {context !== undefined ? <Link to={basePath} onClick={baseRouteClicked}><img className="brand_img" src={'' + context.logo_url} alt={context.brand}></img></Link> : <span />}
        <Menu className="menu-toggle" style={{ position: 'absolute', right: '2px' }} theme="light" mode="horizontal" selectedKeys={[location.pathname]}>
          <Menu.Item style={{ visibility: 'hidden' }}></Menu.Item>
          <Menu.Item style={{ visibility: 'hidden' }}></Menu.Item>
          <Menu.Item style={{ visibility: 'hidden' }}></Menu.Item>
          {routes.map(m => m['text'] !== '' && (
            <Menu.Item key={`${baseLinkPath}${m.path}`}><Link to={`${baseLinkPath}${m.path}`} onClick={() => routeClicked(m)}>{m.text}</Link></Menu.Item>
          ))}
          {context.workspaces_enabled === 'true' && <Button type="primary" ghost className="logout-button" onClick={logout}>LOG OUT</Button>}
        </Menu>
        <MobileMenu menu={routes} />
      </Header>
      <Content>
        {children}
        {context.workspaces_enabled === 'true' && <SidePanel />}
      </Content>
      <Footer style={{ textAlign: 'center' }}>&copy; HeLx {new Date().getFullYear()}</Footer>
    </AntLayout>
  )
}