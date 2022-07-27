export default function serialize(
    obj: any,
    serializers: { [key: string]: (a: any) => any }
): any;

export function deserialize(
    obj: any,
    deserializers: { [key: string]: (a: any) => any }
): any;
