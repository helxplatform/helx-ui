import { Fragment, useState } from 'react'
import { Layout as AntLayout, Button, Menu, Grid, Divider } from 'antd'
import { LinkOutlined } from '@ant-design/icons'
import { useLocation, Link } from '@gatsbyjs/reach-router'
import { useEnvironment, useAnalytics, useWorkspacesAPI } from '../../contexts';
import { MobileMenu } from './menu';
import { SidePanel } from '../side-panel/side-panel';
import './layout.css';

const { Header, Content, Footer } = AntLayout
const { useBreakpoint } = Grid

export const Layout = ({ children }) => {
  const { helxAppstoreUrl, routes, context, basePath } = useEnvironment()
  const { api, loading: apiLoading, loggedIn, appstoreContext } = useWorkspacesAPI()
  const { analyticsEvents } = useAnalytics()
  const { md } = useBreakpoint()
  const baseLinkPath = context.workspaces_enabled === 'true' ? '/helx' : ''
  const location = useLocation();

  // Logging out is an async operation. It's better to wait until it's complete to avoid 
  // session persistence errors (helx-278).
  const [loggingOut, setLoggingOut] = useState(false)

  const logout = async () => {
    setLoggingOut(true)
    analyticsEvents.logout()
    try {
      await api.logout()
    } catch (e) {}
    setLoggingOut(false)
    // logoutHandler(helxAppstoreUrl)
  }
  const removeTrailingSlash = (url) => url.endsWith("/") ? url.slice(0, url.length - 1) : url
  const activeRoutes = routes.filter((route) => (
    // route.text !== "" &&
    removeTrailingSlash(`${baseLinkPath}${route.path}`) === removeTrailingSlash(location.pathname)
  )).flatMap((route) => ([
    route,
    ...routes.filter((m) => m.path === route.parent)
  ])).map((route) => route.path)

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
              selectedKeys={activeRoutes}
              style={{ display: "flex", flexGrow: 1, justifyContent: "flex-end" }}
            >
              <Menu.Item style={{ visibility: 'hidden' }}></Menu.Item>
              <Menu.Item style={{ visibility: 'hidden' }}></Menu.Item>
              <Menu.Item style={{ visibility: 'hidden' }}></Menu.Item>
              {routes.map(m => m['text'] !== '' && (
                <Menu.Item key={`${m.path}`}><Link to={`${baseLinkPath}${m.path}`}>{m.text}</Link></Menu.Item>
              ))}
              {context.workspaces_enabled && !apiLoading && (
                appstoreContext.links.map((link) => (
                  <Menu.Item key={ link.title }>
                    <LinkOutlined style={{ marginRight: 12 }} />
                    <a href={ link.link } target="_blank" rel="noopener noreferrer">
                      { link.title }
                    </a>
                  </Menu.Item>
                ))
              )}
            </Menu>
            {context.workspaces_enabled === 'true' && !apiLoading && loggedIn && (
              <div style={{ height: "100%" }}>
                <Button
                  type="primary"
                  ghost
                  className="logout-button"
                  // Could use `loading` property but logout tends to happen so quickly that it doesn't work well.
                  disabled={ loggingOut }
                  onClick={logout}
                >
                  LOG OUT
                </Button>
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
      {
        context?.brand === 'heal'
        ? <Footer style={{ textAlign: 'center', paddingTop: 0 }}>
          NIH HEAL Semantic Search is powered by Dug, an open source semantic search developed
          by <a href="https://renci.org" target="_blank">RENCI</a> and <a href="https://www.rti.org/" target="_blank">RTI International</a>
        </Footer>
        : <Footer style={{ textAlign: 'center', paddingTop: 0 }}>&copy;{ context?.meta.title ?? 'HeLx' }{new Date().getFullYear()}</Footer>
      }
      <Footer style={{ textAlign: 'center', paddingTop: 0 }}></Footer>
    </AntLayout>
  )
}