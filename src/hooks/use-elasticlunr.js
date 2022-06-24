import { useMemo } from 'react'
import Elasticlunr from 'elasticlunr'

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