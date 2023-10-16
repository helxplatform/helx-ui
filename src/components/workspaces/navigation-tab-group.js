import { navigate } from '@gatsbyjs/reach-router';
import { Tabs } from 'antd';
import './navigation-tab-group.css'

const { TabPane } = Tabs;

export const NavigationTabGroup = (props) => {
    const navigateHandler = (key) => {
        navigate(`/helx/workspaces/${key}`)
    }

    return (
        <Tabs
            size="large"
            className="navigation-tab-group"
            style={{ alignItems: 'center', justifyContent: 'center' }}
            defaultActiveKey={props.currentKey}
            onChange={(key) => navigateHandler(key)}>
            <TabPane tab="Available" key="available" />
            <TabPane tab="Active" key="active" />
        </Tabs>
    )
}