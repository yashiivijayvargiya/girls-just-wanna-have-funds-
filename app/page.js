import Link from 'next/link';

export default function Home() {
  return (
    <main className="welcome-page">
      <header className="site-header">
        <Link className="brand-mark" href="/" aria-label="Girls Just Wanna Have Funds home">
          <span className="brand-kicker">THE BUSINESS CLUB</span>
          <span className="brand-name">girls just wanna have funds<span className="brand-dot">.</span></span>
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          <Link href="/about">Our community</Link>
          <Link className="nav-login" href="/login">Log in</Link>
        </nav>
      </header>

      <section className="welcome-hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> A little more clarity, a lot more confidence</p>
          <h1 className="welcome-title"><span className="welcome-script">Welcome</span><span className="welcome-to">to</span><span className="welcome-brand">girls just<br />wanna have funds<span className="brand-dot">.</span></span></h1>
          <p className="welcome-description">
            Your cozy corner for keeping business finances in check. Track orders, understand your numbers, and make room for the ideas you can’t wait to bring to life.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary welcome-cta" href="/login">Get started <span aria-hidden="true">↗</span></Link>
            <Link className="text-link" href="/about">Meet the community</Link>
          </div>
          <p className="hero-note">Made for the girls building something of their own.</p>
        </div>
        <div className="hero-art" aria-label="Decorative retro-inspired finance illustration">
          <div className="art-window">
            <div className="window-bar"><span /><span /><span /><i /></div>
            <div className="art-content">
              <p className="art-label">YOUR BUSINESS, YOUR NUMBERS</p>
              <div className="art-heading">Make room<br /><em>for more.</em></div>
              <div className="art-sticker sticker-one">PLAN<br />YOUR<br />NEXT MOVE</div>
              <div className="art-sticker sticker-two">GOOD<br />THINGS<br />GROW</div>
              <div className="art-ledger">
                <div><span>Orders</span><b>Organised</b></div>
                <div><span>Payments</span><b>In view</b></div>
                <div><span>Profit</span><b>Understood</b></div>
              </div>
            </div>
          </div>
          <div className="hero-spark spark-a">✳</div>
          <div className="hero-spark spark-b">✦</div>
          <p className="art-caption">A fresh start for your money matters</p>
        </div>
      </section>

      <section className="welcome-strip" aria-label="Platform highlights">
        <span>TRACK YOUR ORDERS</span><b>✳</b><span>KNOW YOUR PROFIT</span><b>✳</b><span>GROW AT YOUR PACE</span><b>✳</b><span>KEEP IT ALL TOGETHER</span>
      </section>

      <section className="welcome-bottom">
        <div>
          <p className="eyebrow">A space to build with confidence</p>
          <h2>Big ideas deserve<br /><em>clear numbers.</em></h2>
        </div>
        <p>Whether you’re just starting out or finding your rhythm, this is a simple place to organise the moving parts of your business and feel more in control of the money behind it.</p>
        <Link className="text-link" href="/about">Read our story ↗</Link>
      </section>
      <footer className="site-footer"><span>girls just wanna have funds<span className="brand-dot">.</span></span><span>Made for independent business owners</span></footer>
    </main>
  );
}
