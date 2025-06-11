/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '',
                pathname: '/static/images/**',
            },
        ],
    },
    output: 'standalone',
};

export default nextConfig;
