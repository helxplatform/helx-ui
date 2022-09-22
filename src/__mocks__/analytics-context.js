import { NoAnalytics } from 'helx-analytics'
import { AnalyticsContext as _AnalyticsContext, AnalyticsEvents } from '../contexts'

export const AnalyticsContext = ({ children }) => {
    const analytics = new NoAnalytics()
    const analyticsEvents = new AnalyticsEvents(analytics)
    return (
        <_AnalyticsContext.Provider value={{
            analytics,
            analyticsEvents
        }}>
            { children }
        </_AnalyticsContext.Provider>
    )
}