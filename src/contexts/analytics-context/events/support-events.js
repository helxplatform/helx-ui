export function helpPortalOpened() {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "support_help_portal_open"
    });
}

export function userGuideOpened() {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "support_user_guide_open"
    });
}

export function faqsOpened() {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "support_faqs_open"
    });
}