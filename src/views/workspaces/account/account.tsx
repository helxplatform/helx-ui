import { Fragment } from 'react'
import { Layout, Typography, Menu } from 'antd'
import { withWorkspaceAuthentication } from '../'
import { AccountLayout } from './account-layout'
import { useTitle } from '../../'
import { Breadcrumbs } from '../../../components/layout'
import './account.css'

const { Title, Text } = Typography
const { Header, Sider, Content } = Layout

const breadcrumbs = [
    { text: 'Home', path: '/helx' },
    { text: 'Workspaces', path: '/helx/workspaces' },
    { text: 'Account', path: '/helx/workspaces/account' },
]

interface AccountViewProps {
    tab: string
}

export const AccountView = withWorkspaceAuthentication(({ tab }: AccountViewProps) => {
    useTitle(["Account", "Workspaces"])

    return (
        <Fragment>
            <Breadcrumbs crumbs={breadcrumbs} />
            <Title level={ 1 }>Account</Title>
            <AccountLayout tab={ tab } />
        </Fragment>
    )
})