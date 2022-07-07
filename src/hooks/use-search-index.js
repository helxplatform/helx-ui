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
      // Can be either a number or a function with signature (term: string) => number (e.g. if you want to increase fuzziness for longer terms)
      // By default, use fuzziness of 1 character and give an extra character of fuzziness to terms longer than 4 characters.
      fuzziness: (term) => term.length >= 5 ? 2 : 1,
      prefixSearch: true
   }) => {
      const {
         prefixSearch=true,
         fuzziness=(term) => term.length >= 5 ? 2 : 1
      } = options
      const tokens = lunrTokenizer(searchQuery)

      // Build tokenized search terms into a generalized lunr query with fuzziness and prefix search.
      const results = index.query(function (q) {
         tokens.forEach(({ str: token }) => {
            // Basic search
            q.term(token, { boost: 100 })
            if (prefixSearch) {
               // Trailing wildcard search (prefix search)
               q.term(token, { boost: 10, usePipeline: false, wildcard: lunr.Query.wildcard.TRAILING })
            }
            if (fuzziness) {

               // Fuzzy search without prefix
               q.term(token, { boost: 1, usePipeline: false, editDistance: typeof fuzziness === 'function' ? fuzziness.call(null, token) : fuzziness })
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