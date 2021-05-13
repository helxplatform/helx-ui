import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Modal } from '../layout/';
import { Button } from '../button';
import { Card } from '../card';
import { userHandler, logoutHandler } from '../../api/api';
import { useEnvironment } from '../../contexts/environment-context';

const TimeoutModal = styled(Modal)`
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    background: rgba(0,0,0,0.5);
    display: ${({ show }) => (show ? 'flex' : 'none')};
    align-items: center;
    justify-content: center;
`

const TimeoutCard = styled(Card)`
    width: 25%;
    height: 25%;
    font-size: 133%;
`

const TimeoutButtonGroup = styled.div`
    display: flex;
    justify-content:space-around;
`

export const SessionTimeout = ({ children }) => {
    const { timeoutSeconds } = useEnvironment();
    const reminderSeconds = 195;
    const [isExpired, setExpired] = useState(false);
    let reminderModal_timer;
    let sessionEnd_timer;

    const setTimer = () => {
        reminderModal_timer = setTimeout(() => {
            setExpired(true);
        }, (timeoutSeconds - reminderSeconds) * 1000);
        sessionEnd_timer = setTimeout(() => {
            setExpired(false);
            logoutHandler()
        }, timeoutSeconds * 1000)
    }

    const resetTimer = () => {
        clearTimeout(reminderModal_timer);
        clearTimeout(sessionEnd_timer);
        userHandler();
        setTimer();
        setExpired(false);
    }

    useEffect(() => {
        resetTimer();
    }, [])


    return (
        <div>
            <TimeoutModal show={isExpired}>
                <TimeoutCard>
                    <Card.Header><b>Your session is about to end</b></Card.Header>
                    <Card.Body>
                        You've been inactive for a while. For your security, HeLx will automatically sign you out and you might lose your working data. Choose "Stay signed in" to continue or "Sign Out" if you're done.
                    </Card.Body>
                    <Card.Footer>
                        <TimeoutButtonGroup>
                            <Button onClick={logoutHandler} variant="danger">Sign Out</Button>
                            <Button onClick={resetTimer}>Stay signed in</Button>
                        </TimeoutButtonGroup>
                    </Card.Footer>
                </TimeoutCard>
            </TimeoutModal>
            {children}
        </div>
    )
}