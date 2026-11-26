"use client";
import { useEffect, useState, FormEvent } from "react";
import { T } from "@/lib/messages";
import type { Txt } from "@/lib/site";
import { applyCopy, imgSrc } from "@/lib/copy";
import type { Content } from "@/lib/content";

const OK: Record<string, string> = {
  pl: "Dziękujemy! Zgłoszenie zostało wysłane.",
  en: "Thank you! Your message has been sent.",
  fil: "Salamat! Naipadala na ang iyong mensahe.",
  ru: "Спасибо! Ваше сообщение отправлено.",
  id: "Terima kasih! Pesan Anda telah terkirim.",
};
const LANGS = [["pl", "Polski"], ["en", "English"], ["fil", "Filipino"], ["ru", "Русский"], ["id", "Indonesia"]];
const LOGO_SRC = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/H2K%20LOGO-o65O4jh5m8RHXUSmG2nKj3jaAUBArh.jpg";
type Mode = "apply" | "contact";
const L = (v: Txt | undefined, l: string) => (typeof v === "string" ? v : v?.[l as "pl"] ?? v?.pl ?? v?.en ?? "");
const JL: Record<string, Record<string, string>> = {
  pl: { loc: "Lokalizacja", pay: "Wynagrodzenie", hours: "Godziny", contract: "Umowa", housing: "Zakwaterowanie", transport: "Dojazd" },
  en: { loc: "Location", pay: "Salary", hours: "Working hours", contract: "Contract", housing: "Accommodation", transport: "Transport" },
  fil: { loc: "Lokasyon", pay: "Sahod", hours: "Oras ng trabaho", contract: "Kontrata", housing: "Tirahan", transport: "Transportasyon" },
  ru: { loc: "Место", pay: "Зарплата", hours: "Рабочее время", contract: "Договор", housing: "Жильё", transport: "Транспорт" },
  id: { loc: "Lokasi", pay: "Gaji", hours: "Jam kerja", contract: "Kontrak", housing: "Akomodasi", transport: "Transportasi" },
};

export default function Home({ content }: { content: Content }) {
  const site = content;
  const img = content.images;
  const [lang, setLang] = useState("pl");
  const [mode, setMode] = useState<Mode>("apply");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = applyCopy(T[lang], content.copy, lang);

  useEffect(() => { const h = location.hash.slice(1); if (T[h]) setLang(h); }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const pick = (l: string) => { setLang(l); history.replaceState(null, "", "#" + l); setMenuOpen(false); };
  const toForm = (m: Mode) => () => { setMode(m); setMsg(""); };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget, fd = new FormData(form);
    fd.set("mode", mode);
    const v = (k: string) => String(fd.get(k) ?? "").trim();
    setOk(false);
    if (!v("name") || !v("phone") || !v("message") || !v("email") || fd.get("consent") !== "on") return setMsg(t.eReq);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v("email"))) return setMsg(t.eMail);
    setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/contact", { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { setOk(true); setMsg(OK[lang]); form.reset(); }
      else setMsg(j.error === "file" ? t.eFile : j.error === "invalid" ? t.eReq : t.eSend);
    } catch { setMsg(t.eSend); }
    setBusy(false);
  }

  return (
    <>
      <div className="topline"><div className="wrap topline-inner"><span>{t.topline}</span>{site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}</div></div>
      <header className="site-header">
        <div className="wrap bar">
          <a className="logo" href="#top" aria-label={site.name + " - home"}><img className="logo-image" src={LOGO_SRC} alt="H2K sp. z o.o. logo" /></a>
          <button className="menu-toggle" type="button" aria-label={t.menu} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span></span><span></span><span></span></button>
          <nav className={menuOpen ? "nav-open" : ""}>
            <a href="#top" onClick={() => setMenuOpen(false)}>{t.home}</a>
            <a href="#jobs" onClick={() => setMenuOpen(false)}>{t.jobs}</a>
            <a href="#how" onClick={() => setMenuOpen(false)}>{t.how}</a>
            <a href="#why" onClick={() => setMenuOpen(false)}>{t.why}</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>{t.about}</a>
            <a href="#apply" className="nav-contact" onClick={() => { setMenuOpen(false); setMode("contact"); }}>{t.contact}</a>
          </nav>
          <select className="language" aria-label="Language" value={lang} onChange={(e) => pick(e.target.value)}>{LANGS.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-shape shape-one"></div><div className="hero-shape shape-two"></div>
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <div className="eyebrow eyebrow-light"><span className="eyebrow-dot"></span>{t.eyebrow}</div>
              <h1>{t.h1}</h1>
              <p className="hero-lead">{t.sub}</p>
              <div className="btns">
                <a className="btn btn-primary" href="#jobs">{t.view}<span aria-hidden="true">↗</span></a>
                <a className="btn btn-ghost" href="#apply" onClick={toForm("apply")}>{t.apply}</a>
              </div>
              <div className="hero-proof"><span className="proof-check">✓</span><span>{t.heroNote}</span></div>
            </div>
            <div className="hero-visual">
              <img className="hero-photo" src={imgSrc(img.hero, 1200) ?? "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85"} alt={img.hero?.alt || "Professionals working in a modern industrial environment"} />
              <div className="hero-photo-overlay"></div>
              <div className="hero-float-card"><span className="float-icon">✦</span><div><strong>{t.floatTitle}</strong><small>{t.floatText}</small></div></div>
              <div className="hero-caption"><span className="caption-line"></span>{t.photoCaption}</div>
            </div>
          </div>
          <div className="wrap hero-bottom"><span>{t.heroBottom}</span><a href="#how">{t.learnMore} <span aria-hidden="true">↓</span></a></div>
        </section>

        <section className="audience-section">
          <div className="wrap">
            <div className="section-heading heading-row"><div><div className="eyebrow">{t.eyebrowAudience}</div><h2>{t.audienceTitle}</h2></div><p>{t.audienceSub}</p></div>
            <div className="audience-grid">
              <article className="audience-card employee-card">
                <img src={imgSrc(img.worker, 1000) ?? "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=85"} alt={img.worker?.alt || "Professional at work"} loading="lazy" />
                <div className="audience-shade"></div><div className="audience-content"><span className="card-kicker">01 / {t.forWorkers}</span><h3>{t.workerTitle}</h3><p>{t.workerText}</p><a className="circle-link" href="#jobs" aria-label={t.view}><span>↗</span></a></div>
              </article>
              <article className="audience-card employer-card">
                <img src={imgSrc(img.employer, 1000) ?? "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=85"} alt={img.employer?.alt || "A professional team collaborating"} loading="lazy" />
                <div className="audience-shade"></div><div className="audience-content"><span className="card-kicker">02 / {t.forEmployers}</span><h3>{t.employerTitle}</h3><p>{t.employerText}</p><a className="circle-link" href="#apply" onClick={toForm("contact")} aria-label={t.contact}><span>↗</span></a></div>
              </article>
            </div>
          </div>
        </section>

        <section className="trust-strip" id="about">
          <div className="wrap trust-grid">
            <div className="trust-intro"><span className="eyebrow eyebrow-light">{t.aboutLabel}</span><h2>{t.aboutTitle}</h2><p>{t.aboutText}</p></div>
            <div className="trust-points">
              <div className="trust-point"><span className="trust-symbol">◎</span><div><strong>{t.trust1Title}</strong><small>{t.trust1Text}</small></div></div>
              <div className="trust-point"><span className="trust-symbol">↗</span><div><strong>{t.trust2Title}</strong><small>{t.trust2Text}</small></div></div>
              <div className="trust-point"><span className="trust-symbol">✳</span><div><strong>{t.trust3Title}</strong><small>{t.trust3Text}</small></div></div>
            </div>
          </div>
        </section>

        <section className="jobs-section" id="jobs">
          <div className="wrap">
            <div className="section-heading heading-row"><div><div className="eyebrow">{t.jobsLabel}</div><h2>{t.jobsTitle}</h2></div><p>{t.jobsSub}</p></div>
            {site.jobs.length === 0 ? <div className="jobs-empty"><div className="empty-icon">⌕</div><div><strong>{t.emptyTitle}</strong><p>{t.empty}</p></div><a className="btn btn-dark" href="#apply" onClick={toForm("apply")}>{t.sendCv}<span aria-hidden="true">↗</span></a></div> :
              <div className="jobs-grid">{site.jobs.map((j, i) => <article className="job-card" key={j.id}><div className="job-number">{String(i + 1).padStart(2, "0")}</div><div className="job-content"><div className="job-tag">{t.openPosition}</div><h3>{L(j.title, lang)}</h3>{j.description && <p className="job-desc">{L(j.description, lang)}</p>}<div className="job-meta">{(["loc", "pay", "hours", "contract", "housing", "transport"] as const).map((k) => j[k] ? <span key={k}><b>{JL[lang][k]}</b>{L(j[k], lang)}</span> : null)}</div></div><a className="job-apply" href="#apply" onClick={toForm("apply")}>{t.apply}<span>↗</span></a></article>)}</div>}
          </div>
        </section>

        <section className="process-section" id="how">
          <div className="wrap">
            <div className="section-heading process-heading"><div className="eyebrow">{t.processLabel}</div><h2>{t.howTitle}</h2><p>{t.howSub}</p></div>
            <div className="process-grid">{t.steps.map((x: string, i: number) => <article className="process-step" key={x}><span className="step-num">0{i + 1}</span><div className="step-rule"></div><h3>{x}</h3><p>{t.stepTexts[i]}</p></article>)}</div>
            <div className="process-cta"><span>{t.processCta}</span><a href="#apply" onClick={toForm("apply")}>{t.apply}<span>↗</span></a></div>
          </div>
        </section>

        <section className="why-section" id="why">
          <div className="wrap why-grid">
            <div className="why-visual"><img src={imgSrc(img.why, 1000) ?? "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1000&q=85"} alt={img.why?.alt || "Business partners shaking hands"} loading="lazy" /><div className="why-badge"><strong>5</strong><span>{t.languagesLabel}</span></div></div>
            <div className="why-copy"><div className="eyebrow">{t.whyLabel}</div><h2>{t.whyTitle}</h2><p className="why-intro">{t.whySub}</p><div className="benefits">{t.whyL.map((x: string, i: number) => <div className="benefit" key={x}><span className="benefit-icon">{["✓", "＋", "◎"][i]}</span><span>{x}</span></div>)}</div><a className="text-link" href="#apply" onClick={toForm("contact")}>{t.talkToUs}<span>↗</span></a></div>
          </div>
        </section>

        <section className="cta-band"><div className="wrap cta-band-inner"><div><div className="eyebrow eyebrow-light">{t.ctaLabel}</div><h2>{t.cvcta}</h2><p>{t.ctaText}</p></div><a className="btn btn-white" href="#apply" onClick={toForm("apply")}>{t.sendCv}<span>↗</span></a></div></section>

        <section className="faq-section" id="faq">
          <div className="wrap faq-grid"><div><div className="eyebrow">{t.faqLabel}</div><h2>{t.faqTitle}</h2><p>{t.faqSub}</p><a className="text-link" href="#apply" onClick={toForm("contact")}>{t.askQuestion}<span>↗</span></a></div><div className="faq-list">{t.faq.map((q: string, i: number) => <details key={q}><summary><span>{q}</span><b>+</b></summary><p>{t.faqa[i]}</p></details>)}</div></div>
        </section>

        <section className="contact-section" id="apply">
          <div className="wrap contact-grid">
            <div className="contact-copy"><div className="eyebrow eyebrow-light">{t.contactLabel}</div><h2>{t.contactTitle}</h2><p>{t.contactSub}</p>{site.email && <div className="contact-method"><span className="contact-icon">✉</span><div><small>{t.emailUs}</small><a href={`mailto:${site.email}`}>{site.email}</a></div></div>}{site.phone && <div className="contact-method"><span className="contact-icon">⌕</span><div><small>{t.callUs}</small><a href={`tel:${site.phone}`}>{site.phone}</a></div></div>}
            </div>
            <div className="form-panel"><div className="tabs" role="tablist"><button type="button" role="tab" className="tab" aria-selected={mode === "apply"} onClick={toForm("apply")}>{t.tabA}</button><button type="button" role="tab" className="tab" aria-selected={mode === "contact"} onClick={toForm("contact")}>{t.tabC}</button></div>
              <form onSubmit={submit} noValidate>
                <div className="form-row"><label><span>{t.name} *</span><input name="name" autoComplete="name" required placeholder={t.namePlaceholder} /></label><label><span>{t.email} *</span><input name="email" type="email" autoComplete="email" required placeholder="name@example.com" /></label></div>
                <div className="form-row"><label><span>{t.phone} *</span><input name="phone" type="tel" autoComplete="tel" required placeholder={t.phonePlaceholder} /></label>{mode === "apply" ? <label><span>{t.role}</span><input name="role" placeholder={t.rolePlaceholder} /></label> : <label><span>{t.subject}</span><input name="subject" placeholder={t.subjectPlaceholder} /></label>}</div>
                <label><span>{t.message} *</span><textarea name="message" rows={4} required placeholder={t.messagePlaceholder} /></label>
                {mode === "apply" && <label className="file-label"><span>{t.cv}</span><input name="cv" type="file" accept=".pdf,.docx" /><small>{t.fileHint}</small></label>}
                <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="honeypot" />
                <label className="chk"><input type="checkbox" name="consent" required /><span>{t.consent}</span></label>
                {msg && <div className={ok ? "msg success" : "msg"} role="alert">{msg}</div>}
                <button className="btn btn-primary submit-btn" type="submit" disabled={busy}>{busy ? t.sending : t.send}<span>↗</span></button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer"><div className="wrap footer-main"><div className="footer-brand"><a className="logo logo-footer" href="#top" aria-label={site.name + " - home"}><img className="logo-image" src={LOGO_SRC} alt="H2K sp. z o.o. logo" /></a><p>{t.footerText}</p></div><div className="footer-links"><strong>{t.quickLinks}</strong><a href="#jobs">{t.jobs}</a><a href="#how">{t.how}</a><a href="#why">{t.why}</a><a href="#faq">FAQ</a></div><div className="footer-links"><strong>{t.contact}</strong>{site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}{site.phone && <a href={`tel:${site.phone}`}>{site.phone}</a>}{site.address && <span>{site.address}</span>}</div></div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} {site.name}. {t.rights}</span><span>{[site.nip && "NIP " + site.nip, site.krs && "KRS " + site.krs, site.regon && "REGON " + site.regon].filter(Boolean).join(" · ")}</span><span>{t.priv}</span></div></footer>
    </>
  );
}
