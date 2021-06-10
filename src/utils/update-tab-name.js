// This will replace the original react title name with the new app name.

export const updateTabName = (newWindow, newTitle) => {
    if (newWindow.document) setTimeout(() => { newWindow.document.title = newTitle }, 100);
    else setTimeout(updateTabName, 100);
}