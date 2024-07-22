import { Fragment, useEffect } from 'react'
import { Typography } from 'antd'
import { useAnalytics, useEnvironment } from '../contexts'
import { useTitle } from './'
import {faqsOpened, userGuideOpened} from "../contexts/analytics-context/events/support-events";

const { Title } = Typography

// This section points to a portal to report bugs, submit feedback, or feature requests for the deployments.
const HelpPortal = (context) =>{
  const { analyticsEvents } = useAnalytics()
  return (
    <Fragment>
        <Title level={1}>Need Help?</Title>
        <div style={{ fontSize: 15 }}>
          <Typography>To report a bug, request technical assistance, submit user feedback, or submit a different request, visit our Help Portal.</Typography>
          <ul>
              <li>
                <a
                  //example href="http://bit.ly/HEALSemanticSearch_Help"
                  href={context.help_portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={ () => {
                    analyticsEvents.helpPortalOpened()
                  } }
                >
                  <b>Help Portal</b>
                </a>
              </li>
          </ul>
        </div>
    </Fragment>
  )
}

// This section links to a user documentation.
const UserGuide = (context) => {
  const { analyticsEvents } = useAnalytics()
  return (
      <li>
          <a
              //example href="https://docs.google.com/document/d/1M43Ex0eg_ObvXIGvWFUuwqKAYpWATXa8vYSpB5gUa6Q/edit?pli=1"
              href = {context.user_guide_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={ () => {
                  analyticsEvents.userGuideOpened()
              } }
          >
              <b>User Guide</b>
          </a>
      </li>
  )
 }

 // This section points a link with FAQs.
 const Faqs = (context) => {
  const { analyticsEvents } = useAnalytics()
  return (
      <li>
          <a
              href= {context.faqs_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={ () => {
                  analyticsEvents.faqsOpened()
              } }
          >
            <b>FAQs</b>
          </a>
      </li>
  )
 }

 // This section combines user guide, and faqs together.
 const Documentation = (context) => {
  return (
    <Fragment>
        <Title level={1}>Documentation</Title>
        <Typography>
          Our documentation is designed to help guide you through your first steps. 
          We encourage you to get started with these introductory guides
        </Typography>
        <ul>
          {context.user_guide_url && <UserGuide user_guide_url={context.user_guide_url} />}
          {context.faqs_url && <Faqs faqs_url={context.faqs_url} />}
        </ul>
      </Fragment>
  )
 }



export const SupportView = () => {
  const { context } = useEnvironment()
  useTitle("Support")
  console.log(context.support.help_portal_url)
  return (
    <Fragment>
      {context.support.help_portal_url && <HelpPortal help_portal_url={context.support.help_portal_url} />}
      {(context.support.user_guide_url || context.support.faqs_url) && <Documentation user_guide_url={context.support.user_guide_url} faqs_url={context.support.faqs_url}/>}
    </Fragment>
  )
}
      