import { Layout as AntLayout, Button, Menu, Space } from 'antd'
import { useLocation, Link } from '@reach/router'
import { useEnvironment } from '../../contexts/environment-context';
import { logoutHandler } from '../../api/';
import { MobileMenu } from './menu';
import { SidePanel } from '../side-panel/side-panel';
import './layout.css';

const { Header, Content, Footer } = AntLayout

export const Layout = ({ children }) => {
  const { helxAppstoreUrl, enableSearch, enableWorkspaces, context } = useEnvironment()
  const location = useLocation();
  const menu = [];

  if (enableSearch === 'true') menu.push({ key: '/helx/search', title: 'Search', path: '/helx/search' });
  if (enableWorkspaces === 'true') menu.push({ key: '/helx/workspaces', title: 'Workspaces', path: '/helx/workspaces' });
  menu.push({ key: '/helx/support', title: 'Support', path: '/helx/support' })



  return (
    <AntLayout className="layout">
      <Header style={{ display: 'flex', zIndex: 1, width: '100%', background: '#fff' }}>
        {context !== undefined ? <Link to="/helx"><img className="brand_img" src={'' + helxAppstoreUrl + context.logo_url} alt="Go Home"></img></Link> : <span />}
        <Menu className="menu-toggle" style={{ position: 'absolute', right: '2px' }} theme="light" mode="horizontal" selectedKeys={[location.pathname]}>
          {menu.map(m => <Menu.Item key={m.key}><Link to={m.path}>{m.title}</Link></Menu.Item>)}
          <Button type="primary" ghost className="logout-button" onClick={() => logoutHandler(helxAppstoreUrl)}>LOG OUT</Button>
        </Menu>
        <MobileMenu menu={menu} />
      </Header>
      <Content>
        {children}
        <SidePanel />
      </Content>
      <Footer style={{ textAlign: 'center' }}>&copy; HeLx {new Date().getFullYear()}</Footer>
    </AntLayout>
  )
}