import React, { createContext, useContext } from 'react';
import { useEnvironment } from './environment-context';
import { MixPanelAnalytics, GAAnalytics, NoAnalytics } from 'helx-analytics';

export const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
    const { context } = useEnvironment();
    let analytics;
    if (context.analytics && context.analytics.enabled) {
        const { mixpanel_token, ga_property } = context.analytics.auth || {};
        switch (context.analytics.platform) {
            case "mixpanel":
                analytics = new MixPanelAnalytics({ projectToken : mixpanel_token });
                break;
            case "google_analytics":
                analytics = new GAAnalytics({ trackingId: ga_property });
                break;
            default:
                analytics = new NoAnalytics();
                break;
        }
    } else {
        analytics = new NoAnalytics();
    }
    return (
        <AnalyticsContext.Provider value={analytics}>
            {children}
        </AnalyticsContext.Provider>
    );
}

export const useAnalytics = () => useContext(AnalyticsContext);