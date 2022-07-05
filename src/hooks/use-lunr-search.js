/**
 * This is a light wrapper hook built on top of the useLunr hook to facilitate easy and quick use in components. 
 * The useLunr hook only offers the barebones functionality for interfacing with lunr, while this hook makes it easier
 * to construct and use a lunr index directly from document data.
 * 
 */

import { useCallback } from 'react'
import { useLunr } from './'

export const useLunrSearch = ({
    index: {
        ref,
        fields,
        tokenSeparator=undefined
    },
    docs
}) => {
    const initIndex = useCallback(function () {
        this.ref(ref)
        fields.forEach((field) => {
            this.field(field)
        })
        this.metadataWhitelist = ["position"]
        // Lunr has really bad docs for how the engine tokenizes text.
        // As far as I can tell, Lunr strictly uses pattern-based tokenization.
        // All punctuation marks and whitespace separate fields into tokens (by default it is only whitespace and hyphens).
        const separators = `\\s,\\.<>{}\\[\\]"':;!@#\\$%\\^&\\*\\(\\)-_\\+=~`
        if (tokenSeparator) {
            this.tokenizer.separator = tokenSeparator
        } else this.tokenizer.separator = new RegExp("[" + separators + "]")
    }, [docs, ref, fields, tokenSeparator])
    const populateIndex = useCallback((index) => {
        docs.forEach((doc) => index.add(doc))
    }, [docs])
    const { index, lexicalSearch } = useLunr(
        initIndex,
        populateIndex
    )
    return {
        index, lexicalSearch
    }
}