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

describe("DebouncedInput", () => {
    describe("when input changes", () => {
        const delay = 250
        let input, valueText
        beforeEach(() => {
            const { getByTestId } = render(<ExampleDebouncedInput debounce={ delay } />)
            input = getByTestId("example-debounced-input")
            valueText = getByTestId("example-debounced-value")
            fireEvent.change(input, { target: { value: "test value" } })
        })
        it("the input text changes immediately", () => {
            expect(input.value).toBe("test value")
        })
        it("value changes after debounce delay", async () => {
            const startTime = performance.now()
            expect(input.textContent).not.toEqual("test value")
            // This will wait until either valueText updates to the debounced test or it times out.
            await waitFor(() => expect(valueText.textContent).toEqual("test value"))
            // Ensure that valueText does not update its value in less time than the debounced delay.
            expect(performance.now() - startTime).toBeGreaterThanOrEqual(delay)
        })
    })
})