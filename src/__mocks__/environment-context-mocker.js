import deepmerge from 'deepmerge'

// You could also just mock the context provider, but it's much better to mock all of the context's dependencies (i.e. requests)
// so that we can use the context as it would actually be used in the site rather than just mocking its value. 
export const mockEnvironmentContext = (config={}) => {
    const mock = registerAxiosMock({
        config: {
            url: /.*\/env.json/,
            method: "GET"
        },
        response: {
            status: 200,
            data: deepmerge({
                "brand": "heal",
                "color_scheme": {
                    "primary": "#8a5a91",
                    "secondary": "#505057"
                },
                "search_url": "/search-api",
                "search_enabled": "true",
                "workspaces_enabled": "true",
                "tranql_enabled": "true",
                "tranql_url": "/tranql",
                "analytics": {
                    "enabled": true,
                    "platform": "mixpanel",
                    "auth": {
                        "mixpanel_token": "",
                        "ga_property": ""
                    }
                },
                "hidden_support_sections": ""
            }, config)
        }
    })
    // Cleanup
    return () => {
        unregisterAxiosMock(mock)
    }
}