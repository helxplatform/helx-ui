import React from 'react'
import PropTypes from 'prop-types'
import { useHelxSearch } from './search-context';
import styled, { css } from 'styled-components'
import ReactJson from 'react-json-view'

const Wrapper = styled.article(({ theme }) => css`
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
  & .details {
    flex: 1;
  }
  & .react-json-view {
    padding: 1rem;
  }
  animation: ${theme.animation.fadeIn};
`)

export const Result = ({ index, result }) => {
  const { doSelect } = useHelxSearch();
  return (
    <Wrapper>
      <div className="checkbox"><input type="checkbox" onChange={() => doSelect(result)}></input></div>
      <div className="index">{index}</div>
      <div className="details">
        <div className="result-heading">
          <span className="name">{result.name}</span>
          <span className="id"><em>{result.tag_id}</em></span>
        </div>
        <ReactJson src={result} collapsed={true} enableClipboard={false} theme="monokai" style={{ borderRadius: '3px' }} />
      </div>
    </Wrapper>
  )
}

Result.propTypes = {
  index: PropTypes.number.isRequired,
  result: PropTypes.object.isRequired,
}
