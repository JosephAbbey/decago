import { t } from '@decago/object-definition';
import serialize from '@decago/serialize';
import type { NextApiRequest, NextApiResponse } from 'next';
import * as rpc from '../../../api';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    var { path } = req.query;
    if (typeof path === 'undefined') {
        res.statusCode = 404;
        return res.end('Missing path');
    }
    if (typeof path === 'string') {
        path = [path];
    }
    if (path[0] === 'mutations') {
        const mutation:
            | {
                  i: t.Type;
                  o: t.Type;
                  default: (input: any) => Promise<any>;
              }
            //@ts-expect-error
            | undefined = rpc.mutations[path[1]];
        if (typeof mutation !== 'undefined') {
            mutation
                .default(req.body)
                .then((result) => {
                    res.statusCode = 200;
                    res.json(serialize(result, {}));
                    res.end();
                })
                .catch((error) => {
                    res.statusCode = 500;
                    res.end(error);
                });
        } else {
            res.statusCode = 404;
            return res.end('Mutation does not exist');
        }
    } else if (path[0] === 'queries') {
        const query:
            | {
                  i: t.Type;
                  o: t.Type;
                  default: (input: any) => Promise<any>;
              }
            //@ts-expect-error
            | undefined = rpc.queries[path[1]];
        if (typeof query !== 'undefined') {
            query
                .default(req.body)
                .then((result) => {
                    res.statusCode = 200;
                    res.json(serialize(result, {}));
                    res.end();
                })
                .catch((error) => {
                    res.statusCode = 500;
                    res.end(error);
                });
        } else {
            res.statusCode = 404;
            return res.end('Query does not exist');
        }
    } else {
        res.statusCode = 404;
        return res.end('Must be a query or a mutation');
    }
}
