import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { animated, useTransition } from 'react-spring'

const Wrapper = styled.span`
    position: relative;
`

const Tip = styled(animated.div)(({ theme, width }) => `
    position: absolute;
    background-color: ${ theme.color.black };
    color: ${ theme.color.white };
    padding: ${ theme.spacing.extraSmall };
    text-align: center;
    font-size: 90%;
    min-width: ${ width };
    max-width: 200px;
    padding: ${ theme.spacing.extraSmall };
    z-index: 2;
`)

const TopTip = styled(Tip)(({ theme }) => `
    left: 50%;
    transform: translateX(-50%);
    padding-bottom: ${ theme.spacing.small };
    clip-path: polygon(0% 0%, 100% 0%, 100% calc(100% - 0.25rem), calc(50% - 0.25rem) calc(100% - 0.25rem), 50% 100%, calc(50% + 0.25rem) calc(100% - 0.25rem), 0% calc(100% - 0.25rem));
`)

const BottomTip = styled(Tip)(({ theme }) => `
    left: 50%;
    transform: translateX(-50%);
    padding-top: ${ theme.spacing.small };
    clip-path: polygon(0% 0.25rem, calc(50% - 0.25rem) 0.25rem, 50% 0%, calc(50% + 0.25rem) 0.25rem, 100% 0.25rem, 100% 100%, 0% 100%);
`)

const LeftTip = styled(Tip)(({ theme }) => `
    top: 50%;
    transform: translateY(-50%);
    padding-right: ${ theme.spacing.small };
    clip-path: polygon(0% 0%, calc(100% - 0.25rem) 0%, calc(100% - 0.25rem) calc(50% - 0.25rem), 100% 50%, calc(100% - 0.25rem) calc(50% + 0.25rem), calc(100% - 0.25rem) 100%, 0% 100%);
`)

const RightTip = styled(Tip)(({ theme }) => `
    top: 50%;
    transform: translateY(-50%);
    padding-left: ${ theme.spacing.small };
    clip-path: polygon(0.25rem 0%, 100% 0%, 100% 100%, 0.25rem 100%, 0.25rem calc(50% + 0.25rem), 0% 50%, 0.25rem calc(50% - 0.25rem));
`)

const globalFromStyle = {
    opacity: 0,
}
const globalEnterStyle = {
    opacity: 0.9,
}
const globalLeaveStyle = {
    opacity: 0,
}

export const Tooltip = ({ tip, placement, children }) => {
    const wrapperRef = useRef()
    const [active, setActive] = useState(false)
    const [stringPixelWidth, setStringPixelWidth] = useState(0)

    let ThisTip, tipTransition
    if (placement === 'top') {
        ThisTip = TopTip
        tipTransition = ({
            from: { ...globalFromStyle, bottom: `200%` },
            enter: { ...globalEnterStyle, bottom: `180%` },
            leave: { ...globalLeaveStyle, bottom: `200%` },
        })
    }
    if (placement === 'bottom') {
        ThisTip = BottomTip
        tipTransition = ({
            from: { ...globalFromStyle, top: `250%` },
            enter: { ...globalEnterStyle, top: `180%` },
            leave: { ...globalLeaveStyle, top: `250%` },
        })
    }
    if (placement === 'left') {
        ThisTip = LeftTip
        tipTransition = ({
            from: { ...globalFromStyle, right: '120%' },
            enter: { ...globalEnterStyle, right: '110%' },
            leave: { ...globalLeaveStyle, right: '120%' },
        })
    }
    if (placement === 'right') {
        ThisTip = RightTip
        tipTransition = ({
            from: { ...globalFromStyle, left: '120%' },
            enter: { ...globalEnterStyle, left: '110%' },
            leave: { ...globalLeaveStyle, left: '120%' },
        })
    }

    const transitions = useTransition(active, null, tipTransition)

    useEffect(() => { setStringPixelWidth(tip.length * 10) }, [tip])

    const handleShowTooltip = event => setActive(true)
    const handleHideTooltip = event => setActive(false)

    return (
        <Wrapper
            ref={ wrapperRef }
            onMouseEnter={ handleShowTooltip }
            onMouseLeave={ handleHideTooltip }
            onFocus={ handleShowTooltip }
            onBlur={ handleHideTooltip }
        >
            { children }
            { transitions.map(({ item, key, props }) => item && <ThisTip key={ key } style={ props } width={ `${ stringPixelWidth }px` }>{ tip }</ThisTip>) }
        </Wrapper>
    )
}

Tooltip.propTypes = {
    tip: PropTypes.string.isRequired,
    children: PropTypes.element.isRequired,
    placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
}

Tooltip.defaultProps = {
    placement: 'bottom',
}
