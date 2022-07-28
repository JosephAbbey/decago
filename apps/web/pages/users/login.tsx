import { dispatchMutation } from 'decago';
import useCurrentUser from '../../api/hooks/useCurrentUser';
import { useRouter } from 'next/router';
import { FormEvent } from 'react';
import login from '../../api/mutations/login';
import Link from 'next/link';

export default function Home() {
    const router = useRouter();
    const user = useCurrentUser();

    if (user) {
        router.push('/');
    }

    return (
        <>
            <h1>Login</h1>
            <form
                onSubmit={(e: FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    const email = e.currentTarget.email.value;
                    dispatchMutation(login, { email }).then(() =>
                        router.push('/')
                    );
                }}
            >
                <label htmlFor="email">Email: </label>
                <input type="email" name="email" id="email" />
                <br />
                <br />
                <button type="submit">Login</button>
            </form>
            <Link href="/users/signup">
                <button>Signup</button>
            </Link>
        </>
    );
}
