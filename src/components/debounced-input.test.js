import { useState } from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { DebouncedInput } from './debounced-input'

const ExampleDebouncedInput = (props) => {
    const [value, setValue] = useState()
    return (
        <div>
            <p data-testid="example-debounced-value">{ value }</p>
            <DebouncedInput debounce={ 250 } setValue={ setValue } inputProps={{ "data-testid": "example-debounced-input" }} { ...props } />
        </div>
    )
}

it("DebouncedInput changes input value immediately", async () => {
    const { queryByLabelText, getByLabelText, getByTestId } = render(<ExampleDebouncedInput />)
    const input = getByTestId("example-debounced-input")
    const valueText = getByTestId("example-debounced-value")
    fireEvent.change(input, { target: { value: "test value" } })
    expect(input.value).toBe("test value")

})

it("DebouncedInput changes value after debounce delay", async () => {
    const { queryByLabelText, getByLabelText, getByTestId } = render(<ExampleDebouncedInput />)
    const input = getByTestId("example-debounced-input")
    const valueText = getByTestId("example-debounced-value")
    fireEvent.change(input, { target: { value: "test value" } })
    expect(input.textContent).not.toEqual("test value")
    await waitFor(() => {
        expect(valueText.textContent).toEqual("test value")
    })
})