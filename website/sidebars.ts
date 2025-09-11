import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * ERIFY™ Luxury Documentation Sidebar
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // ERIFY™ main documentation sidebar with luxury icons
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: '💎 Welcome to ERIFY™',
    },
    {
      type: 'category',
      label: '🗣💠 ERIVOX™',
      collapsed: false,
      items: [
        'erivox/overview',
        'erivox/getting-started',
        'erivox/voice-commands',
        'erivox/integrations',
        'erivox/api-reference',
        'erivox/examples',
      ],
    },
    {
      type: 'category',
      label: '✅💎 AVERIZY™',
      collapsed: false,
      items: [
        'averizy/overview',
        'averizy/verification-process',
        'averizy/api-reference',
        'averizy/security',
        'averizy/examples',
      ],
    },
    {
      type: 'category',
      label: '🔥 Flame Feed',
      collapsed: false,
      items: [
        'flame-feed/overview',
        'flame-feed/content-creation',
        'flame-feed/ai-features',
        'flame-feed/social-features',
      ],
    },
    {
      type: 'category',
      label: '💳 ERIFY Wallet',
      collapsed: false,
      items: [
        'erify-wallet/overview',
        'erify-wallet/digital-payments',
        'erify-wallet/gift-cards',
        'erify-wallet/security',
      ],
    },
    {
      type: 'category',
      label: '🛠️ Operations',
      collapsed: true,
      items: [
        'ops/scheduling',
        'ops/infrastructure',
        'ops/deployment',
      ],
    },
  ],
};

export default sidebars;