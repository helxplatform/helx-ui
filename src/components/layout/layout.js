import { Layout as AntLayout , Menu, Typography } from 'antd'
import { Link } from '@reach/router'
import { Breadcrumbs } from './'

const { Header, Content, Footer } = AntLayout
const { Title } = Typography

export const Layout = ({ children }) => {
  return (
    <AntLayout className="layout">
      <Header>
        <Menu theme="dark" mode="horizontal">
          <Menu.Item key="about"><Link to="/about">About</Link></Menu.Item>
          <Menu.Item key="workspaces"><Link to="/workspaces">Workspaces</Link></Menu.Item>
          <Menu.Item key="semantic-search"><Link to="/search">Semantic Search</Link></Menu.Item>
          <Menu.Item key="documentation"><Link to="/documentation">Documentation</Link></Menu.Item>
          <Menu.Item key="contact"><Link to="/contact">Contact</Link></Menu.Item>
        </Menu>
      </Header>
      <Content>
        { children }
      </Content>
      <Footer style={{ textAlign: 'center' }}>&copy; HeLx { new Date().getFullYear() }</Footer>
    </AntLayout>
  )
}