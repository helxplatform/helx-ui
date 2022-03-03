import React, { createContext, memo, useContext } from 'react';
import { useEnvironment } from '../environment-context';
import { AnalyticsEvents } from './events';
import { MixPanelAnalytics, GAAnalytics, NoAnalytics } from 'helx-analytics';
import { version } from 'helx-analytics/package.json';
import { getUser } from '../../api';

export const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
    const { helxAppstoreUrl, context, isLoadingContext } = useEnvironment();
    let analytics;
    if (context.analytics && context.analytics.enabled) {
        const { mixpanel_token, ga_property } = context.analytics.auth || {};
        const globalEventParameters = {
            "HeLx-Analytics version": version,
            "HeLx Brand": context.brand || "Unknown",
            "Deployment Namespace": context.deployment_namespace || "Unknown",
            "User ID": async () => {
                if (context.workspaces_enabled) {
                    const user = await getUser(helxAppstoreUrl);
                    if (user) return user.REMOTE_USER;
                }
                return null;
            }
        };
        switch (context.analytics.platform) {
            case "mixpanel":
                analytics = new MixPanelAnalytics({ projectToken : mixpanel_token }, globalEventParameters);
                break;
            case "google_analytics":
                analytics = new GAAnalytics({ trackingId: ga_property }, globalEventParameters);
                break;
            default:
                analytics = new NoAnalytics();
                break;
        }
    } else {
        analytics = new NoAnalytics();
    }
    const analyticsEvents = new AnalyticsEvents(analytics);
    return (
        <AnalyticsContext.Provider value={{
            analytics, analyticsEvents
        }}>
            {children}
        </AnalyticsContext.Provider>
    );
}

export const useAnalytics = () => useContext(AnalyticsContext);