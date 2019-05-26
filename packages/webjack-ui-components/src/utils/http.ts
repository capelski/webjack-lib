declare const toastr: any;

interface ParsedResponse {
    status: number;
    payload?: any;
}

// TODO Remove the defaultValue parameter
export const get = (
    url: string,
    parameters: any = {},
    defaultValue?: any,
    defaultErrorMessage = 'An unexpected error occurred') => {        
    const options: RequestInit = {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        credentials: 'include'
    };

    if (Object.keys(parameters).length > 0) {
        if (url.indexOf('?') < 0) {
            url += '?';
        }
        else if (!url.endsWith('&')) {
            url += '&';
        }
        url += Object.keys(parameters)
            .map(key => `${key}=${encodeURIComponent(parameters[key])}`)
            .join('&');
    }
    
    return fetch(url, options)
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

// TODO Wrap inside get function
export const getEndpointUrl = (serverUrl: string, endpoint: string) => {
    return serverUrl.indexOf('{endpoint}') > -1 ?
        serverUrl.replace('{endpoint}', endpoint) : 
        serverUrl + `/${endpoint}`;
};
