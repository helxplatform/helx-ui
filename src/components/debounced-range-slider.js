import { Slider } from 'antd'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

export const DebouncedRangeSlider = ({ value, onChange, onInternalChange=() => {}, debounce=500, ...props }) => {
    const [_internalValue, setInternalValue] = useState(undefined)
    const [internalValue] = useDebounce(_internalValue, debounce)

    const internalOnChange = (range) => {
        setInternalValue(range)
    }

    useEffect(() => {
        setInternalValue(value)
    }, [value])

    useEffect(() => {
        onChange(internalValue)
    }, [internalValue])

    useEffect(() => {
        onInternalChange(_internalValue)
    }, [_internalValue])

    return (
        <Slider
            range
            value={ _internalValue }
            onChange={ internalOnChange }
            { ...props }
        />
    )
}