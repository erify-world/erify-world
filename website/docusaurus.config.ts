import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'ERIFY™ World',
  tagline: 'From the ashes to the stars ✨ — Luxury AI-powered platforms and digital experiences',
  favicon: 'favicon.svg',
  
  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://erify-world.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/erify-world/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'erify-world', // Usually your GitHub org/user name.
  projectName: 'erify-world', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/erify-world/erify-world/tree/main/website/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/erify-world/erify-world/tree/main/website/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'ERIFY™',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/erivox/overview',
          label: 'ERIVOX™',
          position: 'left',
        },
        {
          to: '/docs/averizy/overview',
          label: 'AVERIZY™',
          position: 'left',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/erify-world/erify-world',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    algolia: {
      // The application ID provided by Algolia
      appId: process.env.ALGOLIA_APP_ID || 'BH4D9OD16A',
      
      // Public API key: it is safe to commit it
      apiKey: process.env.ALGOLIA_SEARCH_API_KEY || '25626fae796133dc1e734c6bcaaeac3c',
      
      indexName: process.env.ALGOLIA_INDEX_NAME || 'docsearch',
      
      // Optional: see doc section below
      contextualSearch: true,
      
      // Optional: Specify domains where the navigation should occur through window.location instead on history.push
      // externalUrlRegex: 'external\\.com|domain\\.com',
      
      // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl
      // replaceSearchResultPathname: {
      //   from: '/docs/', // or as RegExp: /\/docs\//
      //   to: '/',
      // },
      
      // Optional: Algolia search parameters
      searchParameters: {},
      
      // Optional: path for search page that enabled by default (`false` to disable it)
      searchPagePath: 'search',
      
      //... other Algolia params
      placeholder: 'Search ERIFY™ docs...',
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Products',
          items: [
            {
              label: 'ERIVOX™',
              to: '/docs/erivox/overview',
            },
            {
              label: 'AVERIZY™',
              to: '/docs/averizy/overview',
            },
            {
              label: 'Flame Feed',
              to: '/docs/flame-feed/overview',
            },
            {
              label: 'ERIFY Wallet',
              to: '/docs/erify-wallet/overview',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'X (Twitter)',
              href: 'https://x.com/erifyteam',
            },
            {
              label: 'YouTube',
              href: 'https://www.youtube.com/@erifyworld',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/erify-world',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'Website',
              href: 'https://erifyworldwide.com',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ERIFY™ Technologies. Built with luxury and precision.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;