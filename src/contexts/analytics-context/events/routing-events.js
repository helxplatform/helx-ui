export function trackLocation(location) {
    this.analytics.trackRoute({
        route: location.pathname,
        customParameters: {
            "url_origin": location.origin,
            "url_search_params": location.search
        }
    });
}