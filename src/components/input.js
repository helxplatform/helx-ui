import styled from 'styled-components'

export const Input = styled.input(({ theme }) => `
  height: ${ theme.spacing.extraLarge };
  border: 1px solid ${ theme.color.grey.main };
  padding: ${ theme.spacing.small } ${ theme.spacing.medium };
`)
