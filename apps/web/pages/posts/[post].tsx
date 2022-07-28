import { useQuery } from 'decago';
import getPost from '../../api/queries/getPost';
import md5 from 'md5';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Error from 'next/error';

export default function Home(props: {}) {
    const router = useRouter();
    const postId =
        parseInt(
            (router.query.post instanceof Array
                ? router.query.post[0]
                : router.query.post) || ''
        ) || undefined;
    const [post] = useQuery(getPost, {
        id: postId,
    });

    if (typeof postId === 'undefined') return <Error statusCode={404} />;
    if (typeof post === 'undefined') return <Error statusCode={404} />;

    return (
        <>
            <h1>
                {post.title}
                <Link
                    href={{
                        pathname: '/users/[user]',
                        query: { user: post.authorId },
                    }}
                >
                    <span
                        style={{
                            float: 'right',
                            fontSize: '1.5rem',
                            fontWeight: '100',
                            display: 'inline-flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <Image
                            src={`https://www.gravatar.com/avatar/${md5(
                                String(post.authorEmail).trim().toLowerCase()
                            )}`}
                            alt=""
                            width={24}
                            height={24}
                        />
                        <i style={{ marginLeft: '0.5em' }}>
                            {post.authorName}
                        </i>
                    </span>
                </Link>
            </h1>
            <i style={{ fontSize: '0.75em' }}>
                {post.createdAt.toDateString()}
            </i>
            <p>{post.content}</p>
        </>
    );
}
