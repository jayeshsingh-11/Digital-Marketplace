/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		PAYLOAD_CONFIG_PATH: "src/payload.config.ts"
	},
	images: {
		remotePatterns: [
			{
				protocol: "http",
				hostname: "localhost",
			},
			{
				protocol: "https",
				hostname: "digitalhippo-production.up.railway.app",
			},
		],
	},
};

module.exports = nextConfig;
