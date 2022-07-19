import React, { createContext, useContext } from 'react';
import { useEnvironment } from '../environment-context';
import { AnalyticsEvents } from './events';
import { MixPanelAnalytics, GAAnalytics, NoAnalytics } from 'helx-analytics';
import { getUser } from '../../api';

const version = require('helx-analytics/package.json').version

export const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
    const { helxAppstoreUrl, context } = useEnvironment();
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
                if (mixpanel_token) analytics = new MixPanelAnalytics({ projectToken : mixpanel_token }, globalEventParameters);
                break;
            case "google_analytics":
                if (ga_property) analytics = new GAAnalytics({ trackingId: ga_property }, globalEventParameters);
                break;
        }
    }
    if (!analytics) analytics = new NoAnalytics();
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