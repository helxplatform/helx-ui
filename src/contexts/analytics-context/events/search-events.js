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
export function cdeToggled(cdeId, expanded) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "cde_toggle",
        label: cdeId,
        customParameters: {
            "expanded": expanded
        }
    });
}
export function cdeRelatedConceptsToggled(cdeId, expanded) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "cde_related_concepts_toggle",
        label: cdeId,
        customParameters: {
            "expanded": expanded
        }
    });
}
export function cdeRelatedConceptOpened(conceptId) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "cde_related_concept_open",
        label: conceptId
    });
}
export function cdeRelatedConceptSearched(conceptId) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "cde_related_concept_search",
        label: conceptId
    });
}
export function studyLinkClicked(studyId) {
    console.log("study link", studyName)
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "study_link_clicked",
        label: studyId,
    });
}
export function variableLinkClicked(variableId) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "variable_link_clicked",
        label: variableId,
    });
}
export function variableViewHistogramToggled(query, expanded) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "variable_view_histogram_toggle",
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
export function variableViewHistoryForwardsPressed(query) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "variable_view_history_forward",
        label: query,
    });
}
export function variableViewHistoryBackwardsPressed(query) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "variable_view_history_backward",
        label: query,
    });
}
export function variableViewStudyToggled(studyName, expanded) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "variable_view_study_toggle",
        label: studyName,
        customParameters: {
            "expanded": expanded
        }
    });
}
export function variableViewStudyPinToggled(studyName, active) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "variable_view_study_pin_toggle",
        label: studyName,
        customParameters: {
            "active": active
        }
    });
}