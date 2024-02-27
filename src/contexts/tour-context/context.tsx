import { Fragment, ReactNode, createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { useShepherdTour, Tour, ShepherdOptionsWithType } from 'react-shepherd'
import { useEnvironment } from '../environment-context'
import { SearchLayout, useHelxSearch } from '../../components/search'
import { SearchView } from '../../views'
import { useSyntheticDOMMask } from '../../hooks'
import 'shepherd.js/dist/css/shepherd.css'
const { useLocation, useNavigate } = require('@gatsbyjs/reach-router')

interface ShepherdOptionsWithTypeFixed extends ShepherdOptionsWithType {
    when?: any
}

export interface ITourContext {
    tour: any
}

export interface ITourProvider {
    children: ReactNode
}

export const TourContext = createContext<ITourContext|undefined>(undefined)

function setNativeValue(element: any, value: any) {
    const valueSetter = (Object as any).getOwnPropertyDescriptor(element, 'value').set;
    const prototype = (Object as any).getPrototypeOf(element);
    const prototypeValueSetter = (Object as any).getOwnPropertyDescriptor(prototype, 'value').set;

    if (valueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
    } else {
        valueSetter.call(element, value);
    }
}

export const TourProvider = ({ children }: ITourProvider ) => {
    const { context, routes, basePath} = useEnvironment() as any
    const { layout } = useHelxSearch() as any
    const location = useLocation()
    const navigate = useNavigate()

    const removeTrailingSlash = (url: string) => url.endsWith("/") ? url.slice(0, url.length - 1) : url
    const activeRoutes = useMemo<any[] | undefined>(() => {
        if (basePath === undefined) return undefined
        return routes.filter((route: any) => (
            removeTrailingSlash(`${removeTrailingSlash(basePath)}${route.path}`) === removeTrailingSlash(location.pathname)
        )).flatMap((route: any) => ([
            route,
            ...routes.filter((m: any) => m.path === route.parent)
        ])).map((route: any) => route.path)
    }, [basePath, routes])
    const isSearchActive = useMemo(() => activeRoutes?.some((route) => route.component instanceof SearchView), [activeRoutes])

    const searchBarDomMask = useSyntheticDOMMask(".search-bar, .search-button")

    const tourOptions = useMemo<Tour.TourOptions>(() => ({
        defaultStepOptions: {
            cancelIcon: {
                enabled: true
            },
            scrollTo: true,
            canClickTarget: true,
            classes: "",
            highlightClass: "tour-highlighted",
            buttons: [
                {
                    classes: 'shepherd-button-primary',
                    text: 'Back',
                    type: 'back'
                },
                {
                    classes: 'shepherd-button-primary',
                    text: 'Next',
                    type: 'next'
                }
            ]
        },
        useModalOverlay: true
    }), [])
    
    const tourSteps = useMemo<(ShepherdOptionsWithTypeFixed)[]>(() => ([
        {
            id: 'search.intro',
            attachTo: {
                element: searchBarDomMask.selector!,
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await navigate(basePath)
                const input = document.querySelector(".search-bar input") as HTMLInputElement
                if (input) input.focus()
            },
            buttons: [
                {
                    classes: 'shepherd-button-secondary',
                    text: 'Exit',
                    type: 'cancel'
                },
                {
                    classes: 'shepherd-button-primary',
                    text: 'Next',
                    type: 'next'
                }
            ],
            title: `Welcome to ${ context.meta.title }`,
            text: renderToStaticMarkup(
                <div>
                    You can search for biomedical concepts, studies, and variables here.<br /><br />
                    Try typing something and press enter or click search.
                </div>
            ),
            when: {
                show: () => { searchBarDomMask.showMask() },
                hide: () => { searchBarDomMask.hideMask() },
                cancel: () => { searchBarDomMask.hideMask() },
                complete: () => { searchBarDomMask.hideMask() }
            }
        },
        {
            id: 'search.concept.intro',
            attachTo: {
                element: ".result-card",
                on: 'right'
            },
            beforeShowPromise: async () => {},
            scrollTo: false,
            modalOverlayOpeningPadding: 16,
            title: `step 2`,
            text: renderToStaticMarkup(
                <div>
                    step 2
                </div>
            ),
            when: {
                show: () => { searchBarDomMask.showMask() },
                // hide: () => { searchBarDomMask.hideMask() },
                // cancel: () => { searchBarDomMask.hideMask() },
                // complete: () => { searchBarDomMask.hideMask() }
            }
        }
    ]), [isSearchActive, searchBarDomMask, basePath, navigate])

    const tour = useShepherdTour({ tourOptions, steps: tourSteps })
    
    useEffect(() => {
        let existingSettings = new Map<string, string | null>()
        // Some default UI behaviors are assumed for the tour (e.g. search will bring you to the concept view first)
        const override = (name: string, newValue: any) => {
            // console.info("overriding setting", name)
            existingSettings.set(name, localStorage.getItem(name))
            localStorage.setItem(name, JSON.stringify(newValue))
        }
        const restore = (name: string) => {
            // console.info("restoring setting", name)
            const restoredValue = existingSettings.get(name)!
            if (restoredValue === null) localStorage.removeItem(name)
            else localStorage.setItem(name, restoredValue)
        }
        const overrideSettings = () => {
            // console.log("overriding")
            override("search_history", [])
            override("search_layout", SearchLayout.GRID)
        }
        const restoreSettings = () => {
            // console.log("restoring", Array.from(existingSettings.keys()).length, "settings")
            Array.from(existingSettings.keys()).forEach((overridedSetting) => {
                restore(overridedSetting)
            })
        }

        const setup = () => {
            overrideSettings()
            window.addEventListener("beforeunload", cleanup)
        }
        const cleanup = () => {
            restoreSettings()
            window.removeEventListener("beforeunload", cleanup)
        }
        tour.on("start", setup)
        tour.on("complete", cleanup)
        tour.on("cancel", cleanup)
        return () => {
            tour.off("start", setup)
            tour.off("complete", cleanup)
            tour.off("cancel", cleanup)
            window.removeEventListener("beforeunload", cleanup)
        }
    }, [tour])

    return (
        <TourContext.Provider value={{
            tour,
        }}>
            { children }
        </TourContext.Provider>
    )
}

export const useTourContext = () => useContext(TourContext)