import { ExternalLink } from '../link'
import styled from 'styled-components'

export const SearchResultLink = styled(ExternalLink)(({ theme }) => `
    color: ${theme.color.primary.dark};
`)