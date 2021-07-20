import { Layout as AntLayout, Button, Menu } from 'antd'
import { useLocation, Link } from '@reach/router'
import { useEnvironment } from '../../contexts/environment-context';
import { logoutHandler } from '../../api/';
import { MobileMenu } from './menu';
import { SidePanel } from '../side-panel/side-panel';
import './layout.css';

const { Header, Content, Footer } = AntLayout

export const Layout = ({ children }) => {
  const { helxAppstoreUrl, routes, context } = useEnvironment()
  const location = useLocation();

  return (
    <AntLayout className="layout">
      <Header style={{ display: 'flex', zIndex: 1, width: '100%', background: '#fff' }}>
        {context !== undefined ? <Link to="/helx"><img className="brand_img" src={'' + helxAppstoreUrl + context.logo_url} alt="Go Home"></img></Link> : <span />}
        <Menu className="menu-toggle" style={{ position: 'absolute', right: '2px' }} theme="light" mode="horizontal" selectedKeys={[location.pathname]}>
          {routes.map(m => m['text'] !== '' && <Menu.Item key={`/helx${m.path}`}><Link to={`/helx${m.path}`}>{m.text}</Link></Menu.Item>)}
          <Button type="primary" ghost className="logout-button" onClick={() => logoutHandler(helxAppstoreUrl)}>LOG OUT</Button>
        </Menu>
        <MobileMenu menu={routes} />
      </Header>
      <Content>
        {children}
        <SidePanel />
      </Content>
      <Footer style={{ textAlign: 'center' }}>&copy; HeLx {new Date().getFullYear()}</Footer>
    </AntLayout>
  )
}