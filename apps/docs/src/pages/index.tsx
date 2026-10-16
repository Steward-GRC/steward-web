// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";

import "../css/home.css";

const guideAreas = [
  { title: "Concepts", href: "/concepts", body: "The big ideas: what a policy or procedure is and what it means to acknowledge one." },
  { title: "User Guide", href: "/user-guide", body: "Find a document, read it, acknowledge it, write a draft, report a concern." },
  { title: "Admin Guide", href: "/admin-guide", body: "Set up Steward, manage people and organisations, read the audit log." },
  { title: "Reference", href: "/reference", body: "A short dictionary of terms you can look up any time." },
];

export default function Home() {
  return (
    <Layout title="Steward Guide" description="A plain-language guide to policies, procedures and compliance">
      <header className="home-hero">
        <div className="home-hero__backdrop" aria-hidden="true" />
        <div className="home-hero__grid">
          <div>
            <p className="home-hero__eyebrow">Steward guide</p>
            <h1 className="home-hero__headline">
              <span>A plain-language guide</span>
              <span className="home-hero__headline-accent">to policies and compliance.</span>
            </h1>
            <p className="home-hero__lede">
              Learn how a policy moves from draft to <mark>approved</mark>, how to{" "}
              <mark>acknowledge</mark> what applies to you, and how to find anything in seconds.
            </p>
            <div className="home-hero__actions">
              <Link className="home-hero__btn home-hero__btn--primary" to="/welcome">
                Start reading
              </Link>
              <Link className="home-hero__btn home-hero__btn--secondary" to="https://github.com/Steward-GRC/steward-web">
                View on GitHub
              </Link>
            </div>
          </div>
          <div className="home-terminal" role="img" aria-label="Illustrative guide map">
            <div className="home-terminal__bar">
              <span className="home-terminal__dot" />
              <span className="home-terminal__dot" />
              <span className="home-terminal__dot" />
              <span className="home-terminal__title">steward guide</span>
            </div>
            <pre className="home-terminal__body">
              <code>
                {"concepts      the big ideas\n" +
                  "user-guide    everyday tasks\n" +
                  "admin-guide   set up and manage\n" +
                  "reference     a short glossary"}
              </code>
            </pre>
          </div>
        </div>
      </header>
      <section className="home-links">
        {guideAreas.map((area) => (
          <Link key={area.href} className="home-links__card" to={area.href}>
            <div className="home-links__title">{area.title}</div>
            <div className="home-links__body">{area.body}</div>
          </Link>
        ))}
      </section>
    </Layout>
  );
}
