const waitFor = (ms) => new Promise((res) => setTimeout(res, ms));
export async function callWithRetry(fn, options = {}, retryCount = 0, timer = 0) {
    const { failedCallback = () => {}, depth = 6, timeout = 30000, multiplier = 2, initialDelay = 100 } = options
    try {
        return await fn();
    } catch(e) {
        failedCallback(e, depth);
        if (timer < timeout) {
            if (retryCount >= depth) { // when retryCount is higher than depth we start using depth as the max
                await waitFor(multiplier ** depth * initialDelay);
                timer += (multiplier ** depth * initialDelay);
            } else {
                await waitFor(multiplier ** retryCount * initialDelay);
                timer += (multiplier ** retryCount * initialDelay);
            }
            retryCount++;
            return await callWithRetry(fn, options, retryCount, timer);
        }
        throw e
    }
}