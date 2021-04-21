import React, { Fragment, useEffect, useState } from 'react'
import axios from 'axios';
import { loadApp, loadInstance } from '../api';
import styled, { useTheme } from 'styled-components'
import { Container } from '../components/layout'
import { Title, Paragraph } from '../components/typography'
import { Card } from '../components/card'
import { List, ListGrid } from '../components/list'
import { Button } from '../components/button'
import { Icon } from '../components/icon'
import { Link } from '../components/link'
import { Input } from '../components/input';
import { Dropdown } from '../components/dropdown';
import { Slider } from '../components/slider';
import { Tab, TabGroup } from '../components/tab';
import { useEnvironment } from '../contexts';
import DataTable from 'react-data-table-component';
import { useNotifications } from '../components/notifications';
import { navigate } from '@reach/router';
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
