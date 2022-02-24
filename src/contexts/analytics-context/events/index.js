import * as WorkspaceEvents from './workspace-events';
import * as RoutingEvents from './routing-events';
import * as MiscEvents from './misc-events';


export function AnalyticsEvents(analytics) {
    this.analytics = analytics;

    const events = Object.fromEntries(
        Object.entries({
        ...RoutingEvents,
        ...WorkspaceEvents,
        ...MiscEvents
        }).map(
            // Bind each event function to `AnalyticsEvents` to make `this.analytics` available.
            ([key, func]) => ([
                key,
                func.bind(this)
            ])
        )
    );
    return events;
}