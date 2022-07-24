import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    var { path } = req.query;
    if (typeof path === 'undefined') {
        res.statusCode = 404;
        return res.end('Missing path');
    }
    if (typeof path === 'string') {
        path = [path];
    }
    return res.end(`Post: ${path.join(', ')}`);
}
