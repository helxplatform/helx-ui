import React, { useState } from 'react';
import styled from 'styled-components';

export const Tab = styled.button`
    font-size: 20px;
    padding: 10px 60px;
    opacity: 0.6;
    background: white;
    border: 0;
    outline: 0;
    ${({ active }) =>
        active &&
        `
    border-bottom: 2px solid black;
    opacity: 1;
  `}
    }
`

export const TabGroup = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`