import { useMemo, useCallback } from 'react'
import Elasticlunr from 'elasticlunr'
import lunr, { tokenizer as lunrTokenizer } from 'lunr'

export const useElasticlunr = (initIndex, populateIndex) => {
    const index = useMemo(() => {
        const idx = new Elasticlunr(initIndex)
        populateIndex(idx)
        return idx
    }, [initIndex, populateIndex])
    return {
        index
    }
}
export const useLunr = (initIndex, populateIndex) => {
    const index = useMemo(() => {
        const idx = lunr(function () {
            initIndex.call(this)
            populateIndex.call(null, this)
        })
        return idx
    }, [initIndex, populateIndex])
    // Takes a lexical search, i.e. a user inputted search query, transforms it into a lunr search query, and executes the search.
    const lexicalSearch = useCallback((searchQuery, options={
        fuzziness: 1
    }) => {
        const { fuzziness } = options
        const tokens = lunrTokenizer(searchQuery)

       // Build tokenized search terms into a generalized lunr query with fuzziness and prefix search.
       const results = index.query(function (q) {
           tokens.forEach(({ str: token }) => {
               // Basic search
               q.term(token, { boost: 100 })
               // Trailing wildcard search (prefix search)
               q.term(token, { boost: 10, usePipeline: false, wildcard: lunr.Query.wildcard.TRAILING })
               if (fuzziness) {
                   // Fuzzy search without prefix
                   q.term(token, { boost: 1, usePipeline: false, editDistance: fuzziness })
               }
           })
       })
       return results
    }, [index])
    return {
        index,
        lexicalSearch
    }
}