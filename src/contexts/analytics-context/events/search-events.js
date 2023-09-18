export function searchExecuted(query, execTime, resultCount, error=null) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "search_executed",
        label: query,
        customParameters: {
            "execution_time": execTime,
            "search_term": query,
            "response_count": resultCount,
            "did_fail": !!error,
            "error_message": error
        }
    });
}
export function resultModalOpened(query, result) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "result_modal_opened",
        label: result.name,
        customParameters: {
            "search_query": query,
            "result_name": result.name,
            "result_type": result.type,
            "additional_search_terms": result.search_terms
        }
    });
}
export function resultTabSelected(newTabTitle, oldTabTitle, elapsed) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "result_tab_selected",
        label: newTabTitle,
        customParameters: {
            "tab_name": newTabTitle,
            "previous_tab_name": oldTabTitle,
            "time_spent_on_previous_tab": elapsed
        }
    });
}
export function tranqlLinkClicked(name, url) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "tranql_tab_url_clicked",
        label: name,
        customParameters: {
            "url_name": name,
            "url": url
        }
    });
}
export function searchURLCopied(query) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "search_url_copied",
        // label: "User copied sharable link for search query",
        customParameters: {
            "search_query": query
        }
    });
}
export function searchLayoutChanged(query, newLayout, oldLayout) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "search_layout_changed",
        label: newLayout,
        customParameters: {
            "search_query": query,
            "changed_from": oldLayout,
            "changed_to": newLayout
        }
    });
}
export function studyLinkClicked(studyName) {
    console.log("study link", studyName)
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "study_link_clicked",
        label: studyName,
    });
}
export function variableLinkClicked(variableName) {
    console.log("variable link", variableName)
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "variable_link_clicked",
        label: variableName,
    });
}
export function variableViewHistogramToggled(query, expanded) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "variable_view_histogram_toggled",
        label: query,
        customParameters: {
            "expanded": expanded
        }
    });
}
export function variableViewStartOverPressed(query) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "variable_view_start_over",
        label: query,
    });
}
export function variableViewStudyToggled(studyName, expanded) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "variable_view_study_toggled",
        label: studyName,
        customParameters: {
            "expanded": expanded
        }
    });
}
export function variableViewStudyPinToggled(studyName, active) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "variable_view_study_pin_toggled",
        label: studyName,
        customParameters: {
            "active": active
        }
    });
}