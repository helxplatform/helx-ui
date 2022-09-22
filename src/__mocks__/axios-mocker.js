export const setupAxiosMocker = () => {
    const mocks = []
    jest.mock("axios", () => {
        const defaultConfig = {
            url: undefined,
            method: undefined,
            data: undefined,
            baseUrl: ""
        }
        // Very basic mock wrapper. Only (partially) mocks a very small portion of axios's functionality.
        function Axios(config={}) {
            this.defaults = {
                ...defaultConfig,
                ...config
            }
            this.interceptors = {
                request: {
                    use: () => {},
                    eject: () => {}
                },
                response: {
                    use: () => {},
                    eject: () => {}
                }
            }
            this._createResponse = function (statusCode, data, config) {
                return {
                    status: statusCode,
                    statusText: undefined,
                    data,
                    headers: {},
                    config,
                    request: null
                }
            }
            this.request = function(config={}) {
                const requestConfig = {
                    ...this.defaults,
                    ...config
                }
                let { url, method, data, baseUrl } = requestConfig
                url = baseUrl + url
                const mock = mocks.find((mock) => (
                    mock.config.method.toLowerCase() === method &&
                    url.match(mock.config.url) &&
                    (!mock.config.data || mock.config.data == data)
                ))
                if (mock) {
                    const response = typeof mock.response === "function"
                        ? mock.response(requestConfig)
                        : mock.response
                    return this._createResponse(response.status, response.data, requestConfig)
                }
                throw new Error(`Axios URL with config ${ JSON.stringify(config) } called but not matched by any mocks`)
            }
            Array.prototype.forEach.call(["delete", "get", "head", "options"], (method) => {
                this[method] = function(url, config={}) {
                    return this.request({
                        url,
                        method,
                        ...config
                    })
                }
            })
            Array.prototype.forEach.call(["post", "put", "patch"], (method) => {
                this[method] = function(url, data=undefined, config={}) {
                    return this.request({
                        url,
                        method,
                        data,
                        ...config
                    })
                }
            })
            this.create = function(config) {
                return new Axios(config)
            }
        }
        return new Axios()
    })
    global.registerAxiosMock = ({ config, response }) => {
        mocks.push({ config, response })
    }
}