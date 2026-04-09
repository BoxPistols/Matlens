import { useState, useEffect, useRef, useCallback } from 'react';
import * as use from '@tensorflow-models/universal-sentence-encoder';

export function useEmbedding(db) {
  const [model, setModel] = useState(null);
  const [embeddings, setEmbeddings] = useState({});
  const [status, setStatus] = useState('idle');
  const modelRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    (async () => {
      try {
        const m = await use.load();
        if (cancelled) return;
        modelRef.current = m;
        setModel(m);
        setStatus('indexing');
        await buildIndex(m, db, cancelled, setEmbeddings);
        if (!cancelled) setStatus('ready');
      } catch (e) {
        if (!cancelled) setStatus('fallback');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function buildIndex(m, records, cancelled, setter) {
    const texts = records.map(r =>
      `${r.name} ${r.cat} ${r.comp} 硬度${r.hv}HV 引張${r.ts}MPa ${r.memo}`.trim()
    );
    const emb = await m.embed(texts);
    const arr = await emb.array();
    emb.dispose();
    if (cancelled) return;
    const map = {};
    records.forEach((r, i) => { map[r.id] = arr[i]; });
    setter(map);
  }

  const cosineSim = (a, b) => {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-10);
  };

  const search = useCallback(async (query, topK = 5) => {
    if (!modelRef.current) {
      const q = query.toLowerCase();
      return db
        .map(r => ({ ...r, score: [...q.split(' ')].filter(w => w.length > 1 && `${r.name} ${r.comp} ${r.memo}`.toLowerCase().includes(w)).length / q.split(' ').length * 0.8 + Math.random() * 0.05 }))
        .sort((a,b) => b.score - a.score).slice(0, topK);
    }
    const t = await modelRef.current.embed([query]);
    const arr = await t.array(); t.dispose();
    const qVec = arr[0];
    return db
      .map(r => ({ ...r, score: embeddings[r.id] ? cosineSim(qVec, embeddings[r.id]) : 0 }))
      .sort((a,b) => b.score - a.score).slice(0, topK);
  }, [db, embeddings]);

  const addToIndex = useCallback(async (record) => {
    if (!modelRef.current) return;
    const text = `${record.name} ${record.cat} ${record.comp} 硬度${record.hv}HV 引張${record.ts}MPa ${record.memo}`.trim();
    const emb = await modelRef.current.embed([text]);
    const arr = await emb.array(); emb.dispose();
    setEmbeddings(prev => ({ ...prev, [record.id]: arr[0] }));
  }, []);

  return { status, embeddings, search, addToIndex, embCount: Object.keys(embeddings).length };
}
