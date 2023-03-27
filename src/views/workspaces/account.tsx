import { Button, Col, Form, Input, Layout, Modal, Table, Typography, Slider, Spin, Row } from 'antd';
import { withWorkspaceAuthentication } from './'
import { useTitle } from '../'
import { Breadcrumbs } from '../../components/layout'

export const AccountView = withWorkspaceAuthentication(() => {
    const breadcrumbs = [
        { text: 'Home', path: '/helx' },
        { text: 'Workspaces', path: '/helx/workspaces' },
        { text: 'Account', path: '/helx/workspaces/account' },
    ]

    useTitle(["Account", "Workspaces"])

    return (
        <Layout>
            <Breadcrumbs crumbs={breadcrumbs} />
        </Layout>
    )
})