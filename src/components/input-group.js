import styled from 'styled-components'

export const InputGroup = styled.div(({ theme }) => `
  display: flex;
  & > * {
    border-radius: 0;
  }
  & > *:first-child {
    border-top-left-radius: ${ theme.border.radius };
    border-bottom-left-radius: ${ theme.border.radius };
  }
  & > *:last-child {
    border-top-right-radius: ${ theme.border.radius };
    border-bottom-right-radius: ${ theme.border.radius };
  }
`)
