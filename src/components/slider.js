import styled from 'styled-components';


export const Slider = styled.input(({ theme }) => `
    margin: 0 12px;
    width: 150px;
    height: 15px;
    border-radius: 5px;
    background-color: transparent;
    -webkit-appearance: none;

    :focus {
        outline: none;
    }

    ::-webkit-slider-runnable-track {
        width: 100%;
        height: 5px;
        cursor: pointer;
        opacity: 0.8;
        background: ${theme.color.info};
        border-radius: 1px;
    }

    ::-webkit-slider-thumb {
        height: 18px;
        width: 10px;
        border-radius: 25px;
        background: ${theme.color.info};
        cursor: pointer;
        -webkit-appearance: none;
        margin-top: -6px;
    }

    :hover::-webkit-slider-runnable-track {
        opacity: 1;
        -webkit-transition: opacity .2s;
      }

    ::-moz-range-track {
        width: 100%;
        height: 5px;
        cursor: pointer;
        animate: 0.2s;
        opacity: 0.8;
        background: ${theme.color.info};
        border-radius: 1px;
    }

    :hover::-moz-range-track{
        opacity: 1;
        -moz-transition: opacity .2s;
    }

    ::-moz-range-thumb {
        border: 1px solid ${theme.color.info};
        height: 15px;
        width: 8px;
        border-radius: 25px;
        background: ${theme.color.info};
        cursor: pointer;
    }

    ::-ms-track {
        width: 100%;
        height: 5px;
        cursor: pointer;
        animate: 0.2s;
        opacity: 0.8;
        background: transparent;
        border-color: transparent;
        color: transparent;
    }

    :hover::-ms-track {
        opacity: 1;
        transition: opacity .2s;
    }

    ::-ms-fill-lower {
        background: ${theme.color.info};
        border: 0px solid ${theme.color.info};
        border-radius: 2px;
    }

    ::-ms-fill-upper {
        background: ${theme.color.info};
        border: 0px solid ${theme.color.info};
        border-radius: 2px;
    }

    ::-ms-thumb {
        margin-top: 1px;
        border: 1px solid ${theme.color.info};
        height: 18px;
        width: 18px;
        border-radius: 25px;
        background: ${theme.color.info};
        cursor: pointer;
    }

    :hover::-ms-fill-lower {
        background: ${theme.color.info};
    }

    :hover::-ms-fill-upper {
        background: ${theme.color.info};
    }
`)