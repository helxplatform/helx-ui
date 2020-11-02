import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Wrapper = styled.button`
    z-index: 2;
    cursor: pointer;
    border: none;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    transition: filter 250ms;
    &:hover, &:focus {
        filter: brightness(0.75);
    }
`

const Line = styled.line(({ theme, active }) => `
    transform-origin: 50% 50%;
    transition: transform 250ms, stroke 250ms, opacity 250ms;
    transform-origin: 50% 50%;
    stroke: ${ active ? theme.color.danger : theme.color.primary.main };
    &:nth-child(1) {
        transform: ${ active ? 'rotate(45deg) translateY(8px)' : 'rotate(0deg) translateY(0%)' };
    }
    &:nth-child(2) {
        transform: ${ active ? 'scaleX(0.1)' : 'scaleX(1.0)' };
        opacity: ${ active ? 0 : 1 };
    }
    &:nth-child(3) {
        transform: ${ active ? 'rotate(-45deg) translateY(-8px)' : 'rotate(0deg) translateY(0%)' };
    }
`)

export const Toggler = ({ active, ...props }) => {
    return (
        <Wrapper { ...props }>
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
                x="0px" y="0px" width="28px" height="20px" viewBox="0 0 28 20"
                strokeWidth="3" strokeLinecap="round"
            >
                <Line x1="2" y1="2" x2="26" y2="2" active={ active } />
                <Line x1="2" y1="10" x2="26" y2="10" active={ active } />
                <Line x1="2" y1="18" x2="26" y2="18" active={ active } />
            </svg>
        </Wrapper>
    )
}

Toggler.propTypes = {
    active: PropTypes.bool.isRequired,
}
