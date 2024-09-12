import { Fragment, ReactNode, createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { useShepherdTour, Tour, ShepherdOptionsWithType } from 'react-shepherd'
import { offset as tooltipOffset } from '@floating-ui/dom'
import { ExpandOutlined } from '@ant-design/icons'
import { useEnvironment } from '../environment-context'
import { SearchLayout, useHelxSearch } from '../../components/search'
import { SearchView } from '../../views'
import { useSyntheticDOMMask } from '../../hooks'
import { scrollIntoViewIfNeeded, waitForAttribute, waitForElement, waitForNoElement } from '../../utils'
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

const setNativeValueReact15_16 = (input: HTMLInputElement, value: string) => {
    const lastValue = input.value
    input.value = value
    const event = new Event("input", { bubbles: true });
    // React 15
    (event as any).simulated = true
    // React 16
    const tracker = (input as any)._valueTracker
    if (tracker) tracker.setValue(lastValue)
    input.dispatchEvent(event)
}

class SelectorTimeoutError extends Error {}
class ErrorSelectorReachedError extends Error {}

const waitForSelector = async (selector: string, errorSelector?: string, timeout: number | null = 10000) => {
    try {
        const waitForNormalSelector = waitForElement(selector, timeout)
        // Error selector never terminates if none provided.
        const waitForErrorSelector = errorSelector ? waitForElement(errorSelector, timeout) : new Promise(() => {})
        const [winner] = await Promise.race([waitForNormalSelector, waitForErrorSelector].map(p => p.then((res: any) => [p])))
        // If winner is waitForResultCard, we can continue.
        if (winner === waitForErrorSelector) {
            throw new ErrorSelectorReachedError()
        }
    } catch (e: any) {
        throw new SelectorTimeoutError()
    }
}

const getExpandButton = () => document.querySelector<HTMLSpanElement>(`.result-card:first-child span.anticon-expand`)
const getConceptViewRadioOption = () => document.querySelector<HTMLLabelElement>(`.search-layout-radio-group > label:nth-child(1)`)
const getVariableViewRadioOption = () => document.querySelector<HTMLLabelElement>(`.search-layout-radio-group > label:nth-child(2)`)

export const TourProvider = ({ children }: ITourProvider ) => {
    const { context, routes, basePath} = useEnvironment() as any
    const { doSearch } = useHelxSearch() as any
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

    const searchBarDomMask = useSyntheticDOMMask(".search-bar, .search-button", { blockClicks: true })
    const resultCardDomMask = useSyntheticDOMMask(".result-card:first-child", { blockClicks: false })
    const resultModalDomMask = useSyntheticDOMMask(".concept-modal > .ant-modal-content", { blockClicks: false })
    const variableRadioOptionDomMask = useSyntheticDOMMask(".search-layout-radio-group > label:nth-child(2)", { blockClicks: false })
    const studyListItemDomMask = useSyntheticDOMMask(".variables-collapse > div:first-child", {
        blockClicks: false,
        padding: {
            top: 0,
            bottom: 0,
            left: 32,
            right: 32
        }
    })
    const supportNavDomMask = useSyntheticDOMMask(`.helx-header ul.ant-menu > li[data-menu-id$="/support"] > span`, {
        blockClicks: false,
        padding: {
            top: 24,
            bottom: 24,
            left: 12,
            right: 12
        }
    })

    const tourOptions = useMemo<Tour.TourOptions>(() => ({
        defaultStepOptions: {
            cancelIcon: {
                enabled: true
            },
            scrollTo: true,
            canClickTarget: true,
            classes: "",
            highlightClass: "tour-highlighted",
            floatingUIOptions: {
                middleware: [
                    tooltipOffset({ mainAxis: 16 })
                ]
            },
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
    
    // NOTE: we can't really access internal React context here because of how shepherd works.
    const tourSteps = useMemo<ShepherdOptionsWithTypeFixed[]>(() => {
        if (context.brand === "heal") return [
            {
                id: "main.intro",
                attachTo: {
                    // We want to mount to a sizeless element so that nothing is "highlighted",
                    // i.e., everything is backdrop except the floating tour popup.
                    element: "head"
                },
                title: "Welcome to HEAL Semantic Search (HSS)",
                text: renderToStaticMarkup(
                    <div>
                        HSS is an open-access search engine for exploring the HEAL research landscape.<br /><br />
                        HSS is not the search you use every day - it uses linked knowledge to return concepts related
                        to your search. This enables researchers to find biomedical concepts of interest
                        in the HEAL space such as diseases, phenotypes, anatomical parts, and drugs. Click next
                        to begin a tour.
                    </div>
                ),
                beforeShowPromise: async function() {
                    await navigate(basePath)
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
                ]
            },
            {
                id: 'main.search.intro',
                attachTo: {
                    element: searchBarDomMask.selector!,
                    on: 'bottom'
                },
                title: "Searching",
                text: renderToStaticMarkup(
                    <div>
                        You can enter your search query here. In this example, we&apos;ll be looking at &quot;chronic pain.&quot;
                    </div>
                ),
                beforeShowPromise: async function() {
                    await navigate(basePath)
                    window.requestAnimationFrame(() => {
                        const input = document.querySelector(".search-bar input") as HTMLInputElement
                        setNativeValueReact15_16(input, "Chronic pain")
                    })
                },
                buttons: [
                    {
                        classes: 'shepherd-button-secondary',
                        text: 'Back',
                        type: 'back'
                    },
                    {
                        classes: 'shepherd-button-primary',
                        text: 'Next',
                        action: function() {
                            doSearch("Chronic pain")
                            this.next()
                        }
                    }
                ],
                when: {
                    show: () => { searchBarDomMask.showMask() },
                    hide: () => { searchBarDomMask.hideMask() },
                    cancel: () => { searchBarDomMask.hideMask() },
                    complete: () => { searchBarDomMask.hideMask() }
                }
            },
            {
                id: "main.search.concept.intro",
                attachTo: {
                    element: "head"
                },
                title: "Concept search",
                text: renderToStaticMarkup(
                    <div>
                        When a user searches for a term, HSS returns relevant biomedical concepts in the form of concept cards.
                        Each card has some abbreviated information, allowing you to zoom in on studies, variables, and CDEs that
                        are related to the concept.<br /><br />

                        In HSS, a concept is a named entity defined in an ontology or another formal knowledge source. This means
                        the biomedical concept, and its relation to the search query, comes from a well-defined, established source.
                    </div>
                ),
                beforeShowPromise: async () => {
                    try {
                        await waitForSelector(".result-card:first-child", ".results-error")
                    } catch (e: any) {
                        if (e instanceof ErrorSelectorReachedError) {
                            console.error("search error found, cancelling tour...")
                        } else if (e instanceof SelectorTimeoutError) {
                            console.error("result card selector timed out, cancelling tour...")
                        }
                        window.requestAnimationFrame(() => tour.cancel())
                    }
                },
                buttons: [
                    {
                        classes: 'shepherd-button-secondary',
                        text: 'Back',
                        type: 'back'
                    },
                    {
                        classes: 'shepherd-button-primary',
                        text: 'Next',
                        type: 'next'
                    }
                ],
            },
            {
                id: "main.search.concept.card",
                attachTo: {
                    element: resultCardDomMask.selector!,
                    on: "right"
                },
                scrollToHandler: () => scrollIntoViewIfNeeded(resultCardDomMask.originalSelector),
                title: "",
                text: renderToStaticMarkup(
                    <div>
                        In this example, we see &quot;chronic pain&quot; is a biomedical concept with an identifier and precise definition.
                    </div>
                ),
                buttons: [
                    {
                        classes: 'shepherd-button-secondary',
                        text: 'Back',
                        type: 'back'
                    },
                    {
                        classes: 'shepherd-button-primary',
                        text: 'Next',
                        type: 'next'
                    }
                ],
                when: {
                    show: () => resultCardDomMask.showMask(),
                    hide: () => resultCardDomMask.hideMask(),
                    cancel: () => resultCardDomMask.hideMask(),
                    complete: () => resultCardDomMask.hideMask()
                }
            },
            {
                id: "main.search.concept.card2",
                attachTo: {
                    element: resultCardDomMask.selector!,
                    on: "right"
                },
                scrollToHandler: () => scrollIntoViewIfNeeded(resultCardDomMask.originalSelector),
                title: "",
                text: renderToStaticMarkup(
                    <div>
                        To learn more about a concept, click the <ExpandOutlined style={{ margin: "0 4px" }} /> (expand)
                        button in the top-right corner of the card. <br /><br />
                        
                        This button opens a more detailed view of the concept for further exploration. 
                    </div>
                ),
                buttons: [
                    {
                        classes: 'shepherd-button-secondary',
                        text: 'Back',
                        type: 'back'
                    },
                    {
                        classes: 'shepherd-button-primary',
                        text: 'Next',
                        action: function() {
                            const expandBtn = getExpandButton()!
                            if (!expandBtn) {
                                console.log("couldn't find expand button, cancelling tour...")
                                tour.cancel()
                                return
                            }
                            // We don't use next() because that will be picked up implicitly.
                            expandBtn.click()
                        }
                    }
                ],
                when: (() => {
                    const listener = () => {
                        tour.next()
                    }

                    return {
                        show: () => {
                            resultCardDomMask.showMask()

                            const expandBtn = getExpandButton()
                            if (!expandBtn) {
                                console.log("couldn't find expand button, cancelling tour...")
                                tour.cancel()
                                return
                            }
                            
                            expandBtn.addEventListener("click", listener)
                        },
                        hide: () => {
                            resultCardDomMask.hideMask()

                            const expandBtn = getExpandButton()
                            expandBtn?.removeEventListener("click", listener)
                        },
                        cancel: () => {
                            resultCardDomMask.hideMask()

                            const expandBtn = getExpandButton()
                            expandBtn?.removeEventListener("click", listener)
                        },
                        complete: () => {
                            resultCardDomMask.hideMask()

                            const expandBtn = getExpandButton()
                            expandBtn?.removeEventListener("click", listener)
                        }
                    }
                })()
            },
            {
                id: "main.search.concept.modal",
                attachTo: {
                    element: resultModalDomMask.selector!,
                    on: "bottom"
                },
                floatingUIOptions: {
                    middleware: [
                        tooltipOffset({ mainAxis: -100 })
                    ]
                },
                scrollTo: false,
                title: "Expanded concept view",
                text: renderToStaticMarkup(
                    <div>
                        You can click on each of the tabs in the side bar for more detailed information, such as 
                        associated studies, CDEs (common data elements), knowledge graphs, and an explanation
                        about why the concept was included in the search result.
                    </div>
                ),
                buttons: [
                    {
                        classes: 'shepherd-button-secondary',
                        text: 'Back',
                        action: function() {
                            const closeBtn = document.querySelector<HTMLButtonElement>(".concept-modal .ant-modal-close")
                            this.back()
                            closeBtn?.click()
                        }
                    },
                    {
                        classes: 'shepherd-button-primary',
                        text: 'Next',
                        action: function() {
                            const closeBtn = document.querySelector<HTMLButtonElement>(".concept-modal .ant-modal-close")
                            this.next()
                            closeBtn?.click()
                        }
                    }
                ],
                beforeShowPromise: async () => {
                    await new Promise((resolve, reject) => {
                        // Not entirely clear why waitForSelector doesn't work properly here outside
                        // a requestAnimationFrame callback.
                        window.requestAnimationFrame(() => {
                            try {
                                waitForSelector(".concept-modal").then(() => {
                                    // Slight delay to allow modal opening animation.
                                    setTimeout(resolve, 200)
                                })
                            } catch (e: any) {
                                if (e instanceof SelectorTimeoutError) {
                                    console.error("concept modal selector timed out, cancelling tour...")
                                }
                                window.requestAnimationFrame(() => tour.cancel())
                            }
                        })
                    })
                },
                when: (() => {
                    const getFullscreenBtn = () => document.querySelector<HTMLButtonElement>(".concept-modal-fullscreen-btn")

                    let stillOnStep = true
                    return {
                        show: function() {
                            stillOnStep = true

                            const fullscreenBtn = getFullscreenBtn()!
                            fullscreenBtn.disabled = true

                            // The root component is demounted (and so picked up), not the nested `.concept-modal`
                            waitForNoElement(".ant-modal-root", null).then((resolve) => {
                                // If the modal was closed but we're still on this step, then the
                                // user closed the modal manually = advance to the next step.
                                if (stillOnStep) tour.next()
                            })

                            resultModalDomMask.showMask()
                        },
                        hide: () => {
                            stillOnStep = false

                            const fullscreenBtn = getFullscreenBtn()
                            if (fullscreenBtn) fullscreenBtn.disabled = false

                            resultModalDomMask.hideMask()
                        },
                        cancel: () => {
                            stillOnStep = false

                            const fullscreenBtn = getFullscreenBtn()
                            if (fullscreenBtn) fullscreenBtn.disabled = false

                            resultModalDomMask.hideMask()
                        },
                        complete: () => {
                            stillOnStep = false

                            const fullscreenBtn = getFullscreenBtn()
                            if (fullscreenBtn) fullscreenBtn.disabled = false

                            resultModalDomMask.hideMask()
                        }
                    }
                })()
            },
            {
                id: "main.search.concept.search-rankings",
                attachTo: {
                    element: "head"
                },
                title: "Concept rankings",
                text: renderToStaticMarkup(
                    <div>
                        Search results are scored based on their search term relevance.
                        Higher scoring, more relevant results are shown first. Further down,
                        you&apos;ll see concepts less directly relevant to your original
                        query but still potentially of unexpected interest.
                    </div>
                ),
                buttons: [
                    {
                        classes: 'shepherd-button-secondary',
                        text: 'Back',
                        action: function() {
                            const expandBtn = getExpandButton()!
                            expandBtn.click()
                            this.back()
                        }
                    },
                    {
                        classes: 'shepherd-button-primary',
                        text: 'Next',
                        type: 'next'
                    }
                ],
            },
            {
                id: "main.search.concept.variable-transition",
                attachTo: {
                    // Antd v4 does not allow id/class identifiers to be set for radio group options. 
                    element: variableRadioOptionDomMask.selector!,
                    on: "bottom-end"
                },
                scrollToHandler: () => scrollIntoViewIfNeeded(variableRadioOptionDomMask.originalSelector),
                title: "Variable view",
                text: renderToStaticMarkup(
                    <div>
                        HSS also offers variable-level searching. Click on the Variables button
                        shows variables matching the search terms or synonyms grouped by study.
                        Similar to concepts, variable results are scored based on the level of the match
                        between variable information (name, description, related terms) and the search terms.
                    </div>
                ),
                buttons: [
                    {
                        classes: 'shepherd-button-secondary',
                        text: 'Back',
                        type: 'back'
                    },
                    {
                        classes: 'shepherd-button-primary',
                        text: 'Next',
                        action: function() {
                            const variableViewOption = getVariableViewRadioOption()!
                            this.next()
                            variableViewOption.click()
                        }
                    }
                ],
                when: (() => {
                    const listener = () => {
                        tour.next()
                    }
                    return {
                        show: () => {
                            variableRadioOptionDomMask.showMask()

                            const variableViewOption = getVariableViewRadioOption()
                            if (!variableViewOption) {
                                console.log("couldn't find variable view radio option, cancelling tour...")
                                tour.cancel()
                                return
                            }
                            
                            variableViewOption.addEventListener("click", listener)
                        },
                        hide: () => {
                            variableRadioOptionDomMask.hideMask()
                            
                            const variableViewOption = getVariableViewRadioOption()
                            variableViewOption?.removeEventListener("click", listener)
                        },
                        cancel: () => {
                            variableRadioOptionDomMask.hideMask()
                            
                            const variableViewOption = getVariableViewRadioOption()
                            variableViewOption?.removeEventListener("click", listener)
                        },
                        complete: () => {
                            variableRadioOptionDomMask.hideMask()

                            const variableViewOption = getVariableViewRadioOption()
                            variableViewOption?.removeEventListener("click", listener)
                        }
                    }
                })()
            },
            {
                id: "main.search.variable-view.intro",
                attachTo: {
                    element: "head"
                },
                title: "Variable search",
                text: renderToStaticMarkup(
                    <div>
                        Variable search returns all the variables with a match with the search term.
                        HSS provides a histogram filter to zoom in on higher-scoring results (those more
                        relevant to the search query). Hovering the mouse pointer over each variable in the
                        histogram displays additional information, including its name, description, and study.
                    </div>
                ),
                buttons: [
                    {
                        classes: 'shepherd-button-secondary',
                        text: 'Back',
                        action: function() {
                            const conceptGridViewOption = getConceptViewRadioOption()!
                            this.back()
                            conceptGridViewOption.click()
                        }
                    },
                    {
                        classes: 'shepherd-button-primary',
                        text: 'Next',
                        type: 'next'
                    }
                ],
            },
            {
                id: "main.search.variable-view.study-list",
                attachTo: {
                    element: studyListItemDomMask.selector,
                    on: "bottom"
                },
                scrollToHandler: () => scrollIntoViewIfNeeded(studyListItemDomMask.originalSelector),
                title: "",
                text: renderToStaticMarkup(
                    <div>
                        You can also click to expand each study to view the study variables associated
                        with the search query.
                    </div>
                ),
                buttons: [
                    {
                        classes: 'shepherd-button-secondary',
                        text: 'Back',
                        type: 'back'
                    },
                    {
                        classes: 'shepherd-button-primary',
                        text: 'Next',
                        type: 'next'
                    }
                ],
                when: {
                    show: () => { studyListItemDomMask.showMask() },
                    hide: () => { studyListItemDomMask.hideMask() },
                    cancel: () => { studyListItemDomMask.hideMask() },
                    complete: () => { studyListItemDomMask.hideMask() }
                }
            },
            {
                id: "main.outro",
                attachTo: {
                    element: supportNavDomMask.selector,
                    on: "bottom"
                },
                scrollToHandler: () => scrollIntoViewIfNeeded(supportNavDomMask.originalSelector),
                title: "Conclusion",
                text: renderToStaticMarkup(
                    <div>
                        This concludes the introductory tour of HSS. For more detailed information,
                        read our <a href={ context.user_guide_url } target="_blank" rel="noopener noreferrer">User Guide</a>
                        or visit our support page to revisit the tour or access the Help Portal, where you can report bugs,
                        request technical assistance, submit feedback, or submit other requests.<br /><br />

                        Happy searching!
                    </div>
                ),
                buttons: [
                    {
                        classes: 'shepherd-button-secondary',
                        text: 'Back',
                        type: 'back'
                    },
                    {
                        classes: 'shepherd-button-primary',
                        text: 'Done',
                        type: 'next'
                    }
                ],
                when: {
                    show: () => { supportNavDomMask.showMask() },
                    hide: () => { supportNavDomMask.hideMask() },
                    cancel: () => { supportNavDomMask.hideMask() },
                    complete: () => { supportNavDomMask.hideMask() }
                }
            }
        ]
        return []
    }, [searchBarDomMask, basePath, navigate, doSearch])

    const tour = useShepherdTour({ tourOptions, steps: tourSteps });
    (window as any).tour = tour

    useEffect(() => {
        const cleanupTour = () => {
            console.log("cleanup")
        }
        tour.on("complete", cleanupTour)
        tour.on("cancel", cleanupTour)

        return () => {
            tour.off("complete", cleanupTour)
            tour.off("cancel", cleanupTour)
        }
    }, [tour, navigate])
    
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
            // override("search_history", [])
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
            // restoreSettings()
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