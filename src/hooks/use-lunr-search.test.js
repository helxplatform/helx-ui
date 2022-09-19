import { useMemo } from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { useLunrSearch } from './use-lunr-search'

const docs = [{
    "name": "Lunr",
    "text": "Like Solr, but much smaller, and not as bright."
}, {
    "name": "React",
    "text": "A JavaScript library for building user interfaces."
}, {
    "name": "Lodash",
    "text": "A modern JavaScript utility library delivering modularity, performance & extras."
}]

const useExampleLunrSearch = ({ docs }) => {
    const lunrConfig = useMemo(() => ({
        docs,
        index: {
            ref: "name",
            fields: [
                "name",
                "text"
            ]
        }
    }), [docs])
    const { index, lexicalSearch } = useLunrSearch(lunrConfig)
    return lexicalSearch

}

describe("useLunrSearch", () => {
    let search
    beforeEach(() => {
        const { result } = renderHook(() => useExampleLunrSearch({ docs }))
        search = result.current
    })
    it("returns correct results", () => {
        expect(search("react").hits.length).toEqual(1)
        expect(search("javascript").hits.length).toEqual(2)
    })
})