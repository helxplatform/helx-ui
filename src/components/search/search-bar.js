import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { Input } from '../input';
import { useNavigate } from '@reach/router';
import { Icon } from '../icon'

const Searchbar = styled.div(({ theme }) => `
    margin-left: ${ theme.spacing.md };
    height: 100%;
    color: white;
    font-size: 110%;
    position: relative;
    display: flex;
    align-items: center;
    background-color: ${ theme.color.grey.light };
    &:hover svg {
        filter: opacity(0.75);
    }
`)

const SearchInput = styled(Input)(({ theme }) => `
    background-color: transparent;
    height: 100%;
    border-radius: 0 !important;
    border: 0;
    outline: 0;
    filter: opacity(0.5);
    transition: filter 250ms;
    &:focus {
        filter: opacity(1.0);
    }
`)

const StyledSearchIcon = styled(Icon).attrs((({ theme }) => ({
    // fill: theme.color.grey.main,
})))(({ theme }) => `
    filter: opacity(0.25);
    margin-left: ${ theme.spacing.md };
`)

export const HeLxSearchBar = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // navigate to search page once enter is pressed
    const onKeyDown = (event) => {
        if (event.keyCode === 13) {
            navigate(`/helx/workspaces/search?q=${searchTerm}&p=1`)
            setSearchTerm('')
        }
    }

    return (
        <Searchbar>
            <StyledSearchIcon icon="magnifyingGlass" size={ 24 } />
            <SearchInput
              value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} onKeyDown={onKeyDown}
            />
        </Searchbar>
    )
}

