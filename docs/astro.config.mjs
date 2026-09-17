// @ts-check
import { defineConfig } from 'astro/config';
import UnoCSS from 'unocss/astro'
import Icons from 'starlight-plugin-icons'
import mermaid from 'astro-mermaid';

export default defineConfig({
	site: 'https://vap.saiwallet.ai',
	server: {
		host: true,
		port: 4322,
		allowedHosts: true,
	},
	vite: {
		server: {
			host: true,
			hmr: {
				clientPort: 4322,
			},
		},
		preview: {
			host: true,
			port: 4322,
		},
	},
	integrations: [
		mermaid({
			theme: 'forest',
			autoTheme: true
		}),
		UnoCSS(),
		Icons({
			starlight:{
				title: 'SAI Guard Protocol',
				favicon: '/favicon.ico',
				social: [
					{ icon: 'github', label: 'GitHub', href: 'https://github.com/SAI-Labs-Tech/vap' },
					{ icon: 'telegram', label: 'Telegram', href: 'https://t.me/SAI_wallet' },
					{ icon: 'twitter', label: 'X', href: 'https://x.com/SAIWallet' },
					{ icon: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@SAIWallet' },
				],
				logo: {
					src: './src/assets/sai_logo.svg',
				},
				customCss: [
					'./src/styles/custom.css',
				],
				description: 'SAI Guard Protocol',
				head: [
					{ tag: 'link', attrs: { rel: 'icon', href: '/favicon-48.png', type: 'image/png', sizes: '48x48' } },
					{ tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
				],
				defaultLocale: 'root',
				tableOfContents: true,
				locales: {
					root: {
						label: 'English',
						lang: 'en',
					},
				},
				sidebar: [
					{
						label: 'Introduction',
						items: [
							{ label: 'Overview', slug: 'reference/overview' },
							{ label: 'Why SAI Guard', slug: 'reference/why-vap' },
							{ label: 'AI Transaction Protect', slug: 'reference/transaction-protect' },
							{ label: 'Core Principles', slug: 'reference/principles' },
						],
					},
					{
						label: 'Architecture',
						items: [
							{ label: 'Protocol Architecture', slug: 'reference/architecture' },
							{ label: 'Transaction Lifecycle', slug: 'reference/lifecycle' },
							{ label: 'Three-Layer Verification', slug: 'reference/verification' },
							{ label: 'Deterministic Risk Engine', slug: 'reference/risk-engine' },
							{ label: 'SAI Protect Agent', slug: 'reference/protect-agent' },
							{ label: 'Threat Model', slug: 'reference/threat-model' },
						],
					},
					{
						label: 'Transaction Protection',
						items: [
							{ label: 'Transaction Types', slug: 'reference/transactions' },
							{ label: 'Networks', slug: 'reference/networks' },
							{ label: 'Examples', slug: 'reference/examples' },
						],
					},
					{
						label: 'Agentic Infrastructure',
						items: [
							{ label: 'Arc — Settlement Layer', slug: 'reference/arc' },
							{ label: 'Receipts and Marketplace', slug: 'reference/receipts' },
							{ label: 'Providers', slug: 'reference/providers' },
						],
					},
					{
						label: 'Developers',
						items: [
							{ label: 'SDK and MCP', slug: 'reference/sdk' },
							{ label: 'REST API', slug: 'reference/api' },
							{ label: 'Schemas', slug: 'reference/schemas' },
							{ label: 'From v0.1', slug: 'reference/migration' },
						],
					},
					{ label: 'FAQ', slug: 'reference/faq' },
					{ label: 'Glossary', slug: 'reference/glossary' },
				],
				markdown: {
					headingLinks: false,
				},
			},
		}),
	],
});
