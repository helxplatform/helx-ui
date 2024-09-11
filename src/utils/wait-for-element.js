/** matches(attributeValue): boolean */
export function waitForAttribute(node, attributeName, matches, timeout) {
    let _resolve, _reject
    let promise = new Promise(function (resolve, reject) {
        _resolve = resolve
        _reject = reject
    })

    const observer = new MutationObserver(function (mutationList) {
        for (const mutation of mutationList) {
            if (mutation.type === "attributes" && mutation.attributeName === attributeName) {
                if (matches(node.getAttribute(mutation.attributeName))) {
                    _resolve()
                    observer.disconnect()
                    clearTimeout(timerId)
                }
            }
        }
    })
    
    // first time check
    if (matches(node.getAttribute(attributeName))) {
        _resolve()
        return promise
    }

    const timeoutOption = timeout !== undefined ? timeout : 2000
    
    // start
    observer.observe(node, {
        attributes: true,
        attributeFilter: [attributeName]
    })
    
    // timeout
    var timerId = timeoutOption !== null ? setTimeout(function () {
        _reject(new Error("element attribute never matched, timed out:" + selector));
        observer.disconnect();
    }, timeoutOption) : undefined;

    return promise

}

/** Adapted from wait-for-element */
export function waitForElement(selector, timeout) {
    var _resolve, _reject;
    var promise = new Promise(function (resolve, reject) {
        _resolve = resolve;
        _reject = reject;
    });


    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            for (var i = 0; i < mutation.addedNodes.length; i++) {
                var addedNode = mutation.addedNodes[i];
                if (typeof addedNode.matches === "function" && addedNode.matches(selector)) {
                    _resolve(addedNode);
                    observer.disconnect();
                    clearTimeout(timerId);
                }
            }
        });
    });
    // first time check
    var element = document.querySelector(selector);
    if (element != null) {
        _resolve(element);
        return promise;
    }
    var timeoutOption = timeout !== undefined ? timeout : 2000;// 2s
    // start
    observer.observe(document.body, {
        childList: true, subtree: true
    })
    // timeout
    var timerId = timeoutOption !== null ? setTimeout(function () {
        _reject(new Error("Not found element match the selector:" + selector));
        observer.disconnect();
    }, timeoutOption) : undefined;

    return promise;
}

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