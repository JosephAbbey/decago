const { useState, useEffect } = require('react');
const { serialize, deserialize } = require('@decago/serialize');

module.exports.useQuery = function useQuery(query, input) {
    const [data, setData] = useState(undefined);
    const [_input, setInput] = useState(input);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [requests, setRequests] = useState(1);

    useEffect(() => {
        const fetchData = () => {
            setIsLoading(true);

            fetch(window.location.origin + '/api/rpc/queries/' + query.name, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(serialize(_input, {})),
            })
                .then((res) =>
                    res.json().then((data) => {
                        setData(deserialize(data, {}));
                        setIsLoading(false);
                    })
                )
                .catch(() => {
                    setIsError(true);
                    setIsLoading(false);
                });
        };

        fetchData();
    }, [requests, _input]);

    return [
        data,
        {
            isLoading,
            isError,
            again: () => setRequests(requests + 1),
            setInput,
        },
    ];
};

module.exports.dispatchMutation = function dispatchMutation(mutation, input) {
    return fetch(
        window.location.origin + '/api/rpc/mutations/' + mutation.name,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(serialize(input, {})),
        }
    ).then((res) => res.json().then((data) => deserialize(data, {})));
};

module.exports.useMutation = function useMutation(mutation, input) {
    const [data, setData] = useState(undefined);
    const [_input, setInput] = useState(input);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [requests, setRequests] = useState(1);

    useEffect(() => {
        const fetchData = () => {
            setIsLoading(true);

            fetch(
                window.location.origin + '/api/rpc/mutations/' + mutation.name,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(serialize(_input, {})),
                }
            )
                .then((res) =>
                    res.json().then((data) => {
                        setData(deserialize(data, {}));
                        setIsLoading(false);
                    })
                )
                .catch(() => {
                    setIsError(true);
                    setIsLoading(false);
                });
        };

        fetchData();
    }, [requests, _input]);

    return [
        data,
        {
            isLoading,
            isError,
            again: () => setRequests(requests + 1),
            setInput,
        },
    ];
};

module.exports.Cookies = class Cookies extends Map {
    constructor(req, res) {
        super();
        this.req = req;
        this.res = res;
        for (const [key, value] of Object.entries(this.req.cookies)) {
            super.set(key, value || '');
        }
    }

    set(key, value) {
        super.set(key, value);
        this.res.setHeader('Set-Cookie', `${key}=${value};Secure;Path=/`);
        return this;
    }
};
