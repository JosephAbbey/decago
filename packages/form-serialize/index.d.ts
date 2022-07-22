export default function serialize(
    obj: any,
    serializers: { [key: string]: (a: any) => any }
): string;

export function deserialize(
    obj: string,
    deserializers: { [key: string]: (a: any) => any }
): any;
