export function logout() {
    this.analytics.trackEvent({
        category: "UI Interaction",
        action: "Logout",
        label: `User logged out.`
    });
}