import styled, { css, keyframes, useTheme } from 'styled-components'

const spin = keyframes`
    0% { transform: rotete(0deg);}
    100% {transform: rotate(360deg);}
`

export const CircleSpinner = styled.div`
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: ${spin} 2s linear infinite;
`