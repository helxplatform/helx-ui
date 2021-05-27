import { navigate } from '@reach/router';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

export const NavigationTabGroup = (props) => {
    const navigateHandler = (key) => {
        navigate(`/helx/workspaces/${key}`)
    }

    return (
        <Tabs defaultActiveKey={props.currentKey} onChange={(key) => navigateHandler(key)}>
            <TabPane tab="Available" key="available" />
            <TabPane tab="Active" key="active" />
        </Tabs>
    )
}