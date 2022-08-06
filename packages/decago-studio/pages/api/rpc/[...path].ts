import { t } from '@decago/object-definition';
import { serialize, deserialize } from '@decago/serialize';
import type { NextApiRequest, NextApiResponse } from 'next';
import * as rpc from '../../../api';
import config from '../../../decago.config';

import db from '../../../db';
import fs from 'fs';
import process from 'process';
import { Cookies } from 'decago';

const context = async (req: NextApiRequest, res: NextApiResponse) =>
    await (
        config?.api?.context ||
        (async (req: NextApiRequest, res: NextApiResponse) => ({
            db,
            fs,
            process,
            cookies: new Cookies(req, res),
        }))
    )(req, res);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise<void>(async (resolve, reject) => {
        if (req.method !== 'POST') {
            res.status(405).end('Method must be post');
            return resolve();
        }
        var { path } = req.query;
        if (typeof path === 'undefined') {
            res.status(404).end('Missing path');
            return resolve();
        }
        if (typeof path === 'string') {
            path = [path];
        }
        if (path[0] === 'mutations') {
            const mutation:
                | {
                      i: t.Type;
                      o: t.Type;
                      default: (input: any, context: any) => Promise<any>;
                  }
                //@ts-ignore
                | undefined = rpc.mutations[path[1]];
            if (typeof mutation !== 'undefined') {
                mutation
                    .default(deserialize(req.body, {}), await context(req, res))
                    .then((result) => {
                        res.status(200).json(serialize(result, {}));
                        resolve();
                    })
                    .catch((error) => {
                        res.status(500).end(error.message);
                        resolve();
                    });
            } else {
                res.status(404).end('Mutation does not exist');
            }
        } else if (path[0] === 'queries') {
            const query:
                | {
                      i: t.Type;
                      o: t.Type;
                      default: (input: any, context: any) => Promise<any>;
                  }
                //@ts-ignore
                | undefined = rpc.queries[path[1]];
            if (typeof query !== 'undefined') {
                query
                    .default(deserialize(req.body, {}), await context(req, res))
                    .then((result) => {
                        res.status(200).json(serialize(result, {}));
                        resolve();
                    })
                    .catch((error) => {
                        res.status(500).end(error.message);
                        reject(error);
                        resolve();
                    });
            } else {
                res.status(404).end('Query does not exist');
                resolve();
            }
        } else {
            res.status(404).end('Must be a query or a mutation');
            resolve();
        }
    });
}
