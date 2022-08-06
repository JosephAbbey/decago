import db, { schema } from './db';
import { Cookies, config } from 'decago';

const decagoConfig: config = {
    api: {
        context: async (req, res) => ({
            db: await db,
            schema: await schema,
            cookies: new Cookies(req, res),
        }),
    },
};

export default decagoConfig;
