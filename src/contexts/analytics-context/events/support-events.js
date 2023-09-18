export function helpPortalOpened() {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "support_help_portal_open"
    });
}