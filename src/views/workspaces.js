import React, { useState } from 'react'
import { Container } from '../components/layout'
import { Tab, TabGroup } from '../components/tab';
import { Available } from './available';
import { Active } from './active';


export const Workspaces = () => {
  const [tab, setTab] = useState('Available');

  return (
    <Container>
      <TabGroup>
        <Tab active={tab === 'Available'} onClick={() => setTab('Available')}>Available</Tab>
        <Tab active={tab === 'Active'} onClick={() => setTab('Active')}>Active</Tab>
      </TabGroup>
      {tab === 'Available' ? <Available /> : <Active />}
    </Container>
  )
}
