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
				title: 'SAI VAP',
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
				description: 'SAI Verified Agent Protocol',
				head: [
					{ tag: 'link', attrs: { rel: 'icon', href: '/favicon-48.png', type: 'image/png', sizes: '48x48' } },
					{ tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
				],
				defaultLocale: 'root',
				tableOfContents: false,
				locales: {
					root: {
						label: 'English',
						lang: 'en',
					},
				},
				sidebar: [
					{ label: 'Overview', slug: 'reference/overview' },
					{ label: 'Roles', slug: 'reference/roles' },
					{
						label: 'Flow',
						items: [
							{ label: 'Authorization', slug: 'reference/flow/authorization' },
							{ label: 'Stages', slug: 'reference/flow/stages' },
							{ label: 'Execution Gate', slug: 'reference/flow/execution-gate' },
						],
					},
					{
						label: 'Protocol',
						items: [
							{ label: 'Objects', slug: 'reference/protocol/objects' },
							{ label: 'Binding', slug: 'reference/protocol/binding' },
						],
					},
					{ label: 'SDK and MCP', slug: 'reference/sdk' },
					{ label: 'Example', slug: 'reference/example' },
					{ label: 'Threat model', slug: 'reference/threat-model' },
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
