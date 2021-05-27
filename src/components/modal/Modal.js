import React, {Component} from 'react';
import styled from 'styled-components';

const Background = styled.div`
    width: 100vw;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.8);
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;    
`

const Content = styled.div`
    background-color: #636b6f;
    padding: 20px;
    border-radius: 10px;
    max-width: 100%;
    position: relative;    
`

export const FormGroup = styled.div`
    display: block;
	width: 300px;
	margin: 50px auto;
`;

export const FormButton = styled.button`
    right: 14px;
    position: absolute;
`

export const FormLabel = styled.label`
	margin-bottom: 0.6em;
	color: white;
    display: block;
`;

export const FormInput = styled.input`
	padding: 0.5em;
	background: white;
	border: none;
	border-radius: 3px;
	width: 100%;
	margin-bottom: 0.5em;
`;

class Modal extends Component {
    static Content = Content;
    static FormGroup = FormGroup;
    static FormLabel = FormLabel;
    static FormInput = FormInput;
    static FormButton = FormButton;

    render() {
        return (
            <Background { ...this.props }>
                { this.props.children }
            </Background>
    )
  }
};

export {Modal};