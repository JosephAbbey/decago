import { useQuery } from 'decago';
import getUser from '../../api/queries/getUser';
import getUserPosts from '../../api/queries/getUserPosts';
import md5 from 'md5';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import useCurrentUser from '../../api/hooks/useCurrentUser';
import Error from 'next/error';

export default function Home(props: {}) {
    const router = useRouter();
    const currentUser = useCurrentUser();
    const userId =
        parseInt(
            (router.query.user instanceof Array
                ? router.query.user[0]
                : router.query.user) || ''
        ) || undefined;
    const [user] = useQuery(getUser, {
        id: userId,
    });
    const [posts] = useQuery(getUserPosts, { id: userId, skip: 0, take: 10 });

    if (typeof userId === 'undefined') return <Error statusCode={404} />;
    if (typeof user === 'undefined') return <Error statusCode={404} />;

    return (
        <>
            <h1>
                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                    }}
                >
                    <Image
                        src={`https://www.gravatar.com/avatar/${md5(
                            String(user?.email).trim().toLowerCase()
                        )}`}
                        alt=""
                        width={50}
                        height={50}
                    />
                    <span style={{ marginLeft: '.5em' }}>
                        {user.name} {user.id === currentUser?.id ? '(You)' : ''}
                    </span>
                </span>
            </h1>

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
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'right',
                                }}
                            ></div>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
}
