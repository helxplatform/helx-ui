import React from 'react'
import PropTypes from 'prop-types'
import { useHelxSearch } from './search-context';
import styled, { css } from 'styled-components'
import ReactJson from 'react-json-view'
import { Icon } from '../icon'
import { Button } from '../button'

const Wrapper = styled.article(({ theme, selected }) => css`
  margin: 1rem 0;
  display: flex;
  align-items: flex-start;
  & input[type=checkbox]{
    margin-top: 2px;
    transform: scale(1.5);
  }
  & .index {
    padding: 0 1rem;
    min-width: 3rem;
    display: flex;
    justify-content: flex-end;
    color: ${ selected ? theme.color.success : 'inherit' };
    transition: color 250ms;
  }
  & .details {
    flex: 1;
  }
  & .result-heading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    @media (min-width: 400px) {
      justify-content: space-between;
      flex-direction: row;
    }
  }
  & .result-json {
    position: relative;
    overflow: hidden;
    & ${ ResultSelector } {
      transform: translateY(calc(-100% + ${ theme.spacing.sm }));
      background-color: ${ selected ? theme.color.success : theme.color.grey.dark };
    }
    &:hover ${ ResultSelector } {
      transform: translateY(0);
    }
  }
  & .react-json-view {
    padding: 1rem;
  }
  animation: ${theme.animation.fadeIn};
`)

const ResultSelector = styled(Button).attrs({ shadow: false })(({ theme, selected }) => `
  position: absolute;
  top: 0;
  right: 0;
  padding: ${ theme.spacing.sm };
  border-bottom-right-radius: 0;
  border-top-left-radius: 0;
  transition: transform 250ms, filter 250ms;
`)

export const Result = ({ index, result }) => {
  const { resultsSelected, doSelect } = useHelxSearch();

  return (
    <Wrapper selected={resultsSelected.has(result.id)}>
      <div className="index">{index}</div>
      <div className="details">
        <div className="result-heading">
          <span className="name">{result.name}</span>
          <span className="id"><em>{result.tag_id}</em></span>
        </div>
        <div className="result-json">
          <ReactJson src={result} collapsed={true} enableClipboard={false} theme="monokai" style={{ borderRadius: '3px' }} />
          <ResultSelector onClick={() => doSelect(result)}>
            <Icon icon={resultsSelected.has(result.id) ? 'check' : 'add' } fill="#eee" />
          </ResultSelector>
        </div>
      </div>
    </Wrapper>
  )
}

Result.propTypes = {
  index: PropTypes.number.isRequired,
  result: PropTypes.object.isRequired,
}
