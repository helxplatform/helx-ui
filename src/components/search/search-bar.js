import React, { useState } from 'react';
import styled from 'styled-components';
import { Input } from '../input';
import { useNavigate } from '@reach/router';

const Searchbar = styled.div(({ theme }) => `
    margin-left: 2vw;
    margin-right: 2vw;
    font-family: Arial, FontAwesome
`)

const Searchform = styled(Input)(({ theme }) => `
    border-radius: 5px;
`)

export const HeLxSearchBar = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // navigate to search page once enter is pressed
    const onKeyDown = (event) => {
        if (event.keyCode === 13) {
            navigate(`/search?q=${searchTerm}&p=1`)
            setSearchTerm('')
        }
    }

    return (
        <Searchbar>
            <Searchform placeholder="&#xF002;" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} onKeyDown={onKeyDown} />
        </Searchbar>
    )
}

