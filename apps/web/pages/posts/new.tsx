import { dispatchMutation } from 'decago';
import useCurrentUser from '../../api/hooks/useCurrentUser';
import { useRouter } from 'next/router';
import { FormEvent } from 'react';
import createPost from '../../api/mutations/createPost';
import Link from 'next/link';

export default function Home() {
    const router = useRouter();
    const user = useCurrentUser();

    if (typeof user === 'undefined') {
        return (
            <>
                <h1>You must be logged in to create a post.</h1>

                <Link href="/users/login">
                    <button>Login</button>
                </Link>
                <Link href="/users/signup">
                    <button>Signup</button>
                </Link>
            </>
        );
    }

    return (
        <>
            <h1>New Post</h1>
            <form
                onSubmit={(e: FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    const title = e.currentTarget._title.value;
                    const content = e.currentTarget.content.value;
                    dispatchMutation(createPost, {
                        title,
                        content,
                        authorId: user.id,
                    }).then(() => router.push('/'));
                }}
            >
                <label htmlFor="_title">Title: </label>
                <input type="text" name="_title" id="_title" />
                <br />
                <label htmlFor="content" style={{ visibility: 'hidden' }}>
                    Content:
                </label>
                <br />
                <textarea
                    name="content"
                    id="content"
                    cols={30}
                    rows={10}
                ></textarea>
                <br />
                <br />
                <button type="submit">Post</button>
            </form>
        </>
    );
}
