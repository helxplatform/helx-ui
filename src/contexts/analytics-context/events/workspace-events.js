export function appLaunched(appName, sid, cpu, gpu, mem, failed=false) {
    this.analytics.trackEvent({
        category: "UI Interaction",
        action: "App launched",
        label: `User launched new app "${appName}" (${sid})`,
        customParameters: {
            "App name": appName,
            "App SID": sid,
            "CPU allocated": cpu,
            "GPU allocated": gpu,
            "Memory allocated": mem,
            "Action failed": failed
            
        }
    });
}
export function appOpened(appName, sid) {
    this.analytics.trackEvent({
        category: "UI Interaction",
        action: "App opened",
        label: `User opened app "${appName}" (${sid})`,
        customParameters: {
            "App name": appName,
            "App SID": sid
        }
    });
}
export function appDeleted(appName, sid, error=null) {
    this.analytics.trackEvent({
        category: "UI Interaction",
        action: "App deleted",
        label: `User deleted app "${appName}" (${sid})`,
        customParameters: {
            "App name": appName,
            "App SID": sid,
            "Action failed": !!error,
            "Error message": error
        }
    });
}
export function allAppsDeleted() {
    this.analytics.trackEvent({
        category: "UI Interaction",
        action: "All apps deleted",
        label: `User deleted all apps`
    });
}
export function appUpdated(appName, sid, workspace, cpu, gpu, mem, failed=false) {
    this.analytics.trackEvent({
        category: "UI Interaction",
        action: "App updated",
        label: `User updated app "${appName}" (${sid})`,
        customParameters: {
            "App name": appName,
            "App SID": sid,
            "Workspace": workspace,
            "CPU allocated": cpu,
            "GPU allocated": gpu,
            "Memory allocated": mem,
            "Action failed": failed
        }
    });
}