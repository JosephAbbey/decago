import { useQuery } from 'decago';
import getPost from '../../api/queries/getPost';
import md5 from 'md5';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function Home(props: {}) {
    const router = useRouter();
    if (
        router.query.post instanceof Array ||
        typeof router.query.post === 'undefined'
    )
        throw new Error('Invalid post id');
    const postId = parseInt(router.query.post);
    const [post] = useQuery(getPost, {
        id: postId,
    });

    return (
        <>
            <h1>
                {post?.title}
                <Link
                    href={{
                        pathname: '/users/[user]',
                        query: { user: post?.authorId },
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
                                String(post?.authorEmail).trim().toLowerCase()
                            )}`}
                            alt=""
                            width={24}
                            height={24}
                        />
                        <i style={{ marginLeft: '0.5em' }}>
                            {post?.authorName}
                        </i>
                    </span>
                </Link>
            </h1>
            <i style={{ fontSize: '0.75em' }}>
                {post?.createdAt.toDateString()}
            </i>
            <p>{post?.content}</p>
        </>
    );
}
