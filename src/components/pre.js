import React from 'react'
import styled from 'styled-components'

export const Wrapper = styled.pre(({ theme }) => `
  margin: ${ theme.spacing.medium } 0;
  padding: 0;
  background-color: ${ theme.color.black };
  display: flex;
  border-radius: ${ theme.border.radius };
  &:hover .line-numbers {
    opacity: 1.0;
  }
`)

const LineNumbers = styled.div.attrs({ className: 'line-numbers' })(({ theme }) => `
  background-color: ${ theme.color.grey.dark };
  padding: ${ theme.spacing.medium };
  line-height: 2;
  color: ${ theme.color.grey.main };
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-end;
  opacity: 0.5;
  transition: opacity 250ms;
`)

const CodeBody = styled.div(({ theme }) => `
  padding: ${ theme.spacing.medium };
  line-height: 2;
  flex: 1;
  background-color: ${ theme.color.black };
  color: ${ theme.color.extended.moss };
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`)

export const Pre = ({ children }) => {
  const lines = children.split('\n')
  return (
    <Wrapper>
      <LineNumbers>
        { lines.map((_, i) => <span>{ i + 1 }</span>) }
      </LineNumbers>
      <CodeBody>
        { children }
      </CodeBody>
    </Wrapper>
  )
}
