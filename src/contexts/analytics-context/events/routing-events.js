export function trackLocation(location) {
    this.analytics.trackRoute({
        route: location.pathname,
        customParameters: {
            "URL origin": location.origin,
            "URL search params": location.search
        }
    });
}