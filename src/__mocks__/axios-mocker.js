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
        }
        Axios.prototype._createResponse = function (statusCode, data, config) {
            return {
                status: statusCode,
                statusText: undefined,
                data: JSON.parse(JSON.stringify(data)),
                headers: {},
                config,
                request: null
            }
        }
        Axios.prototype.request = async function(config={}) {
            const requestConfig = {
                ...this.defaults,
                ...config
            }
            let { url, method, data, baseUrl } = requestConfig
            url = baseUrl + url
            const mock = mocks.find((mock) => (
                mock.config.method.toLowerCase() === method.toLowerCase() &&
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
            Axios.prototype[method] = function(url, config={}) {
                return this.request({
                    url,
                    method,
                    ...config
                })
            }
        })
        Array.prototype.forEach.call(["post", "put", "patch"], (method) => {
            Axios.prototype[method] = function(url, data=undefined, config={}) {
                return this.request({
                    url,
                    method,
                    data,
                    ...config
                })
            }
        })
        Axios.prototype.create = function(config) {
            return new Axios(config)
        }
        function createInstance(config={}) {
            const context = new Axios(config)
            const instance = Axios.prototype.request.bind(context)
            Object.keys(Axios.prototype).forEach((key) => {
                const value = Axios.prototype[key]
                instance[key] = value.bind(context)
            })
            Object.keys(context).forEach((key) => {
                const value = context[key]
                if (typeof value !== "function") {
                    instance[key] = value
                }
            })
            instance.create = function(config={}) {
                return createInstance(config)
            }
            return instance
        }
        return createInstance({})
    })
    global.registerAxiosMock = ({ config, response }) => {
        const mock = { config, response }
        mocks.push(mock)
        return mock
    }
    global.unregisterAxiosMock = (mock) => {
        if (mocks.indexOf(mock) != -1) mocks.splice(mocks.indexOf(mock), 1)
    }
}