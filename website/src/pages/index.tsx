import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/intro">
            Explore the Empire ✨
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/erivox/overview">
            Meet ERIVOX™ 🗣💠
          </Link>
        </div>
      </div>
    </header>
  );
}

function ProductHeroPanels() {
  return (
    <section className={styles.productHeroes}>
      <div className="container">
        <div className={styles.heroGrid}>
          {/* ERIVOX™ Hero Panel */}
          <div className={clsx('card', styles.heroPanel, styles.erivoxPanel)}>
            <div className={styles.heroContent}>
              <div className={styles.heroIcon}>
                🗣💠
              </div>
              <Heading as="h2" className={styles.heroTitle}>
                ERIVOX™
              </Heading>
              <p className={styles.heroTagline}>
                Intelligent Voice & Text Assistant
              </p>
              <p className={styles.heroDescription}>
                Experience the future of AI conversation with luxury voice processing and seamless text integration. 
                ERIVOX™ understands context, emotion, and intent like never before.
              </p>
              <Link
                className="button button--primary"
                to="/docs/erivox/overview">
                Discover ERIVOX™
              </Link>
            </div>
          </div>

          {/* AVERIZY™ Hero Panel */}
          <div className={clsx('card', styles.heroPanel, styles.averizyPanel)}>
            <div className={styles.heroContent}>
              <div className={styles.heroIcon}>
                ✅💎
              </div>
              <Heading as="h2" className={styles.heroTitle}>
                AVERIZY™
              </Heading>
              <p className={styles.heroTagline}>
                Luxury Verification Platform
              </p>
              <p className={styles.heroDescription}>
                Trust, verified. AVERIZY™ delivers enterprise-grade verification with diamond-level security 
                and seamless user experiences that inspire confidence.
              </p>
              <Link
                className="button button--primary"
                to="/docs/averizy/overview">
                Explore AVERIZY™
              </Link>
            </div>
          </div>

          {/* Flame Feed Hero Panel */}
          <div className={clsx('card', styles.heroPanel, styles.flamePanel)}>
            <div className={styles.heroContent}>
              <div className={styles.heroIcon}>
                🔥
              </div>
              <Heading as="h2" className={styles.heroTitle}>
                Flame Feed
              </Heading>
              <p className={styles.heroTagline}>
                AI-Powered Social Experience
              </p>
              <p className={styles.heroDescription}>
                Where creators ignite their potential. Flame Feed combines social discovery with AI-driven 
                content creation for an experience that's both familiar and revolutionary.
              </p>
              <Link
                className="button button--primary"
                to="/docs/flame-feed/overview">
                Join the Flame
              </Link>
            </div>
          </div>

          {/* ERIFY Wallet Hero Panel */}
          <div className={clsx('card', styles.heroPanel, styles.walletPanel)}>
            <div className={styles.heroContent}>
              <div className={styles.heroIcon}>
                💳
              </div>
              <Heading as="h2" className={styles.heroTitle}>
                ERIFY Wallet
              </Heading>
              <p className={styles.heroTagline}>
                Secure Digital Payments
              </p>
              <p className={styles.heroDescription}>
                Luxury meets security in digital payments. ERIFY Wallet delivers premium payment experiences 
                with military-grade security and elegant user interfaces.
              </p>
              <Link
                className="button button--primary"
                to="/docs/erify-wallet/overview">
                Secure Your Future
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Luxury AI Platforms`}
      description="ERIFY™ Technologies - Building luxury AI-powered platforms and digital experiences that inspire. From ERIVOX™ voice AI to AVERIZY™ verification.">
      <HomepageHeader />
      <main>
        <ProductHeroPanels />
      </main>
    </Layout>
  );
}