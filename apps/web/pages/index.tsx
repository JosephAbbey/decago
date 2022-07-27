import { useQuery } from 'decago';
import getPosts from '../api/queries/getPosts';
import md5 from 'md5';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
    const [posts] = useQuery(getPosts, { skip: 0, take: 10 });

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
                        href={{
                            pathname: '/posts/[post]',
                            query: { post: post.id },
                        }}
                    >
                        <div
                            key={index}
                            style={{ width: '20em', margin: '.5em' }}
                        >
                            <h2>{post.title}</h2>
                            <p>{post.short_content}</p>
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
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
}
