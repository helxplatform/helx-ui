import { Layout as AntLayout, Button, Menu } from 'antd'
import { useLocation, Link } from '@reach/router'
import { useEnvironment } from '../../contexts/environment-context';
import { logoutHandler } from '../../api/';
import { MobileMenu } from './menu';
import './layout.css';

const { Header, Content, Footer } = AntLayout

const menu = [
  { key: '/helx/search', title: 'Search', path: '/helx/search' },
  { key: '/helx/workspaces', title: 'Workspaces', path: '/helx/workspaces' },
  { key: '/helx/support', title: 'Support', path: '/helx/support' }
]



export const Layout = ({ children }) => {
  const { helxAppstoreUrl, context } = useEnvironment()
  const location = useLocation();

  return (
    <AntLayout className="layout">
      <Header style={{ display: 'flex', zIndex: 1, width: '100%', background: '#fff' }}>
        {context !== undefined ? <Link to="/helx"><img className="brand_img" src={'' + helxAppstoreUrl + context.logo_url} alt="Go Home"></img></Link> : <span />}
        <Menu className="menu-toggle" style={{ position: 'absolute', right: '2px' }} theme="light" mode="horizontal" selectedKeys={[location.pathname]}>
          {menu.map(m => <Menu.Item key={m.key}><Link to={m.path}>{m.title}</Link></Menu.Item>)}
          <Menu.Item key="logout" className="logout"><Button onClick={() => logoutHandler(helxAppstoreUrl)}>LOG OUT</Button></Menu.Item>
        </Menu>
        <MobileMenu menu={menu} />
      </Header>
      <Content>
        {children}
      </Content>
      <Footer style={{ textAlign: 'center' }}>&copy; HeLx {new Date().getFullYear()}</Footer>
    </AntLayout>
  )
}