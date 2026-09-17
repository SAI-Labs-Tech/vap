// @ts-check
import { defineConfig } from 'astro/config';
import UnoCSS from 'unocss/astro'
import Icons from 'starlight-plugin-icons'
import mermaid from 'astro-mermaid';

export default defineConfig({
	site: 'https://guard.sai-labs.pro',
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
				description: 'Pre-signing transaction verification protocol',
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
					{ label: 'Overview', slug: 'reference/overview' },
					{
						label: 'Concepts',
						items: [
							{ label: 'Architecture', slug: 'reference/architecture' },
							{ label: 'Transaction lifecycle', slug: 'reference/lifecycle' },
							{ label: 'Verification model', slug: 'reference/verification' },
							{ label: 'Risk engine', slug: 'reference/risk-engine' },
							{ label: 'AI Transaction Protect', slug: 'reference/transaction-protect' },
						],
					},
					{
						label: 'Agent infrastructure',
						items: [
							{ label: 'SAI Guard Agent', slug: 'reference/protect-agent' },
							{ label: 'Arc settlement', slug: 'reference/arc' },
							{ label: 'Verification receipts', slug: 'reference/receipts' },
						],
					},
					{ label: 'Networks', slug: 'reference/networks' },
					{ label: 'Guides', slug: 'reference/guides' },
					{ label: 'SDK', slug: 'reference/sdk' },
					{
						label: 'API reference',
						items: [
							{ label: 'HTTP API', slug: 'reference/api' },
							{ label: 'Schemas', slug: 'reference/schemas' },
						],
					},
					{ label: 'Integrations', slug: 'reference/providers' },
					{
						label: 'Security',
						items: [
							{ label: 'Threat model', slug: 'reference/threat-model' },
						],
					},
					{
						label: 'Protocol status',
						items: [
							{ label: 'Status', slug: 'reference/status' },
							{ label: 'From v0.1', slug: 'reference/migration' },
						],
					},
					{ label: 'Glossary', slug: 'reference/glossary' },
				],
				markdown: {
					headingLinks: false,
				},
			},
		}),
	],
});
