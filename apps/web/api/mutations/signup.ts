import { t } from '@decago/object-definition';
import { Cookies } from 'decago';
import { DB } from '../../db';

export const signupInput = new t.Model('signupInput', {
    email: t.string(),
    name: t.string(),
});

export const signupOutput = new t.Model('signupOutput', {});

// this must be changed to a real login function
export default async function signup(
    input: t.infer<typeof signupInput>,
    context: { db: DB; cookies: Cookies }
): Promise<t.infer<typeof signupOutput>> {
    const user = await context.db.User.create(
        context.db.db,
        undefined,
        input.name,
        input.email,
        undefined,
        undefined
    );
    context.cookies.set('token', user.id.toString());
    return {};
}
