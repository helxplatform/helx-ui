import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { useStateCallback } from './use-state-callback'

interface SyntheticDOMMaskOptions {
    padding?: number | { top: number, right: number, bottom: number, left: number }
    resizeInterval?: number
    selectorInterval?: number
    blockClicks?: boolean
}

const prepareMaskContainer = (): HTMLDivElement => {
    const mask = document.createElement("div")
    mask.id = "mask-" + uuid()
    mask.style.position = "fixed"
    mask.style.zIndex = "999999"
    mask.style.pointerEvents = "none"
    mask.style.borderRadius = "4px"
    mask.style.display = "none"
    document.body.prepend(mask)
    return mask
}

export const useSyntheticDOMMask = (
    selector: string,
    options: SyntheticDOMMaskOptions = {}
) => {
    const { padding, resizeInterval, selectorInterval, blockClicks } = {
        padding: 0,
        resizeInterval: 0,
        selectorInterval: 10,
        blockClicks: false,
        ...options
    }

    const [mask] = useState<HTMLDivElement>(prepareMaskContainer)
    const [elements, setElements] = useState<Element[] | undefined>(undefined)
    const [elementMasks, setElementMasks] = useState<Map<Element, HTMLElement> | undefined>(undefined)
    const [show, setShow] = useStateCallback<boolean>(false)

    const showMask = useCallback(async () => {
        return new Promise<void>((resolve) => {
            setShow(true, () => resolve())
        })
    }, [])

    const context = useMemo(() => ({
        showMask,
        hideMask: () => setShow(false),
        selector: "#" + mask.id,
        originalSelector: selector,
        element: mask
    }) as const, [mask, selector])

    const [paddingTop, paddingRight, paddingBottom, paddingLeft] = useMemo(() => (typeof padding === "number" ? [
        padding,
        padding,
        padding,
        padding
    ] : [
        padding.top,
        padding.right,
        padding.bottom,
        padding.left
    ]), [padding])

    const resize = useCallback((element: HTMLElement, bb: DOMRect) => {
        const elBB = element.getBoundingClientRect()
        if (elBB.x !== bb.x) element.style.left = (bb.x) + "px"
        if (elBB.y !== bb.y) element.style.top = (bb.y) + "px"
        if (elBB.width !== bb.width) element.style.width = (bb.width) + "px"
        if (elBB.height !== bb.height) element.style.height = (bb.height) + "px"
    }, [])

    const computeMinimumBounds = useCallback((elements: Element[]): DOMRect => {
        if (elements.length === 0) return new DOMRect(0, 0, 0, 0)
        let [x1, y1, x2, y2] = [Infinity, Infinity, -Infinity, -Infinity]
        elements.forEach((element) => {
            const bb = element.getBoundingClientRect()
            if (bb.width === 0 || bb.height === 0) return
            x1 = Math.min(x1, bb.x - paddingLeft)
            y1 = Math.min(y1, bb.y - paddingTop)
            x2 = Math.max(x2, bb.right + paddingRight)
            y2 = Math.max(y2, bb.bottom + paddingBottom)
        })
        return new DOMRect(x1, y1, x2 - x1, y2 - y1)
    }, [paddingTop, paddingRight, paddingBottom, paddingLeft])

    useEffect(() => {
        mask.style.pointerEvents = blockClicks ? "auto" : "none"
    }, [mask, blockClicks])

    // Maintain up-to-date list of DOM elements matching the given selector
    useEffect(() => {
        const interval = window.setInterval(() => {
            const elements = Array.from(document.querySelectorAll(selector))
            setElements((oldElements) => {
                // We absolutely don't want to update if query set hasn't changed.
                // Can't use JSON comparison because of circular references in DOM nodes.
                if (!oldElements) return elements
                if (oldElements.length !== elements.length) return elements
                const equal = oldElements.every((oldElement, i) => {
                    const element = elements[i]
                    return element === oldElement
                })
                if (equal) return oldElements
                else return elements

            })
        }, selectorInterval)
        return () => {
            window.clearInterval(interval)
        }
    }, [selector, selectorInterval])

    // Make sure the mask displays properly and maintains correct position/size
    useEffect(() => {
        const observers: IntersectionObserver[] = []
        let cancelled = false
        if (!mask || !elementMasks) return
        if (!show) mask.style.display = "none"
        else {
            mask.style.display = "block"
            
            const resizeMasks = () => {
                const elements = Array.from(elementMasks.keys())
                const maskBounds = computeMinimumBounds(elements)
                elements.forEach((element) => {
                    const elementMask = elementMasks.get(element)!
                    const elementBB = element.getBoundingClientRect()
                    // Mask elements are positioned relative to the mask container
                    resize(elementMask, new DOMRect(
                        elementBB.x - maskBounds.x,
                        elementBB.y - maskBounds.y,
                        elementBB.width,
                        elementBB.height
                    ))
                })
                resize(mask, maskBounds)
            }
            
            const resizeLoop = () => {
                resizeMasks()
                if (!cancelled) window.requestAnimationFrame(resizeLoop)
            }
            resizeLoop()

            Array.from(elementMasks.keys()).forEach((element) => {
                const elementMask = elementMasks.get(element)!
            })

            /*
            Array.from(elementMasks.keys()).forEach((element) => {
                const elementMask = elementMasks.get(element)!
                elementMask.style.backgroundColor = "red"

                // For some reason, intersection observers not working on Chrome when root is specified...
                // The idea here is that we observe the intersection ratio between the mask and the element,
                // and if the ratio ever goes below 1.0 (100% intersection), then we know the element has changed
                // position/size and the mask needs to be resized. This would be the most "efficient" solution for us.
                
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        console.log(entry, entry.intersectionRatio)
                    })
                }, { root: element })
                observer.observe(element)
                observers.push(observer)
            })
            */
        }

        return () => {
            observers.forEach((observer) => observer.disconnect())
            cancelled = true
        }
    }, [mask, elementMasks, show, resizeInterval, computeMinimumBounds])

    // Generate the mask
    useEffect(() => {
        if (!elements) return

        // Delete old masks.
        mask.innerHTML = ""
        const newMasks = new Map<Element, HTMLElement>()
        elements.forEach((element) => {
            const maskElement = document.createElement("div")
            maskElement.style.backgroundColor = "transparent"
            maskElement.style.position = "absolute"
            mask.appendChild(maskElement)
            newMasks.set(element, maskElement)
        })

        setElementMasks(newMasks)
    }, [mask, elements])

    useEffect(() => {
        document.body.prepend(mask)
        return () => {
            mask.remove()
        }
    }, [])

    return context
}