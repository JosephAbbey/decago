const resolvers = {};
class ModelPromise {
    constructor(name) {
        this.name = name;
        this.model = new Promise((resolve, reject) => {
            if (!resolvers[name]) resolvers[name] = [];
            resolvers[name].push(resolve);
        });
    }
}

class Model {
    constructor(name, schema) {
        this.name = name;
        this.schema = schema;
        resolvers[name]?.forEach((resolve) => resolve(this));
    }

    nullable() {
        this._nullable = true;
        return this;
    }
}

class Object {
    constructor(type) {
        this.type = type;
    }

    default(value) {
        this._default = value;
        return this;
    }

    unique() {
        this._unique = true;
        return this;
    }

    nullable() {
        this._nullable = true;
        return this;
    }

    id() {
        this._id = true;
        this._unique = true;
        return this;
    }
}

class List {
    constructor(of) {
        this.type = 'list';
        this.of = of;
    }
}

module.exports = {
    autoincremental: () => 0,
    now: () => new Date(),
    t: {
        listOf: (type) => new List(type),
        int: () => new Object('int'),
        float: () => new Object('float'),
        string: () => new Object('string'),
        boolean: () => new Object('boolean'),
        date: () => new Object('date'),
        Object,
        List,
        Model,
        ModelPromise,
        ForwardDeclaration: (name) => new ModelPromise(name),
    },
};
