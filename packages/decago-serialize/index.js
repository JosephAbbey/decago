module.exports.serialize = function (obj, serializers) {
    serializers = {
        Date: (date) => ({ value: date.toISOString() }),
        ...serializers,
    };
    function serialize(obj) {
        if (obj instanceof Array) {
            return obj.map(serialize);
        } else if (['string', 'number', 'boolean'].includes(typeof obj)) {
            return obj;
        } else if (serializers.hasOwnProperty(obj.constructor.name)) {
            var a = structuredClone(
                serialize(serializers[obj.constructor.name](obj))
            );
            a._name = obj.constructor.name;
            return a;
        } else if (obj instanceof Object) {
            return Object.keys(obj).reduce((acc, key) => {
                acc[key] = serialize(obj[key]);
                return acc;
            }, {});
        }
    }
    return serialize(obj);
};

module.exports.deserialize = function (obj, deserializers) {
    deserializers = {
        Date: (date) => new Date(date.value),
        ...deserializers,
    };
    function deserialize(obj) {
        if (obj instanceof Array) {
            return obj.map(deserialize);
        } else if (['string', 'number', 'boolean'].includes(typeof obj)) {
            return obj;
        } else if (deserializers.hasOwnProperty(obj._name)) {
            var a = structuredClone(obj);
            delete a;
            return deserializers[obj._name](obj);
        } else if (obj instanceof Object) {
            return Object.keys(obj).reduce((acc, key) => {
                acc[key] = deserialize(obj[key]);
                return acc;
            }, {});
        }
    }
    return deserialize(obj);
};
