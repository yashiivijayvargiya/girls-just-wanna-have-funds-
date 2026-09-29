
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="about-page">
      <header className="site-header">
        <Link
          className="brand-mark"
          href="/"
          aria-label="Girls Just Wanna Have Funds home"
        >
          <span className="brand-kicker">THE BUSINESS CLUB</span>
          <span className="brand-name">
            girls just wanna have funds<span className="brand-dot">.</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Main navigation">
          <Link href="/">Welcome</Link>
          <Link className="nav-login" href="/login">Log in</Link>
        </nav>
      </header>

      <section className="about-hero">
        <p className="eyebrow">
          <span className="eyebrow-line" />
          A note from the founder
        </p>

        <h1 className="about-title">
          <span className="welcome-script">Our</span>
          <br />
          community, <em>our story.</em>
        </h1>

        <p className="about-lede">
          A practical little space for people who are building
          their own thing and learning the money side as they go.
        </p>
      </section>

      <section className="about-story">
        <div className="story-visual">
          <div className="story-label">01 / WHY I MADE THIS</div>

          <div className="founder-frame">
            <img
              className="founder-framed-photo"
              src="/about-founder-framed.png"
              alt="Founder wearing her handmade beaded accessories,
              displayed in a vintage wooden frame"
            />
          </div>

          <p className="photo-caption">
            A little bit of me, and the business behind this space.
          </p>
        </div>

        <div className="story-copy">
          <h2>Built by a business owner, for business owners.</h2>

          <p>
            I’m a fellow small business owner, and I know that
            running a business is about so much more than making
            and selling a product. There are orders to track,
            costs to remember, prices to work out, payments to
            follow up on, and decisions to make with the numbers
            you have.
          </p>

          <p>
            Girls Just Wanna Have Funds grew from wanting a
            simpler, more approachable way to bring those
            pieces together. I wanted a tool that felt
            welcoming rather than intimidating, especially
            for anyone learning the financial side of
            entrepreneurship while doing everything else
            themselves.
          </p>

          <p>
            This is a place to get organised, build financial
            confidence, and make thoughtful decisions for
            your business - one step at a time.
          </p>

          <Link className="btn btn-primary" href="/login">
            Come on in <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="about-values">
        <article>
          <span>01</span>
          <h3>Learn as you go</h3>
          <p>
            Make sense of the everyday numbers without
            needing to be a finance expert.
          </p>
        </article>

        <article>
          <span>02</span>
          <h3>Keep it organised</h3>
          <p>
            Bring orders, payments, and business details
            into one useful workspace.
          </p>
        </article>

        <article>
          <span>03</span>
          <h3>Grow your way</h3>
          <p>
            Build at your own pace, with more clarity
            around each next step.
          </p>
        </article>
      </section>

      <footer className="site-footer">
        <Link href="/">
          girls just wanna have funds<span className="brand-dot">.</span>
        </Link>
        <span>Made for independent business owners</span>
      </footer>
    </main>
  );
}
