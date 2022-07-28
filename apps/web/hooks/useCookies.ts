import { useEffect, useState } from 'react';

export default function useCookies() {
    const [cookies, setCookies] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        function updatedCookies() {
            console.log(document.cookie);
            setCookies(
                Object.fromEntries(
                    document.cookie
                        .split(';')
                        .map((cookie) => cookie.trim().split('='))
                )
            );
        }

        updatedCookies();
    }, []);

    return cookies;
}
