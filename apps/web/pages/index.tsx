import { useQuery } from 'decago';
import getPosts from '../api/queries/getPosts';
import md5 from 'md5';
import Link from 'next/link';
import Image from 'next/image';
import useCurrentUser from '../api/hooks/useCurrentUser';

export default function Home() {
    const [posts] = useQuery(getPosts, { skip: 0, take: 10 });
    const user = useCurrentUser();

    return (
        <>
            <h1>Home</h1>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                }}
            >
                {posts?.map((post, index) => (
                    <Link
                        key={index}
                        href={{
                            pathname: '/posts/[post]',
                            query: { post: post.id },
                        }}
                    >
                        <div
                            style={{
                                width: '20em',
                                margin: '.5em',
                                cursor: 'pointer',
                            }}
                        >
                            <h2>{post.title}</h2>
                            <p
                                style={{
                                    minHeight: '3.5em',
                                }}
                            >
                                {post.short_content}
                            </p>
                            <Link
                                href={{
                                    pathname: '/users/[user]',
                                    query: { user: post.authorId },
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'right',
                                    }}
                                >
                                    <span
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Image
                                            src={`https://www.gravatar.com/avatar/${md5(
                                                String(post.authorEmail)
                                                    .trim()
                                                    .toLowerCase()
                                            )}`}
                                            alt=""
                                            width={24}
                                            height={24}
                                        />
                                        <i style={{ marginLeft: '0.5em' }}>
                                            {post.authorName}
                                        </i>
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </Link>
                ))}
            </div>

            {user ? (
                <Link href="/posts/new">
                    <button>Create Post</button>
                </Link>
            ) : (
                <>
                    <Link href="/users/login">
                        <button>Login</button>
                    </Link>
                    <Link href="/users/signup">
                        <button>Signup</button>
                    </Link>
                </>
            )}
        </>
    );
}
