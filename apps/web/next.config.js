module.exports = {
    reactStrictMode: true,
    images: {
        domains: ['www.gravatar.com'],
    },
    webpack: (config) => {
        config.optimization.minimize = false;
        return config;
    },
};
