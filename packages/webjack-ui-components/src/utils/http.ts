declare const toastr: any;

interface ParsedResponse {
    status: number;
    payload?: any;
}

// TODO Remove the defaultValue parameter
export const get = (
    serverUrl: string,
    endpoint: string,
    parameters: any = {},
    defaultValue?: any,
    defaultErrorMessage = 'An unexpected error occurred') => {

    const endpointUrl = getEndpointUrl(serverUrl, endpoint);
    const parameterizedUrl = getParameterizedUrl(endpointUrl, parameters);
    const options: RequestInit = {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        credentials: 'include'
    };
    
    return fetch(parameterizedUrl, options)
        .then(response => {
            return response.json()
                .then(payload => ({ status: response.status, payload } as ParsedResponse))
                .catch(parsingError => ({ status: response.status } as ParsedResponse));
        })
        .then(parsedResponse => {
            if (parsedResponse.status != 200) {
                toastr.error(parsedResponse.payload.message || defaultErrorMessage, 'Network error');
                return defaultValue;
            }
            else {
                return parsedResponse.payload;
            }
        })
        .catch(error => {
            console.log(error)
            toastr.error(defaultErrorMessage, 'Network error');
            return defaultValue;
        });
};

const getEndpointUrl = (serverUrl: string, endpoint: string) => {
    return serverUrl.indexOf('{endpoint}') > -1 ?
        serverUrl.replace('{endpoint}', endpoint) : 
        serverUrl + `/${endpoint}`;
};

const getParameterizedUrl = (url: string, parameters: any = {}) => {
    let parameterizedUrl = url;
    if (Object.keys(parameters).length > 0) {
        if (parameterizedUrl.indexOf('?') < 0) {
            parameterizedUrl += '?';
        }
        else if (!parameterizedUrl.endsWith('&')) {
            parameterizedUrl += '&';
        }
        parameterizedUrl += Object.keys(parameters)
            .map(key => `${key}=${encodeURIComponent(parameters[key])}`)
            .join('&');
    }
    return parameterizedUrl;
}
