import { callWithRetry } from './call-with-retry'

describe('test call with retry', () => {

    it('test function successful return', async () => {
        const returnValue = await callWithRetry(() => 5)
        expect(returnValue).toBe(5);
    });

    it('test function fails once', async () => {
        let attempts = 0;
        const returnValue = await callWithRetry(() => {
            if (attempts === 0) {
                attempts++;
                throw new Error("first error")
            } else {
                return 5;
            }
        })
        expect(attempts).toBe(1);
        expect(returnValue).toBe(5);
    });

    it('test function fails until timeout', async () => {
        const startTime = Date.now()
        const options = {
            timeout: 1000,
            depth: 3
        }
        await expect(
            callWithRetry(() => {
                throw new Error("timeout error")
            }, options)
        ).rejects.toThrowError("timeout error")
        expect(Date.now() - startTime).toBeGreaterThanOrEqual(1000);
    });

    it('test shouldCancel cancels retry after being set to true', async () => {
        let attempts = 0;
        const options = {
            failedCallback: ({}, retryCount) => {
                return retryCount >= 2;
            }
        };
        await expect(
            callWithRetry(() => {
                attempts++;
                throw new Error("timeout error")
            }, options)
        ).rejects.toThrowError("timeout error")
        expect(attempts).toBe(3);
    });

});