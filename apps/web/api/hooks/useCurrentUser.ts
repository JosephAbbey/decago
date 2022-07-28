import { useQuery } from 'decago';
import { useEffect } from 'react';
import useCookies from '../../hooks/useCookies';
import getUser from '../queries/getUser';

// this must be replaced with a real authentication handler
export default function useCurrentUser() {
    const cookies = useCookies();
    const [user, { setInput }] = useQuery(getUser, {
        id: parseInt(cookies.token),
    });

    useEffect(() => {
        setInput({
            id: parseInt(cookies.token),
        });
    }, [cookies, setInput]);

    return user;
}
