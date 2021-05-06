import React from 'react'
import styled from 'styled-components'
import { SearchResultLink } from './search-result-link';

const Wrapper = styled.div`
    flex-direction: column;
    max-height: 12rem;
    margin: 0.5rem 0;
    overflow-y: auto;
    padding: 1rem;
`
const List = styled.ul`
padding: 0 1rem;
`

const ListItem = styled.li``

export const VariablesList = ({ studyId, variables }) => {
    return (
        <Wrapper>
            <strong>Variables</strong>
            <List>
                {
                    variables.map(variable => (
                        <ListItem key={variable.id}>
                            <SearchResultLink to={variable.e_link}>{variable.id}: {variable.id}</SearchResultLink>
                        </ListItem>
                    ))
                }
            </List>
        </Wrapper>
    )
}