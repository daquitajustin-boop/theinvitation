import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

// All event details come from the server via getStaticProps
// so they're read from .env at build time
export async function getStaticProps() {
  return {
    props: {
      eventBabyName: process.env.EVENT_BABY_NAME  || 'Saiah Alisbo',
      eventDay:      process.env.EVENT_DAY        || 'Sunday',
      eventDate:     process.env.EVENT_DATE        || 'April 19',
      eventTime:     process.env.EVENT_TIME        || '10:00 AM',
      eventLocation: process.env.EVENT_LOCATION   || 'Bagong Parañaque Phase III, Open Court',
      dressCode:     process.env.EVENT_DRESS_CODE || 'Nude Browns & Pastels',
    },
  };
}

export default function Home({ eventBabyName, eventDay, eventDate, eventTime, eventLocation, dressCode }) {
  const [step, setStep]       = useState(1);
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [dupMsg, setDupMsg]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim())  return setError('Please enter your full name.');
    if (!email.trim()) return setError('Please enter your Gmail address.');

    setLoading(true);
    try {
      // 1. Save RSVP (checks duplicates)
      const rsvpRes = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const rsvpData = await rsvpRes.json();

      if (rsvpRes.status === 409 && rsvpData.duplicate) {
        setDupMsg(rsvpData.message);
        setStep(3);
        setLoading(false);
        return;
      }
      if (!rsvpRes.ok) throw new Error('Failed to save RSVP');

      // 2. Send emails via Node.js + Gmail (server-side, credentials stay secret)
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName: name.trim(), guestEmail: email.trim() }),
      });

      setStep(2);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1); setName(''); setEmail(''); setError(''); setDupMsg('');
  };

  return (
    <>
      <Head>
        <title>{eventBabyName}&apos;s Baptism — RSVP</title>
        <meta name="description" content={`Confirm your attendance for ${eventBabyName}'s Baptism`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.page}>
        <div className={styles.petals} aria-hidden="true">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`${styles.petal} ${styles[`petal${i + 1}`]}`} />
          ))}
        </div>

        {/* ── HERO ── */}
        <section className={styles.hero}>
          <div className={styles.floralTopRight} aria-hidden="true">
            <svg viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M180 190 Q160 130 130 80 Q110 40 140 10" stroke="#8a9e7a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <path d="M155 150 Q130 120 120 90" stroke="#8a9e7a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <circle cx="145" cy="15" r="12" fill="#d4917a" opacity="0.85"/>
              <circle cx="165" cy="8"  r="9"  fill="#c47a7a" opacity="0.8"/>
              <circle cx="158" cy="28" r="10" fill="#e8c4b8" opacity="0.9"/>
              <circle cx="175" cy="22" r="7"  fill="#d4917a" opacity="0.7"/>
              <circle cx="140" cy="32" r="8"  fill="#c47a7a" opacity="0.75"/>
              <circle cx="125" cy="88" r="9"  fill="#e8c4b8" opacity="0.8"/>
              <circle cx="115" cy="78" r="7"  fill="#d4b0a0" opacity="0.7"/>
              <circle cx="135" cy="75" r="6"  fill="#e8c4b8" opacity="0.65"/>
              <ellipse cx="148" cy="55" rx="5" ry="8" fill="#d4917a" opacity="0.6" transform="rotate(-20 148 55)"/>
              <ellipse cx="162" cy="48" rx="4" ry="7" fill="#c47a7a" opacity="0.55" transform="rotate(15 162 48)"/>
              <ellipse cx="130" cy="100" rx="8" ry="14" fill="#8a9e7a" opacity="0.5" transform="rotate(-40 130 100)"/>
              <ellipse cx="145" cy="70"  rx="6" ry="11" fill="#b8c8a8" opacity="0.45" transform="rotate(20 145 70)"/>
            </svg>
          </div>
          <div className={styles.floralBottomLeft} aria-hidden="true">
            <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 210 Q50 170 90 130 Q120 100 150 60" stroke="#8a9e7a" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M60 190 Q80 160 100 140" stroke="#8a9e7a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <circle cx="90"  cy="132" r="11" fill="#f0ddd5" opacity="0.9"/>
              <circle cx="75"  cy="120" r="9"  fill="#e8c4b8" opacity="0.85"/>
              <circle cx="100" cy="118" r="8"  fill="#f0ddd5" opacity="0.8"/>
              <circle cx="85"  cy="108" r="7"  fill="#e8c4b8" opacity="0.75"/>
              <circle cx="112" cy="125" r="6"  fill="#ddb8a8" opacity="0.7"/>
              <circle cx="105" cy="145" r="8"  fill="#f0ddd5" opacity="0.8"/>
              <circle cx="118" cy="138" r="6"  fill="#e8c4b8" opacity="0.7"/>
              <ellipse cx="70"  cy="150" rx="9" ry="16" fill="#8a9e7a" opacity="0.4" transform="rotate(35 70 150)"/>
              <ellipse cx="95"  cy="155" rx="7" ry="12" fill="#b8c8a8" opacity="0.4" transform="rotate(-15 95 155)"/>
              <ellipse cx="130" cy="80"  rx="6" ry="11" fill="#8a9e7a" opacity="0.35" transform="rotate(50 130 80)"/>
            </svg>
          </div>

          <div className={styles.heroCard}>
            <p className={styles.heroTagline}>Please join us for<br />the Baptism of our daughter</p>
            <div className={styles.heroName}>Saiah</div>
            <div className={styles.heroSurname}>Alisbo</div>
            <div className={styles.dateBadge}>
              <div className={styles.dateLine} />
              <div className={styles.dateCenter}>
                <span className={styles.dateMonth}>APRIL</span>
                <span className={styles.dateDay}>19</span>
                <span className={styles.dateTime}>{eventTime}</span>
              </div>
              <div className={styles.dateLine} />
            </div>
            <div className={styles.dateDayRow}>
              <span>{eventDay}</span>
              <span className={styles.dateSep}>·</span>
              <span>{eventTime}</span>
            </div>
            <div className={styles.heroLocation}>{eventLocation}</div>
            <div className={styles.dressBadge}><span>👗</span> Attire: {dressCode}</div>
            <p className={styles.heroCta}><em>Please confirm your arrival below.<br />We hope to see you there!</em></p>
          </div>
        </section>

        {/* ── FORM / SUCCESS / DUPLICATE ── */}
        <section className={styles.formSection}>
          <div className={styles.formCard}>
            {step === 1 && (
              <>
                <div className={styles.cardHeader}>
                  <div className={styles.cardRose}>🌸</div>
                  <h2>Confirm Your Attendance</h2>
                  <p>Fill in your details and we&apos;ll send you a confirmation</p>
                </div>
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Your Full Name *</label>
                    <input className={styles.input} type="text"
                      placeholder="e.g. Maria Santos"
                      value={name} onChange={e => setName(e.target.value)}
                      required autoComplete="name" />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Your Gmail *</label>
                    <input className={styles.input} type="email"
                      placeholder="your@gmail.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      required autoComplete="email" inputMode="email" />
                    <span className={styles.hint}>✉ A confirmation will be sent to this email</span>
                  </div>
                  {error && <p className={styles.error}>{error}</p>}
                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Sending… 🌸' : 'Confirm My Attendance ✓'}
                  </button>
                </form>
              </>
            )}

            {step === 2 && (
              <div className={styles.success}>
                <div className={styles.successFloral}>🌸</div>
                <h2>See you there!</h2>
                <p className={styles.successMsg}>Thank you, <strong>{name}</strong>!<br />Your spot is confirmed.</p>
                <p className={styles.successEmail}>✉ Confirmation sent to <strong>{email}</strong></p>
                <div className={styles.successDetails}>
                  <p>📅 {eventDay}, {eventDate} · {eventTime}</p>
                  <p>📍 {eventLocation}</p>
                  <p className={styles.successDress}>👗 Wear: {dressCode}</p>
                </div>
                <button className={styles.submitBtnOutline} onClick={reset}>Register Someone Else</button>
              </div>
            )}

            {step === 3 && (
              <div className={styles.duplicate}>
                <div className={styles.dupIcon}>🌸</div>
                <h2>Already Registered!</h2>
                <p className={styles.dupMsg}>{dupMsg}</p>
                <p className={styles.dupSub}>If you think this is a mistake, please contact the host directly.</p>
                <button className={styles.submitBtnOutline} onClick={reset}>Try a Different Name</button>
              </div>
            )}
          </div>
        </section>

        <footer className={styles.footer}>
          <p>Made with love for <em>{eventBabyName}&apos;s Baptism</em> 🌸</p>
        </footer>
      </div>
    </>
  );
}
