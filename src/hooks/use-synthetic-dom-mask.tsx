import { useCallback, useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'

export const useSyntheticDOMMask = (selector: string, boundInterval: number = 10, selectorInterval: number = 1000) => {
    // const mask = useRef<HTMLDivElement>(document.createElement("div"))
    const [elements, setElements] = useState<Element[] | undefined>(undefined)
    const [mask, setMask] = useState<HTMLDivElement | undefined>(undefined)
    const [elementMasks, setElementMasks] = useState<Map<Element, HTMLElement> | undefined>(undefined)
    const [show, setShow] = useState<boolean>(false)
    const maskContainerId = useRef<string>("mask-" + uuid())

    const resize = (element: HTMLElement, bb: DOMRect) => {
        element.style.top = (bb.top) + "px"
        element.style.left = (bb.left) + "px"
        element.style.width = (bb.width) + "px"
        element.style.height = (bb.height) + "px"
    }

    const computeMinimumBounds = (elements: Element[]): DOMRect => {
        if (elements.length === 0) throw new Error()
        let [x1, y1, x2, y2] = [Infinity, Infinity, -Infinity, -Infinity]
        elements.forEach((element) => {
            const bb = element.getBoundingClientRect()
            if (bb.width === 0 || bb.height === 0) return
            x1 = Math.min(x1, bb.x)
            y1 = Math.min(y1, bb.y)
            x2 = Math.max(x2, bb.right)
            y2 = Math.max(y2, bb.bottom)
        })
        return new DOMRect(x1, y1, x2 - x1, y2 - y1)
    }

    useEffect(() => {
        const interval = window.setInterval(() => {
            const elements = Array.from(document.querySelectorAll(selector))
            const equal = (elems1: Element[], elems2: Element[]): boolean => {
                if (elems1.length !== elems2.length) return false
                return elems1.every((e1) => {
                    return elems2.includes(e1)
                })
            }
            setElements((oldElements) => {
                if (oldElements === undefined) return elements
                if (equal(oldElements, elements)) return oldElements
                return elements
            })
        }, selectorInterval)
        return () => {
            window.clearInterval(interval)
        }
    }, [selector, selectorInterval])

    useEffect(() => {
        let interval: number
        if (!mask || !elementMasks) return
        if (!show) mask.remove()
        else {
            document.body.prepend(mask)
            interval = window.setInterval(() => {
                const elements = Array.from(elementMasks.keys())
                elements.forEach((element) => {
                    const elementMask = elementMasks.get(element)!
                    resize(elementMask, element.getBoundingClientRect())
                })
                resize(mask, computeMinimumBounds(elements))
            }, boundInterval)
        }

        return () => {
            mask.remove()
            window.clearInterval(interval)
        }
    }, [mask, elementMasks, show, boundInterval])

    useEffect(() => {
        if (!elements) return
        const maskContainer = document.createElement("div")
        maskContainer.id = maskContainerId.current
        maskContainer.style.position = "fixed"
        maskContainer.style.zIndex = "999999"
        maskContainer.style.pointerEvents = "none"

        const masks = new Map<Element, HTMLElement>()
        elements.forEach((element) => {
            const maskElement = document.createElement("div")
            maskElement.style.backgroundColor = "transparent"
            maskElement.style.position = "fixed"
            maskContainer.appendChild(maskElement)
            masks.set(element, maskElement)
        })

        setMask(maskContainer)
        setElementMasks(masks)

    }, [elements])

    return {
        showMask: () => setShow(true),
        hideMask: () => setShow(false),
        selector: "#" + maskContainerId.current
    } as const
}