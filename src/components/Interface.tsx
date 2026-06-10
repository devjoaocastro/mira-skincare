import { useState, type FormEvent } from 'react'
import { scrollToPage } from '../scrollBus'

/* ------------------------------------------------------------------ */
/* Newsletter pill — preventDefault, flips to a success state.         */
/* ------------------------------------------------------------------ */

function NewsletterForm() {
  const [joined, setJoined] = useState(false)
  const [email, setEmail] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (email.trim().length > 3) setJoined(true)
  }

  if (joined) {
    return (
      <p className="news__success" role="status">
        You&rsquo;re in ✓
      </p>
    )
  }

  return (
    <form className="news" onSubmit={onSubmit}>
      <input
        type="email"
        required
        placeholder="your@email.com"
        aria-label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Join the ritual</button>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Scrolled HTML interface — one section per ScrollControls page.      */
/* ------------------------------------------------------------------ */

export default function Interface() {
  return (
    <div className="interface">
      {/* 0 — Hero */}
      <section className="section section--center section--hero">
        <p className="tagline">Clean skincare · made slow · Lisboa</p>
        <h1 className="hero-title">
          Skin, in its
          <br />
          <em>own</em> words.
        </h1>
        <p className="hero-sub">
          One bottle. Seven ingredients your barrier already understands.
          Nothing borrowed, nothing loud — skincare that listens before it speaks.
        </p>
        <button className="cta" onClick={() => scrollToPage(1)}>
          Begin the ritual ↓
        </button>
        <div className="scroll-hint">
          <span className="scroll-hint__line" />
          <span className="scroll-hint__label">scroll</span>
        </div>
      </section>

      {/* 1 — Philosophy */}
      <section className="section section--left" data-num="01">
        <p className="kicker">01 — Philosophy</p>
        <h2>
          Seven ingredients.
          <br />
          <em>Zero</em> noise.
        </h2>
        <p className="body">
          The average serum carries thirty-two ingredients; your skin recognises
          maybe six of them. We removed everything that was there for the texture,
          the scent, the shelf — and kept only what your barrier would have chosen
          for itself. What&rsquo;s left fits on one breath: water, squalane, oat
          ceramide, sea fennel, prebiotic sugar, glycerin, and time.
        </p>
        <p className="hint">→ the orbit speeds up when you hover it</p>
      </section>

      {/* 2 — Ritual */}
      <section className="section section--left" data-num="02">
        <p className="kicker">02 — The Ritual</p>
        <h2>
          Three steps.
          <br />
          Two minutes.
        </h2>
        <ul className="ritual">
          <li>
            <span>01</span>
            <strong>Cleanse</strong>
            <p>Lukewarm water, thirty unhurried seconds — let the day dissolve, not scrub away.</p>
          </li>
          <li>
            <span>02</span>
            <strong>Feed</strong>
            <p>Three drops pressed — never rubbed — into damp skin, from the centre outwards.</p>
          </li>
          <li>
            <span>03</span>
            <strong>Seal</strong>
            <p>Warm the balm between your palms and hold them to your face like a quiet promise.</p>
          </li>
        </ul>
      </section>

      {/* 3 — Ingredients */}
      <section className="section section--top" data-num="03">
        <p className="kicker">03 — Ingredients</p>
        <h2>
          Grown, not
          <br />
          <em>synthesised</em>.
        </h2>
        <p className="body body--narrow">
          Four heroes carry the formula. Hover each drop to meet them where they grew.
        </p>
      </section>

      {/* 4 — The Bottle */}
      <section className="section section--left" data-num="04">
        <p className="kicker">04 — The Bottle</p>
        <h2>
          One bottle,
          <br />
          for <em>years</em>.
        </h2>
        <p className="body">
          Frosted glass, a terracotta cap, and a refill system that costs less
          every time you come back. No seasonal launches. No limited editions.
          When we improve the formula, your same bottle simply gets better.
        </p>
        <div className="price">
          <strong>€42</strong>
          <span>50 ml · refillable · ships in paper</span>
        </div>
        <p className="hint">→ hover lifts the cap · click for a gentle bounce</p>
      </section>

      {/* 5 — Promise */}
      <section className="section section--center" data-num="05">
        <p className="kicker">05 — The Promise</p>
        <h2>
          Refill, don&rsquo;t <em>landfill</em>.
        </h2>
        <p className="body body--center">
          A bottle should outlive its first formula. Ours is designed to be
          kept, returned to, and handed a second life — eighty-seven times out
          of a hundred, it is.
        </p>
        <div className="stats">
          <div>
            <strong>87%</strong>
            <span>refill rate</span>
          </div>
          <div>
            <strong>0</strong>
            <span>virgin plastic</span>
          </div>
          <div>
            <strong>1</strong>
            <span>formula</span>
          </div>
        </div>
      </section>

      {/* 6 — Footer */}
      <section className="section section--footer">
        <div className="footer-card">
          <p className="footer-card__line">
            <em>Be kind to your barrier.</em>
          </p>

          <NewsletterForm />

          <div className="footer-card__cols">
            <div>
              <h3>Shop</h3>
              <a href="#the-bottle" onClick={(e) => { e.preventDefault(); scrollToPage(4) }}>The Bottle</a>
              <a href="#refills" onClick={(e) => { e.preventDefault(); scrollToPage(5) }}>Refills</a>
              <a href="#gift" onClick={(e) => e.preventDefault()}>Gift a ritual</a>
            </div>
            <div>
              <h3>Help</h3>
              <a href="#how" onClick={(e) => { e.preventDefault(); scrollToPage(2) }}>How to use</a>
              <a href="#shipping" onClick={(e) => e.preventDefault()}>Shipping &amp; returns</a>
              <a href="mailto:hello@mira.skin">Talk to a human</a>
            </div>
            <div>
              <h3>World</h3>
              <a href="#philosophy" onClick={(e) => { e.preventDefault(); scrollToPage(1) }}>Philosophy</a>
              <a href="#ingredients" onClick={(e) => { e.preventDefault(); scrollToPage(3) }}>Ingredients</a>
              <a href="#journal" onClick={(e) => e.preventDefault()}>Journal</a>
            </div>
          </div>

          <div className="footer-card__base">
            <span>© MIRA skincare 2026</span>
            <span>Lisboa</span>
            <a href="mailto:hello@mira.skin">hello@mira.skin</a>
          </div>
        </div>

        <p className="footer-note">
          This site uses zero cookies. Like our formulas — nothing you don&rsquo;t need.
        </p>
      </section>
    </div>
  )
}
