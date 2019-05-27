import toastr from 'toastr';

interface ParsedResponse {
    status: number;
    payload?: any;
}

export const get = (
    serverUrl: string,
    endpoint: string,
    defaultErrorMessage = 'An unexpected error occurred',
    parameters: any = {}) => {

    const endpointUrl = getEndpointUrl(serverUrl, endpoint);
    const parameterizedUrl = getParameterizedUrl(endpointUrl, parameters);
    const options: RequestInit = {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        credentials: 'include'
    };
    
    return fetch(parameterizedUrl, options)
        .catch(error => {
            toastr.error(defaultErrorMessage, 'Network error');
            throw error;
        })
        .then(response => response.json()
            .then(payload => ({ status: response.status, payload } as ParsedResponse))
            .catch(parsingError => {
                toastr.error(defaultErrorMessage, 'Response content error');
                throw parsingError;
            })
        )
        .then(parsedResponse => {
            if (parsedResponse.status != 200) {
                const errorMessage = parsedResponse.payload.message || defaultErrorMessage;
                toastr.error(errorMessage, 'Network error');
                throw errorMessage;
            }
            return parsedResponse.payload;
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
