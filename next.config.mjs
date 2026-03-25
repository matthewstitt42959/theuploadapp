/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack(config) {
        config.resolve.fallback = {
            fs: false,
            net: false,
            tls: false,
            dns: false,
            console: false,
            async_hooks: false,
            ...config.resolve.fallback,
        };
        return config;
    },
};

export default nextConfig;
