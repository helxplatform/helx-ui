export function searchExecuted(query, execTime, resultCount, error=undefined) {
    this.analytics.trackEvent({
        category: "UI Interaction",
        action: "Search executed",
        label: `User searched for "${query}"`,
        value: execTime,
        customParameters: {
            "Execution time": execTime,
            "Search term": query,
            "Response count": resultCount,
            "Caused error": error !== undefined,
            "Error stack": error ? error.stack : undefined
        }
    });
}
export function resultModalOpened(query, result) {
    this.analytics.trackEvent({
        category: "UI Interaction",
        action: "Result modal opened",
        label: `Opened modal from card for result "${result.name}"`,
        customParameters: {
            "Search term": query,
            "Result name": result.name,
            "Result type": result.type,
            "Additional search terms": result.search_terms
        }
    });
}
export function resultTabSelected(newTabTitle, oldTabTitle, elapsed) {
    this.analytics.trackEvent({
        category: "UI Interaction",
        action: "Result tab selected",
        label: `User selected tab "${newTabTitle}"`,
        value: newTabTitle,
        customParameters: {
            "Tab name": newTabTitle,
            "Previous tab name": oldTabTitle,
            "Time spent on previous tab": elapsed
        }
    });
}
export function tranqlLinkClicked(name, url) {
    this.analytics.trackEvent({
        category: "UI Interaction",
        action: "TranQL tab URL clicked",
        label: `User opened URL for ${name}`,
        customParameters: {
            "URL name": name,
            "URL": url
        }
    });
}
export function searchURLCopied(query) {
    this.analytics.trackEvent({
        category: "UI Interaction",
        action: "Search URL copied",
        label: "User copied sharable link for search query",
        customParameters: {
            "Search term": query
        }
    });
}
export function searchLayoutChanged(query, newLayout, oldLayout) {
    this.analytics.trackEvent({
        category: "UI Interaction",
        action: "Search layout changed",
        label: `Layout set to "${newLayout}"`,
        customParameters: {
            "Search term": query,
            "Changed from": oldLayout,
            "Changed to": newLayout
        }
    });
}