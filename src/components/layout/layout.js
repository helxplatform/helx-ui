import { Layout as AntLayout, Button, Menu } from 'antd'
import { Link } from '@reach/router'
import { useEnvironment } from '../../contexts/environment-context';
import { logoutHandler } from '../../api/';
import './layout.css';

const { Header, Content, Footer } = AntLayout

export const Layout = ({ children }) => {
  const { helxAppstoreUrl, context } = useEnvironment()

  return (
    <AntLayout className="layout">
      <Header style={{ display: 'flex', zIndex: 1, width: '100%', background: '#fff' }}>
        {context !== undefined ? <Link to="/helx"><img className="brand_img" src={'' + helxAppstoreUrl + context.logo_url} alt="Go Home"></img></Link> : <span />}
        <Menu style={{ position: 'absolute', right: '2px'}} theme="light" mode="horizontal">
          <Menu.Item key="semantic-search"><Link to="/helx/search">Semantic Search</Link></Menu.Item>
          <Menu.Item key="workspaces"><Link to="/helx/workspaces">Workspaces</Link></Menu.Item>
          <Menu.Item key="documentation"><Link to="/helx/documentation">Documentation</Link></Menu.Item>
          <Menu.Item key="contact"><Link to="/helx/contact">Contact</Link></Menu.Item>
          <Menu.Item key="logout" className="logout"><Button onClick={() => logoutHandler()}>LOG OUT</Button></Menu.Item>
        </Menu>
      </Header>
      <Content>
        {children}
      </Content>
      <Footer style={{ textAlign: 'center' }}>&copy; HeLx {new Date().getFullYear()}</Footer>
    </AntLayout>
  )
}