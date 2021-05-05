import React, { useState } from 'react';
import { navigate } from '@reach/router';
import { Tab, TabGroup } from '../tab';

export const WorkSpaceTabGroup = (props) => {
    const [tab, setTab] = useState(props['tab']);

    const tabClickHandler = (newTab) => {
        setTab(newTab);
        navigate(`/helx/workspaces/${newTab}`)
    }

    return (
        <TabGroup>
            <Tab active={tab === 'search'} onClick={() => tabClickHandler('search')}>Semantic Search</Tab>
            <Tab active={tab === 'available'} onClick={() => tabClickHandler('available')}>Available</Tab>
            <Tab active={tab === 'active'} onClick={() => tabClickHandler('active')}>Active</Tab>
        </TabGroup>
    )
}