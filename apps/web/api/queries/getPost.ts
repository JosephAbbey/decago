import { t } from '@decago/object-definition';
import db from '../../db/generated';

export const getPostInput = new t.Model('getPostInput', {
    id: t.int(),
});

export const getPostOutput = new t.Model('getPostOutput', {
    id: t.int(),
    title: t.string(),
    content: t.string(),
    createdAt: t.date(),
    updatedAt: t.date(),
});

export default async function getUser(
    input: t.infer<typeof getPostInput>
): Promise<t.infer<typeof getPostOutput>> {
    return (
        await db.Posts({
            where: {
                id: input.id,
            },
            take: 1,
        })
    )[0];
}
