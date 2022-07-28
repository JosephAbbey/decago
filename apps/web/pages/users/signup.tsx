import { dispatchMutation } from 'decago';
import useCurrentUser from '../../api/hooks/useCurrentUser';
import { useRouter } from 'next/router';
import { FormEvent } from 'react';
import signup from '../../api/mutations/signup';

export default function Home() {
    const router = useRouter();
    const user = useCurrentUser();

    if (user) {
        router.push('/');
    }

    return (
        <>
            <h1>Signup</h1>
            <form
                onSubmit={(e: FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    const email = e.currentTarget.email.value;
                    const name = e.currentTarget._name.value;
                    dispatchMutation(signup, { email, name }).then(() =>
                        router.push('/')
                    );
                }}
            >
                <label htmlFor="email">Email: </label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                />
                <br />
                <label htmlFor="_name">Name: </label>
                <input
                    type="text"
                    name="_name"
                    id="_name"
                    autoComplete="name"
                />
                <br />
                <br />
                <button type="submit">Signup</button>
            </form>
        </>
    );
}
