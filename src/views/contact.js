import React from 'react';
import { Container } from '../components/layout/container';
import { Heading } from '../components/typography';

export const Contact = () => {
    return (
        <Container>
            <Heading>Get in touch</Heading>
            <div>For support or any help, please reach out to <a href="mailto:helx@lists.renci.org">helx@lists.renci.org.</a></div>
        </Container>
    )
}