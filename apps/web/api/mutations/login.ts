import { t } from '@decago/object-definition';
import { Cookies } from 'decago';
import { DB } from '../../db';

export const loginInput = new t.Model('loginInput', {
    email: t.string(),
});

export const loginOutput = new t.Model('loginOutput', {});

// this must be changed to a real login function
export default async function login(
    input: t.infer<typeof loginInput>,
    context: { db: DB; cookies: Cookies }
): Promise<t.infer<typeof loginOutput>> {
    const user = (
        await context.db.Users({
            where: {
                email: input.email,
            },
            take: 1,
        })
    )[0];
    context.cookies.set('token', user.id.toString());
    return {};
}
