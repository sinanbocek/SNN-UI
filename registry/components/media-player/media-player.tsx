"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "../button/button";
import { motionTokens } from "../lib/motion-tokens";
import { FramedPhoto, useAnnouncer } from "../lib/shop-parts";
import { useReducedMotionSafe } from "../lib/viz-utils";
import { afterEnd, clock, clockPair, muteLabel, neighbour, playLabel, volumeText, type Track } from "./media-player-format";
import styles from "./media-player.module.css";

export type { Track };

/** Küçük bir ses koleksiyonu (podcast, örnek paketi, çalma listesi) için tam oynatıcı: kapak, parça adı, ilerleme çubuğu, oynat/duraklat, önceki/sonraki, ses ve sessiz, çalma listesi. Ses dosyalarını uygulama verir (bileşen içinde gerçek ses gömülmez). Yazıyla eşzamanlı döküm, ses kaydı, mini "şimdi çalıyor" penceresi, video ve akış sunucusu kapsam dışıdır. */
export interface MediaPlayerProps {
  tracks: Track[];
  defaultIndex?: number | undefined;
  defaultVolume?: number | undefined;
  /** Çalan parça değişince çağrılır. */
  onTrackChange?: ((track: Track, index: number) => void) | undefined;
}

const icon = (path: string) => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d={path} /></svg>;
const PLAY = "M8 5v14l11-7z", PAUSE = "M7 5h4v14H7zM13 5h4v14h-4z", PREV = "M7 6h2v12H7zM20 6v12L10 12z", NEXT = "M15 6h2v12h-2zM4 6l10 6L4 18z";

export function MediaPlayer({ tracks, defaultIndex = 0, defaultVolume = .7, onTrackChange }: MediaPlayerProps) {
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const audio = useRef<HTMLAudioElement>(null);
  const wantPlay = useRef(false);
  const [index, setIndex] = useState(Math.min(defaultIndex, tracks.length - 1));
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(tracks[index]?.duration ?? 0);
  const [volume, setVolume] = useState(defaultVolume);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [live, announce] = useAnnouncer();
  const track = tracks[index];

  useEffect(() => { if (audio.current) { audio.current.volume = volume; audio.current.muted = muted; } }, [volume, muted]);
  useEffect(() => {
    setPosition(0); setDuration(track?.duration ?? 0); setError(false); setLoading(true);
    const node = audio.current;
    if (!node || !track) return;
    node.load();
    if (wantPlay.current) void node.play().catch(() => setPlaying(false));
  }, [track?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!track) return null;
  const switchTo = (next: number, play = true) => {
    if (next === index) return;
    wantPlay.current = play;
    setIndex(next);
    onTrackChange?.(tracks[next]!, next);
    announce(`${tracks[next]!.title} çalıyor.`);
  };
  const toggle = async () => {
    const node = audio.current;
    if (!node) return;
    if (node.paused) { wantPlay.current = true; try { await node.play(); } catch { setError(true); setPlaying(false); } }
    else { wantPlay.current = false; node.pause(); }
  };
  const retry = () => { setError(false); setLoading(true); audio.current?.load(); if (wantPlay.current) void audio.current?.play().catch(() => setError(true)); };
  const seek = (value: number) => { if (audio.current) audio.current.currentTime = value; setPosition(value); };
  const swap = reduced ? { duration: 0 } : { duration: motionTokens.duration.standard };
  const single = tracks.length < 2;

  return <section className={styles.root} aria-label="Ses oynatıcı" data-reduced={reduced || undefined}>
    <audio ref={audio} src={track.src} preload="metadata"
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={event => setPosition(event.currentTarget.currentTime)}
      onLoadedMetadata={event => { setDuration(event.currentTarget.duration); setLoading(false); }} onCanPlay={() => setLoading(false)} onError={() => { setError(true); setLoading(false); setPlaying(false); }}
      onEnded={() => { const next = afterEnd(index, tracks.length); if (next === null) { setPlaying(false); wantPlay.current = false; } else switchTo(next, true); }} />
    <div className={styles.now}>
      <div className={styles.cover}>
        <AnimatePresence mode="popLayout" initial={false}><motion.div key={track.id} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={swap}>
          <FramedPhoto src={track.cover} alt="" ratio="1 / 1" tone={track.tone ?? 0} initial={Array.from(track.title.trim())[0]} eager className={styles.coverImg} />
        </motion.div></AnimatePresence>
      </div>
      <div className={styles.meta}>
        <AnimatePresence mode="popLayout" initial={false}><motion.div key={track.id} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={swap}>
          <h3 className={styles.title}>{track.title}</h3>{track.subtitle && <p className={styles.subtitle}>{track.subtitle}</p>}
        </motion.div></AnimatePresence>
        <div className={styles.scrub}>
          <input type="range" style={{ ["--fill" as string]: `${duration ? Math.min(100, position / duration * 100) : 0}%` }} min={0} max={duration || 0} step={.1} value={Math.min(position, duration || 0)} disabled={!duration || error} aria-label="İlerleme" aria-valuetext={clockPair(position, duration)} onChange={event => seek(Number(event.target.value))} />
          <span className={styles.time} aria-hidden="true">{clockPair(position, duration)}</span>
        </div>
        <div className={styles.controls}>
          <button type="button" className={styles.round} aria-label="Önceki parça" disabled={single || index === 0} onClick={() => switchTo(neighbour(index, "prev", tracks.length), playing)}>{icon(PREV)}</button>
          <button type="button" className={styles.play} aria-label={playing ? "Duraklat" : "Oynat"} aria-busy={loading || undefined} disabled={error} onClick={toggle}>
            <AnimatePresence mode="wait" initial={false}><motion.span key={playing ? "pause" : "play"} initial={reduced ? false : { opacity: 0, scale: .6, filter: "blur(2px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, scale: .6 }} transition={{ duration: reduced ? 0 : motionTokens.duration.fast }}>{icon(playing ? PAUSE : PLAY)}</motion.span></AnimatePresence>
          </button>
          <button type="button" className={styles.round} aria-label="Sonraki parça" disabled={single || index === tracks.length - 1} onClick={() => switchTo(neighbour(index, "next", tracks.length), playing)}>{icon(NEXT)}</button>
          <div className={styles.volume}>
            <button type="button" className={styles.round} aria-label={muteLabel(muted || volume === 0)} aria-pressed={muted || volume === 0} onClick={() => setMuted(!muted)}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" />{muted || volume === 0 ? <path d="M17 9l4 6M21 9l-4 6" /> : <path d="M17 8a5 5 0 0 1 0 8" />}</svg>
            </button>
            <input type="range" style={{ ["--fill" as string]: `${(muted ? 0 : volume) * 100}%` }} min={0} max={1} step={.01} value={muted ? 0 : volume} aria-label="Ses düzeyi" aria-valuetext={volumeText(muted ? 0 : volume)} onChange={event => { setVolume(Number(event.target.value)); setMuted(false); }} />
          </div>
        </div>
        {error && <p className={styles.error} role="alert">Ses dosyası açılamadı. <Button size="sm" variant="ghost" onClick={retry}>Tekrar dene</Button></p>}
      </div>
    </div>
    {!single && <ul className={styles.list} aria-label="Çalma listesi">{tracks.map((item, at) => {
      const current = at === index;
      return <li key={item.id} className={styles.item}>
        {current && <motion.span layoutId={`${uid}-marker`} className={styles.marker} aria-hidden="true" transition={reduced ? { duration: 0 } : motionTokens.spring.snappy} />}
        <button type="button" className={styles.row} aria-current={current || undefined} aria-label={`${playLabel(item.title)}${item.duration ? `, ${clock(item.duration)}` : ""}`} onClick={() => switchTo(at, true)}>
          <span className={styles.bars} data-playing={(current && playing) || undefined} aria-hidden="true"><i /><i /><i /></span>
          <span className={styles.rowTitle}>{item.title}</span><span className={styles.rowTime}>{item.duration ? clock(item.duration) : ""}</span>
        </button>
      </li>;
    })}</ul>}
    {live}
  </section>;
}

export default MediaPlayer;
