const { useState, useEffect } = require('react');
const { serialize, deserialize } = require('@decago/serialize');

module.exports.useQuery = function useQuery(query, input) {
    const [data, setData] = useState(undefined);
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
                body: JSON.stringify(serialize(input, {})),
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
    }, [requests]);

    return [
        data,
        { isLoading, isError, again: () => setRequests(requests + 1) },
    ];
};

module.exports.useMutation = function useMutation(mutation, input) {
    const [data, setData] = useState(undefined);
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
                    body: JSON.stringify(serialize(input, {})),
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
    }, [requests]);

    return [
        data,
        { isLoading, isError, again: () => setRequests(requests + 1) },
    ];
};
