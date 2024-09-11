/** Adapted from wait-for-element */
export function waitForNoElement(selector, timeout) {
    var _resolve, _reject;
    var promise = new Promise(function (resolve, reject) {
        _resolve = resolve;
        _reject = reject;
    });


    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            for (var i = 0; i < mutation.removedNodes.length; i++) {
                var removedNode = mutation.removedNodes[i];
                if (typeof removedNode.matches === "function" && removedNode.matches(selector)) {
                    // Run a check
                    if (!document.querySelector(selector)) {
                        _resolve();
                        observer.disconnect();
                        clearTimeout(timerId);
                    }
                }
            }
        });
    });
    // first time check
    if (!document.querySelector(selector)) {
        _resolve();
        return promise;
    }
    var timeoutOption = timeout !== undefined ? timeout : 2000;// 2s
    // start
    observer.observe(document.body, {
        childList: true, subtree: true
    });
    // timeout
    var timerId = timeoutOption !== null ? setTimeout(function () {
        _reject(new Error("elements matching the selector still exist: " + selector));
        observer.disconnect();
    }, timeoutOption) : undefined;

    return promise;
}