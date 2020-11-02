import React from 'react'
import styled, { useTheme } from 'styled-components'
import { Container } from '../components/layout'
import { Section } from '../components/section'
import { Title, Heading, Subheading, Paragraph } from '../components/typography'
import { Button } from '../components/button'
import { Icon } from '../components/icon'
      
const IconPreview = styled(Icon)(({ theme }) => `
  margin: ${ theme.spacing.small };
`)

export const Branding = () => {
  const theme = useTheme()
  return (
    <Container>
      <Title>HeLx Branding</Title>
      <Paragraph>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
        cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
        proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </Paragraph>

      <Section>
        <Heading>Buttons</Heading>

        <Subheading>Active</Subheading>

        <Button>Regular</Button> &nbsp;
        <Button variant="danger">Danger</Button> &nbsp;
        <Button variant="warning">Warning</Button> &nbsp;
        <Button variant="info">Info</Button> &nbsp;
        <Button variant="success">Success</Button> &nbsp;

        <Subheading>Disabled</Subheading>

        <Button disabled>Regular</Button> &nbsp;
        <Button disabled variant="danger">Danger</Button> &nbsp;
        <Button disabled variant="warning">Warning</Button> &nbsp;
        <Button disabled variant="info">Info</Button> &nbsp;
        <Button disabled variant="success">Success</Button> &nbsp;

        <Subheading>Small</Subheading>

        <Button small>Regular</Button> &nbsp;
        <Button small variant="danger">Danger</Button> &nbsp;
        <Button small variant="warning">Warning</Button> &nbsp;
        <Button small variant="info">Info</Button> &nbsp;
        <Button small variant="success">Success</Button> &nbsp;

      </Section>

      <Section>
        <Heading>Icons</Heading>
        <IconPreview icon="app" fill={ theme.color.primary.dark } size={ 48 } />
        <IconPreview icon="app-restart" fill={ theme.color.primary.dark } size={ 48 } />
        <IconPreview icon="data-save" fill={ theme.color.primary.dark } size={ 48 } />
        <IconPreview icon="data-find" fill={ theme.color.primary.dark } size={ 48 } />
        <IconPreview icon="data-secure" fill={ theme.color.primary.dark } size={ 48 } />
      </Section>
    </Container>
  )
}
