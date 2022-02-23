import React, { createContext, memo, useContext } from 'react';
import { useEnvironment } from './environment-context';
import { MixPanelAnalytics, GAAnalytics, NoAnalytics } from 'helx-analytics';
import { version } from 'helx-analytics/package.json';
import { getUser } from '../api';

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
    const analyticsEvents = {
        appLaunched: (appName, sid, cpu, gpu, mem, failed=false) => analytics.trackEvent({
            category: "UI Interaction",
            action: "App launched",
            label: `User launched new app "${appName}" (${sid})`,
            customParameters: {
                "App name": appName,
                "App SID": sid,
                "CPU allocated": cpu,
                "GPU allocated": gpu,
                "Memory allocated": mem,
                "Action failed": failed
                
            }
        }),
        appOpened: (appName, sid) => analytics.trackEvent({
            category: "UI Interaction",
            action: "App opened",
            label: `User opened app "${appName}" (${sid})`,
            customParameters: {
                "App name": appName,
                "App SID": sid
            }
        }),
        appDeleted: (appName, sid, error=null) => analytics.trackEvent({
            category: "UI Interaction",
            action: "App deleted",
            label: `User deleted app "${appName}" (${sid})`,
            customParameters: {
                "App name": appName,
                "App SID": sid,
                "Action failed": !!error,
                "Error message": error
            }
        }),
        allAppsDeleted: () => analytics.trackEvent({
            category: "UI Interaction",
            action: "All apps deleted",
            label: `User deleted all apps`
        }),
        appUpdated: (appName, sid, workspace, cpu, gpu, mem, failed=false) => analytics.trackEvent({
            category: "UI Interaction",
            action: "App updated",
            label: `User updated app "${appName}" (${sid})`,
            customParameters: {
                "App name": appName,
                "App SID": sid,
                "Workspace": workspace,
                "CPU allocated": cpu,
                "GPU allocated": gpu,
                "Memory allocated": mem,
                "Action failed": failed
            }
        }),
        logout: () => analytics.trackEvent({
            category: "UI Interaction",
            action: "Logout",
            label: `User logged out.`
        }),
        trackLocation: (location) => analytics.trackRoute({
            route: location.pathname,
            customParameters: {
                "URL origin": location.origin,
                "URL search params": location.search
            }
        })
    }
    return (
        <AnalyticsContext.Provider value={{
            analytics, analyticsEvents
        }}>
            {children}
        </AnalyticsContext.Provider>
    );
}

export const useAnalytics = () => useContext(AnalyticsContext);