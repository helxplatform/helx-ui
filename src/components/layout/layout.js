import { Layout as AntLayout, Button, Menu, Space } from 'antd'
import { useLocation, Link } from '@reach/router'
import { useEnvironment } from '../../contexts/environment-context';
import { logoutHandler } from '../../api/';
import { MobileMenu } from './menu';
import { SidePanel } from '../side-panel/side-panel';
import './layout.css';

const { Header, Content, Footer } = AntLayout

export const Layout = ({ children }) => {
  const { helxAppstoreUrl, routes, context, basePath } = useEnvironment()
  const baseLinkPath = process.env.REACT_APP_HELX_APPSTORE_ENABLED === 'true' ? '/helx' : ''
  const location = useLocation();

  return (
    <AntLayout className="layout">
      <Header style={{ display: 'flex', zIndex: 1, width: '100%', background: '#fff' }}>
        {context !== undefined ? <Link to={basePath}><img className="brand_img" src={'' + context.logo_url} alt={context.brand}></img></Link> : <span />}
        <Menu className="menu-toggle" style={{ position: 'absolute', right: '2px' }} theme="light" mode="horizontal" selectedKeys={[location.pathname]}>
          <Menu.Item style={{ visibility: 'hidden' }}></Menu.Item>
          <Menu.Item style={{ visibility: 'hidden' }}></Menu.Item>
          <Menu.Item style={{ visibility: 'hidden' }}></Menu.Item>
          {routes.map(m => m['text'] !== '' && <Menu.Item key={`/helx${m.path}`}><Link to={`${baseLinkPath}${m.path}`}>{m.text}</Link></Menu.Item>)}
          {process.env.REACT_APP_HELX_APPSTORE_ENABLED === 'true' && <Button type="primary" ghost className="logout-button" onClick={() => logoutHandler(helxAppstoreUrl)}>LOG OUT</Button>}
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