import { useEffect, useState } from 'react'

export const useScrollPosition = () => {
    const [scrollPosition, setScrollPosition] = useState(0)

    useEffect(() => {
        let previousScrollPosition = 0
        let ticking = false
        const handleScroll = e => {
            previousScrollPosition = window.scrollY
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    setScrollPosition(previousScrollPosition)
                    ticking = false
                })
                ticking = true
            }
        }
        window.addEventListener('scroll', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    })
    
    return scrollPosition
}
