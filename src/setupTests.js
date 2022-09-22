// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { enableFetchMocks } from 'jest-fetch-mock'
import { mockEnvironmentContext, mockHelxSearch, setupAxiosMocker } from './__mocks__'

enableFetchMocks()
setupAxiosMocker()
mockEnvironmentContext()
mockHelxSearch()

window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
})

jest.resetModules()