import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Icon } from './icon'
import styled from 'styled-components'

const Wrapper = styled.div`
    // border: 1px solid #f99; * { border: 1px solid #f99; }
    display: flex;
    flex-direction: column;
`

const Title = styled.div`
    flex: 1;
    padding: 0.5rem 0;
    padding-right: 1rem;
`

const OpenIndicator = styled.div(({ active }) => `
    padding: 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    svg {
        transition: fill 250ms, filter 250ms;
        fill: ${ active ? 'var(--color-crimson)' : 'black' };
    }
`)

const Header = styled.button(({ active }) => `
    padding: 0;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: stretch;
    background-color: transparent;
    border: 0;
    text-align: left;
    ${ Title } {
        color: ${ active ? 'var(--color-eggplant)' : 'var(--color-grey)' };
    }
    &:hover svg {
        filter: brightness(1.5);
    }
`)

const Body = styled.div(({ active, height }) => `
    flex: 1;
    overflow: hidden;
    transition: ${ active ? `max-height 250ms, opacity 500ms 100ms` : `max-height 500ms 100ms, opacity 250ms` };
    max-height: ${ height }px;
    opacity: ${ active ? 1 : 0 };
`)

export const Collapser = ({ title, ariaId, titleStyle, bodyStyle, children, openHandler, closeHandler }) => {
    const [active, setActive] = useState(false)
    const [bodyHeight, setBodyHeight] = useState(0)
    const contentElement = useRef(null)

    const handleToggle = () => {
        setActive(!active)
        if (active && closeHandler) { closeHandler() }
        if (!active && openHandler) {
            openHandler()
            setTimeout(() => setBodyHeight(active ? contentElement.current.scrollHeight : 0), 100)
        }
    }
    
    useEffect(() => {
        setTimeout(() => setBodyHeight(active ? contentElement.current.scrollHeight : 0), 100)
    }, [active, children])

    return (
        <Wrapper>
            <Header
                style={ titleStyle }
                active={ active }
                onClick={ handleToggle }
                aria-controls={ ariaId }
                aria-expanded={ active }
            >
                <Title active={ active }>{ title }</Title>
                <OpenIndicator active={ active }>
                    <Icon icon="chevronDown" size={ 24 } fill="var(--color-crimson)" />
                </OpenIndicator>
            </Header>
            <Body id={ ariaId } ref={ contentElement } style={ bodyStyle } active={ active } height={ bodyHeight }>
                { children }
            </Body>
        </Wrapper>
    )
}

Collapser.propTypes = {
    title: PropTypes.node.isRequired,
    ariaId: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    openHandler: PropTypes.func,
    closeHandler: PropTypes.func,
}
