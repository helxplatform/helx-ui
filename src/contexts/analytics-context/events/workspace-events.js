export function appLaunched(appName, sid, cpu, gpu, mem, failed=false) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "app_launched",
        label: `${appName}-${sid}`,
        customParameters: {
            "app_name": appName,
            "app_sid": sid,
            "cpu": cpu,
            "gpu": gpu,
            "memory": mem,
            "did_fail": failed
            
        }
    });
}
export function appOpened(appName, sid) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "app_opened",
        label: `${appName}-${sid}`,
        customParameters: {
            "app_name": appName,
            "app_sid": sid
        }
    });
}
export function appDeleted(appName, sid, error=null) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "app_deleted",
        label: `${appName}-${sid}`,
        customParameters: {
            "app_name": appName,
            "app_sid": sid,
            "did_fail": !!error,
            "error_message": error
        }
    });
}
export function allAppsDeleted() {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "all_apps_deleted",
        // label: `User deleted all apps`
    });
}
export function appUpdated(appName, sid, workspace, cpu, gpu, mem, failed=false) {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "app_updated",
        label: `${appName}-${sid}`,
        customParameters: {
            "app_name": appName,
            "app_sid": sid,
            "workspace": workspace,
            "cpu": cpu,
            "gpu": gpu,
            "memory": mem,
            "did_fail": failed
        }
    });
}
export function workspacesLogout() {
    this.analytics.trackEvent({
        category: "ui_interaction",
        action: "workspaces_logout",
        // label: `User logged out.`
    });
}