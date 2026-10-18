"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { text } from "@snn/abacus-core";
import { motionTokens } from "../lib/motion-tokens";
import { Breadcrumb } from "../breadcrumb/breadcrumb";
import { Button } from "../button/button";
import { EmptyState } from "../empty-state/empty-state";
import { SearchField } from "../search-field/search-field";
import { Skeleton } from "../skeleton/skeleton";
import { Textarea } from "../textarea/textarea";
import styles from "./help-center.module.css";

export interface HelpTopic { id: string; title: string; description: string; /** Süstür; kart adıyla okunur, simge okunmaz. */ icon?: ReactNode | undefined }

export interface HelpSection {
  id: string;
  heading: string;
  paragraphs?: string[] | undefined;
  /** Numaralı adım listesi. */
  steps?: string[] | undefined;
  /** Zengin içerik (görsel, bağlantı). Aramaya girmez; aranacak metin `paragraphs` ve `steps` içindedir. */
  content?: ReactNode | undefined;
}

export interface HelpArticle {
  id: string;
  topicId: string;
  title: string;
  summary?: string | undefined;
  /** Güncellenme tarihi, hazır metin (proje ABACUS `date.format` ile üretir). */
  updatedAt?: string | undefined;
  readMinutes?: number | undefined;
  sections: HelpSection[];
  /** İlgili makalelerin `id`'leri. */
  related?: string[] | undefined;
  /** "En çok okunanlar" listesine girer. */
  popular?: boolean | undefined;
}

export interface HelpCenterProps {
  topics: HelpTopic[];
  articles: HelpArticle[];
  brandName?: string | undefined;
  /** Arama kutusunun altındaki hızlı arama kelimeleri ("Örneğin:"). */
  quickSearches?: string[] | undefined;
  /** Açılışta gösterilecek makale (derin bağlantı). Bulunamazsa "Bu makale bulunamadı" çıkar. */
  defaultArticleId?: string | undefined;
  /** Görünüm değişince haber verir (adres çubuğunu güncellemek için). */
  onNavigate?: ((state: { topicId: string | null; articleId: string | null }) => void) | undefined;
  /** "Destekle iletişime geç". Reddedilirse hata yazılır. */
  onContact?: (() => void | Promise<void>) | undefined;
  /** "Bu makale işinize yaradı mı?" yanıtı. */
  onFeedback?: ((articleId: string, helpful: boolean, comment?: string) => void | Promise<void>) | undefined;
  loading?: boolean | undefined;
  /** İçerik yüklenemediyse true; iletişim kartı yine görünür. */
  error?: boolean | undefined;
  onRetry?: (() => void) | undefined;
  className?: string | undefined;
}

/** Eşleşen kelimeleri `<mark>` ile sarar. Harf katlaması karakter karakter yapılır; vurgu özgün metnin doğru yerine düşer. Vurgu kalın ve alt çizgilidir, yalnız renk değildir. */
function Highlight({ value, query }: { value: string; query: string }): ReactNode {
  const tokens = text.searchKey(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return value;
  let folded = "";
  const origin: number[] = [];
  const chars = Array.from(value);
  chars.forEach((char, index) => {
    const piece = /\s/.test(char) ? " " : text.searchKey(char);
    for (const unit of piece) { folded += unit; origin.push(index); }
  });
  const marked = new Set<number>();
  for (const token of tokens) {
    let from = folded.indexOf(token);
    while (from >= 0) {
      for (let at = from; at < from + token.length; at += 1) { const source = origin[at]; if (source !== undefined) marked.add(source); }
      from = folded.indexOf(token, from + 1);
    }
  }
  const parts: ReactNode[] = [];
  let run = "";
  let runMarked = false;
  const flush = () => { if (run) parts.push(runMarked ? <mark key={parts.length} className={styles.mark}>{run}</mark> : run); run = ""; };
  chars.forEach((char, index) => { const on = marked.has(index); if (on !== runMarked) { flush(); runMarked = on; } run += char; });
  flush();
  return <>{parts}</>;
}

const plain = (article: HelpArticle) => [article.title, article.summary, ...article.sections.flatMap(section => [section.heading, ...(section.paragraphs ?? []), ...(section.steps ?? [])])].filter(Boolean).join(" ");

/** Büyük ya da dar arama kutusu. Birleşik kutudur: ok tuşlarında odak kutuda kalır, etkin sonuç bildirilir. Sonuçlar kutunun altında liste olarak açılır. */
function HelpSearch({ articles, topics, compact, quickSearches, onOpen, announce }: {
  articles: HelpArticle[]; topics: HelpTopic[]; compact?: boolean | undefined; quickSearches?: string[] | undefined; onOpen: (article: HelpArticle) => void; announce: (message: string) => void;
}) {
  const uid = useId();
  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [index, setIndex] = useState(-1);
  const key = text.searchKey(value.trim());

  // Tüm kelimeler eşleşmeli; başlıkta eşleşen sonuç önce gelir.
  const hits = useMemo(() => {
    if (!key) return [];
    const tokens = key.split(" ");
    return articles
      .filter(article => { const haystack = text.searchKey(plain(article)); return tokens.every(token => haystack.includes(token)); })
      .map(article => ({ article, inTitle: tokens.every(token => text.searchKey(article.title).includes(token)) }))
      .sort((a, b) => Number(b.inTitle) - Number(a.inTitle))
      .slice(0, 8)
      .map(hit => hit.article);
  }, [articles, key]);

  useEffect(() => { setIndex(-1); if (key) announce(hits.length ? `${hits.length} sonuç` : "Sonuç bulunamadı"); }, [key, hits.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const topicName = (article: HelpArticle) => topics.find(topic => topic.id === article.topicId)?.title ?? "";
  const open = key.length > 0;

  function choose(article: HelpArticle) { setValue(""); onOpen(article); }

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!hits.length) return;
      event.preventDefault();
      setIndex(current => (current + (event.key === "ArrowDown" ? 1 : -1) + hits.length) % hits.length);
    } else if (event.key === "Enter") {
      const hit = hits[index] ?? (hits.length === 1 ? hits[0] : undefined);
      if (hit) { event.preventDefault(); choose(hit); }
    } else if (event.key === "Escape") {
      // Önce arama temizlenir, sonra kutudan çıkılır.
      if (value) { event.preventDefault(); setValue(""); } else inputRef.current?.blur();
    }
  }

  return (
    <div className={styles.search} data-compact={compact ? "true" : undefined}>
      <SearchField
        ref={inputRef} label="Yardım makalelerinde ara" placeholder="Yardım makalelerinde ara" value={value} onValueChange={setValue} onKeyDown={onKeyDown} autoComplete="off"
        role="combobox" aria-expanded={open && hits.length > 0} aria-controls={`${uid}-list`} aria-autocomplete="list" aria-activedescendant={open && index >= 0 ? `${uid}-hit-${index}` : undefined}
      />
      {!compact && quickSearches && quickSearches.length > 0 && (
        <div className={styles.quick}><span>Örneğin:</span>{quickSearches.slice(0, 3).map(word => <button key={word} type="button" onClick={() => { setValue(word); inputRef.current?.focus(); }}>{word}</button>)}</div>
      )}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="results" className={styles.popup} initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .98, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: motionTokens.duration.instant } }}
            transition={{ duration: reduced ? motionTokens.duration.instant : motionTokens.duration.fast }}
          >
            {hits.length > 0 ? (
              <ul id={`${uid}-list`} role="listbox" aria-label="Arama sonuçları" className={styles.hits}>
                {hits.map((article, position) => (
                  <li key={article.id} id={`${uid}-hit-${position}`} role="option" aria-selected={position === index} className={styles.hit} data-active={position === index ? "true" : undefined} onMouseDown={event => event.preventDefault()} onClick={() => choose(article)}>
                    <span className={styles.hitTitle}><Highlight value={article.title} query={value} /></span>
                    {article.summary && <span className={styles.hitSummary}><Highlight value={article.summary} query={value} /></span>}
                    <span className={styles.hitTopic}>{topicName(article)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div id={`${uid}-list`} className={styles.noHit}>
                <strong>Sonuç bulunamadı</strong>
                <span>Farklı kelimelerle deneyin ya da konulara göz atın.</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Evet/Hayır oyu; Hayır'da kısa açıklama kutusu açılır. Sonuç duyurulur. */
function Feedback({ articleId, onFeedback, announce }: { articleId: string; onFeedback?: HelpCenterProps["onFeedback"] | undefined; announce: (message: string) => void }) {
  const [phase, setPhase] = useState<"ask" | "comment" | "sending" | "done">("ask");
  const [comment, setComment] = useState("");
  const [failed, setFailed] = useState(false);
  async function send(helpful: boolean, note?: string) {
    setPhase("sending"); setFailed(false);
    try { await onFeedback?.(articleId, helpful, note); setPhase("done"); announce("Geri bildiriminiz için teşekkürler."); }
    catch { setFailed(true); setPhase(helpful ? "ask" : "comment"); }
  }
  return (
    <section className={styles.feedback} aria-labelledby={`${articleId}-fb`}>
      {phase === "done" ? <p className={styles.thanks}>Geri bildiriminiz için teşekkürler.</p> : (
        <>
          <h2 id={`${articleId}-fb`} className={styles.feedbackTitle}>Bu makale işinize yaradı mı?</h2>
          {phase === "comment" || (phase === "sending" && comment !== "") ? (
            <div className={styles.comment}>
              <Textarea label="Neyi eksik buldunuz?" value={comment} onChange={event => setComment(event.target.value)} />
              <Button onClick={() => void send(false, comment.trim() || undefined)} loading={phase === "sending"}>Gönder</Button>
            </div>
          ) : (
            <div className={styles.vote}><Button variant="secondary" onClick={() => void send(true)} loading={phase === "sending"}>Evet</Button><Button variant="secondary" onClick={() => setPhase("comment")}>Hayır</Button></div>
          )}
          {failed && <p className={styles.failed} role="alert">Gönderilemedi. Yeniden deneyin.</p>}
        </>
      )}
    </section>
  );
}

/** Yardım merkezi: büyük arama kutusu, konu kartları, çok okunanlar, makale okuma görünümü ("bu sayfada" ana hattı, geri bildirim, ilgili makaleler) ve destek kartı.
 *  Görünümler derine giderken sağa, geri dönerken sola kayar; "hareketi azalt" açıkken yalnız solar. */
export function HelpCenter({
  topics, articles, brandName = "Yardım Merkezi", quickSearches, defaultArticleId, onNavigate, onContact, onFeedback, loading = false, error = false, onRetry, className,
}: HelpCenterProps) {
  const uid = useId();
  const reduced = useReducedMotion();
  const initial = defaultArticleId ? articles.find(article => article.id === defaultArticleId) : undefined;
  const [articleId, setArticleId] = useState<string | null>(defaultArticleId ?? null);
  const [topicId, setTopicId] = useState<string | null>(initial?.topicId ?? null);
  const [note, setNote] = useState("");
  const [contact, setContact] = useState<"idle" | "sending" | "done" | "failed">("idle");
  const [section, setSection] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const headings = useRef<Record<string, HTMLElement | null>>({});
  const direction = useRef(1);

  const article = articleId ? articles.find(item => item.id === articleId) : undefined;
  const topic = topics.find(item => item.id === (article?.topicId ?? topicId));
  const depth = articleId ? 2 : topicId ? 1 : 0;
  const lastDepth = useRef(depth);
  if (lastDepth.current !== depth) { direction.current = depth > lastDepth.current ? 1 : -1; lastDepth.current = depth; }

  function go(next: { topicId: string | null; articleId: string | null }) {
    setTopicId(next.topicId); setArticleId(next.articleId);
    scroller.current?.scrollTo({ top: 0 });
    onNavigate?.(next);
  }
  const openArticle = (item: HelpArticle) => go({ topicId: item.topicId, articleId: item.id });

  // Okunan bölüm ana hatta işaretlenir.
  function onScroll() {
    if (!article || !scroller.current) return;
    const top = scroller.current.getBoundingClientRect().top + 96;
    let current = article.sections[0]?.id ?? "";
    for (const item of article.sections) { const node = headings.current[item.id]; if (node && node.getBoundingClientRect().top <= top) current = item.id; }
    setSection(current);
  }
  useEffect(() => { setSection(article?.sections[0]?.id ?? ""); }, [articleId]); // eslint-disable-line react-hooks/exhaustive-deps

  function jump(id: string) {
    const node = headings.current[id];
    if (!node || !scroller.current) return;
    const top = node.getBoundingClientRect().top - scroller.current.getBoundingClientRect().top + scroller.current.scrollTop - 24;
    scroller.current.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    node.focus({ preventScroll: true });
    setSection(id);
  }

  async function contactSupport() {
    setContact("sending");
    try { await onContact?.(); setContact("done"); setNote("İsteğiniz iletildi."); } catch { setContact("failed"); }
  }

  const slide = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: motionTokens.duration.instant } }
    : { initial: { opacity: 0, x: 24 * direction.current }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 * direction.current }, transition: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] as [number, number, number, number] } };

  const popular = articles.filter(item => item.popular);
  const countIn = (id: string) => articles.filter(item => item.topicId === id).length;
  const crumbs = [
    { label: "Yardım", onClick: () => go({ topicId: null, articleId: null }) },
    ...(topic ? [{ label: topic.title, onClick: () => go({ topicId: topic.id, articleId: null }) }] : []),
    ...(article ? [{ label: article.title }] : []),
  ];
  const contactCard = (
    <section className={styles.contact} aria-labelledby={`${uid}-help-contact`}>
      <div><h2 id={`${uid}-help-contact`} className={styles.cardTitle}>Aradığınızı bulamadınız mı?</h2></div>
      {contact === "done" ? <p className={styles.thanks}>İsteğiniz iletildi.</p> : <Button variant="secondary" onClick={() => void contactSupport()} loading={contact === "sending"}>Destekle iletişime geç</Button>}
      {contact === "failed" && <p className={styles.failed} role="alert">İstek gönderilemedi. Yeniden deneyin.</p>}
    </section>
  );

  let view: ReactNode;
  let viewKey: string;
  if (articleId && !article) {
    viewKey = "missing";
    view = <EmptyState title="Bu makale bulunamadı" description="Bağlantı eski ya da hatalı olabilir." action={<Button variant="secondary" onClick={() => go({ topicId: null, articleId: null })}>Ana ekrana dön</Button>} />;
  } else if (article) {
    viewKey = `article-${article.id}`;
    view = (
      <div className={styles.read}>
        <article className={styles.article}>
          <h1 className={styles.articleTitle}>{article.title}</h1>
          <p className={styles.metaLine}>{[article.updatedAt && `Güncellendi: ${article.updatedAt}`, article.readMinutes !== undefined && `${article.readMinutes} dk okuma`].filter(Boolean).join(" · ")}</p>
          {article.summary && <p className={styles.lead}>{article.summary}</p>}
          {article.sections.map(item => (
            <section key={item.id} className={styles.block}>
              <h2 ref={node => { headings.current[item.id] = node; }} id={`${article.id}-${item.id}`} tabIndex={-1} className={styles.heading}>{item.heading}</h2>
              {item.paragraphs?.map((paragraph, position) => <p key={position}>{paragraph}</p>)}
              {item.steps && <ol className={styles.steps}>{item.steps.map((step, position) => <li key={position}>{step}</li>)}</ol>}
              {item.content}
            </section>
          ))}
          <Feedback key={article.id} articleId={article.id} onFeedback={onFeedback} announce={setNote} />
          {article.related && article.related.length > 0 && (
            <section aria-labelledby={`${article.id}-rel`}>
              <h2 id={`${article.id}-rel`} className={styles.cardTitle}>İlgili makaleler</h2>
              <ul className={styles.list}>
                {article.related.map(id => articles.find(item => item.id === id)).filter((item): item is HelpArticle => !!item).map(item => <li key={item.id}><button type="button" className={styles.link} onClick={() => openArticle(item)}>{item.title}</button></li>)}
              </ul>
            </section>
          )}
        </article>
        <nav className={styles.outline} aria-label="Bu sayfada">
          <h2 className={styles.outlineTitle}>Bu sayfada</h2>
          <ul>{article.sections.map(item => <li key={item.id}><button type="button" aria-current={section === item.id ? "location" : undefined} onClick={() => jump(item.id)}>{item.heading}</button></li>)}</ul>
        </nav>
      </div>
    );
  } else if (topic) {
    viewKey = `topic-${topic.id}`;
    const list = articles.filter(item => item.topicId === topic.id);
    view = (
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>{topic.title}</h1>
        <p className={styles.lead}>{topic.description}</p>
        {list.length === 0 ? <EmptyState title="Bu konuda makale yok" description="Başka bir konuya göz atın." /> : (
          <ul className={styles.list}>{list.map(item => <li key={item.id}><button type="button" className={styles.link} onClick={() => openArticle(item)}><span>{item.title}</span>{item.summary && <small>{item.summary}</small>}</button></li>)}</ul>
        )}
        {contactCard}
      </div>
    );
  } else {
    viewKey = "home";
    view = (
      <div className={styles.page}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Aklınızdaki soru ne?</h1>
          <HelpSearch articles={articles} topics={topics} quickSearches={quickSearches} onOpen={openArticle} announce={setNote} />
        </div>
        {error ? (
          <EmptyState title="Yardım içeriği yüklenemedi" description="Bağlantınızı kontrol edip yeniden deneyin." action={onRetry ? <Button variant="secondary" onClick={onRetry}>Yeniden dene</Button> : undefined} />
        ) : loading ? (
          <div className={styles.skeletons}><Skeleton label="Konular yükleniyor" lines={3} /><Skeleton label="Makaleler yükleniyor" lines={3} /></div>
        ) : (
          <>
            <section aria-labelledby={`${uid}-help-topics`}>
              <h2 id={`${uid}-help-topics`} className={styles.cardTitle}>Konulara göz atın</h2>
              <ul className={styles.topics}>
                {topics.map(item => (
                  <li key={item.id}>
                    <button type="button" className={styles.topic} onClick={() => go({ topicId: item.id, articleId: null })}>
                      {item.icon && <span className={styles.topicIcon} aria-hidden="true">{item.icon}</span>}
                      <span className={styles.topicName}>{item.title}</span>
                      <span className={styles.topicText}>{item.description}</span>
                      <span className={styles.topicCount}>{`${countIn(item.id)} makale`}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
            {popular.length > 0 && (
              <section aria-labelledby={`${uid}-help-popular`}>
                <h2 id={`${uid}-help-popular`} className={styles.cardTitle}>En çok okunanlar</h2>
                <ul className={styles.list}>{popular.map(item => <li key={item.id}><button type="button" className={styles.link} onClick={() => openArticle(item)}><span>{item.title}</span><small>{topics.find(entry => entry.id === item.topicId)?.title}</small></button></li>)}</ul>
              </section>
            )}
          </>
        )}
        {contactCard}
      </div>
    );
  }

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.status} role="status" aria-live="polite">{note}</div>
      <header className={styles.top}>
        <span className={styles.brand}>{brandName}</span>
        {depth > 0 && <Breadcrumb items={crumbs} />}
        {depth > 0 && <div className={styles.topSearch}><HelpSearch articles={articles} topics={topics} compact onOpen={openArticle} announce={setNote} /></div>}
      </header>
      <div ref={scroller} className={styles.scroller} onScroll={onScroll}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={viewKey} {...slide}>{view}</motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default HelpCenter;
