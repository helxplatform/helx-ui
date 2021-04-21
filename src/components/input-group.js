import styled from 'styled-components'

export const InputGroup = styled.div(({ theme }) => `
  display: flex;
  flex-direction: column;
  @media (min-width: 800px) {
    flex-direction: row;
  }
  & > * {
    border-radius: 0;
  }
  & > *:first-child {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-top-left-radius: ${ theme.border.radius };
    border-top-right-radius: ${ theme.border.radius };
    @media (min-width: 800px) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-top-left-radius: ${ theme.border.radius };
      border-bottom-left-radius: ${ theme.border.radius };
    }
  }
  & > *:last-child {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: ${ theme.border.radius };
    border-bottom-right-radius: ${ theme.border.radius };
    @media (min-width: 800px) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-top-right-radius: ${ theme.border.radius };
      border-bottom-right-radius: ${ theme.border.radius };
    }
  }
`)
