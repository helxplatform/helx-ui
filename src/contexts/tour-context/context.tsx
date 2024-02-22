import { Fragment, ReactNode, createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { useShepherdTour, Tour, ShepherdOptionsWithType } from 'react-shepherd'
import { useEnvironment } from '../environment-context'
import { SearchLayout } from '../../components/search'
import { useSyntheticDOMMask } from '../../hooks'
import 'shepherd.js/dist/css/shepherd.css'

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
    const { context } = useEnvironment() as any

    // const searchBarDomMask = useSyntheticDOMMask(".search-bar, .search-button, .search-autocomplete-suggestions")

    const tourOptions = useMemo<Tour.TourOptions>(() => ({
        defaultStepOptions: {
            cancelIcon: {
                enabled: true
            }
        },
        useModalOverlay: true
    }), []);
    
    const tourSteps = useMemo<ShepherdOptionsWithType[]>(() => ([
        {
            id: 'intro',
            attachTo: {
                element: ".search-bar",
                on: 'bottom'
            },
            beforeShowPromise: async () => {},
            buttons: [
                {
                    classes: 'shepherd-button-secondary',
                    text: 'Exit',
                    type: 'cancel'
                },
                // {
                //     classes: 'shepherd-button-primary',
                //     text: 'Back',
                //     type: 'back'
                // },
                {
                    classes: 'shepherd-button-primary',
                    text: 'Next',
                    type: 'next'
                }
            ],
            classes: 'custom-1',
            highlightClass: 'highlight',
            scrollTo: false,
            cancelIcon: {
                enabled: true,
            },
            canClickTarget: true,
            title: `Welcome to ${ context.meta.title }`,
            text: renderToStaticMarkup(
                <div>
                    You can search for biomedical concepts, studies, and variables here.<br /><br />
                    Try typing something and press enter.
                </div>
            ),
            when: {
                show: () => {},
                hide: () => {},
                cancel: () => {},
                complete: () => {}
            }
        }
    ]), [])

    const tour = useShepherdTour({ tourOptions, steps: tourSteps })
    
    useEffect(() => {
        let existingSettings = new Map<string, string | null>()
        // Some default UI behaviors are assumed for the tour (e.g. search will bring you to the concept view first)
        const override = (name: string, newValue: any) => {
            console.log("overriding setting", name)
            existingSettings.set(name, localStorage.getItem(name))
            localStorage.setItem(name, JSON.stringify(newValue))
        }
        const restore = (name: string) => {
            console.log("restoring", name)
            const restoredValue = existingSettings.get(name)!
            if (restoredValue === null) localStorage.removeItem(name)
            else localStorage.setItem(name, restoredValue)
        }
        const overrideSettings = () => {
            console.log("overriding")
            override("search_history", [])
            override("search_layout", SearchLayout.GRID)
        }
        const restoreSettings = () => {
            console.log("restoring", Array.from(existingSettings.keys()).length, "settings")
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