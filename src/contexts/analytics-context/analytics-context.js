import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useEnvironment } from '../environment-context';
import { AnalyticsEvents } from './events';
import { MixPanelAnalytics, GAAnalytics, NoAnalytics } from 'helx-analytics';
import { version as analyticsVersion } from 'helx-analytics/package.json';
import { getUser } from '../../api';
import { useWorkspacesAPI } from '..';

export const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
    const { context } = useEnvironment();
    const { user } = useWorkspacesAPI()
    const analytics = useMemo(() => {
        const { analytics } = context

        if (!analytics.enabled) return new NoAnalytics()

        const globalEventParameters = {
            "helx_analytics_version": analyticsVersion
        }
        switch (analytics.platform) {
            case "mixpanel":
                return new MixPanelAnalytics({ projectToken : analytics.token }, globalEventParameters);
            case "google":
                return new GAAnalytics({ trackingId: analytics.token }, globalEventParameters);
            default:
                throw new Error(`Analytics config supplied is invalid, unrecognized platform "${ analytics.platform }". Did you mean to set analytics.enabled to false?`)
        }
    }, [context])

    const analyticsEvents = useMemo(() => new AnalyticsEvents(analytics), [analytics])
    
    return (
        <AnalyticsContext.Provider value={{
            analytics, analyticsEvents
        }}>
            {children}
        </AnalyticsContext.Provider>
    );
}

export const useAnalytics = () => useContext(AnalyticsContext);