'use client';
import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n';
import { Send, X, Minus } from 'lucide-react';
import { SimorghMindIcon } from './SimorghMindIcon';

type Message = { role: 'user' | 'assistant'; content: string };

export function SimorghAIChat() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const { locale } = useI18n();
  const chatCopy: Record<string, { initial: string; title: string; engine: string; busy: string; placeholder: string; minimize: string; close: string; open: string }> = {
    en: { initial: 'I am Simorgh Site Intelligence. Ask me about any page, product, solution or technology on this website.', title: 'Simorgh Intelligence', engine: 'SITE KNOWLEDGE ENGINE', busy: 'Simorgh is reading the site context…', placeholder: 'Ask about Simorgh…', minimize: 'Minimize', close: 'Close', open: 'Open Simorgh Site Intelligence' },
    fa: { initial: 'من هوش سایت سیمرغ هستم. درباره هر صفحه، محصول، راهکار یا فناوری این سایت از من بپرسید.', title: 'هوش سایت سیمرغ', engine: 'موتور دانش سایت', busy: 'سیمرغ در حال بررسی اطلاعات سایت است…', placeholder: 'درباره سیمرغ بپرسید…', minimize: 'کوچک کردن', close: 'بستن', open: 'باز کردن هوش سایت سیمرغ' },
    ar: { initial: 'أنا ذكاء موقع سيمورغ. اسألني عن أي صفحة أو منتج أو حل أو تقنية في الموقع.', title: 'ذكاء سيمورغ', engine: 'محرك معرفة الموقع', busy: 'سيمورغ يقرأ سياق الموقع…', placeholder: 'اسأل عن سيمورغ…', minimize: 'تصغير', close: 'إغلاق', open: 'فتح ذكاء موقع سيمورغ' },
    tr: { initial: 'Ben Simorgh Site Intelligence. Bu sitedeki herhangi bir sayfa, ürün, çözüm veya teknoloji hakkında bana sorabilirsiniz.', title: 'Simorgh Intelligence', engine: 'SITE BİLGİ MOTORU', busy: 'Simorgh site içeriğini inceliyor…', placeholder: 'Simorgh hakkında sorun…', minimize: 'Küçült', close: 'Kapat', open: 'Simorgh Site Intelligence aç' },
    de: { initial: 'Ich bin Simorgh Site Intelligence. Fragen Sie mich zu jeder Seite, jedem Produkt, jeder Lösung oder Technologie dieser Website.', title: 'Simorgh Intelligence', engine: 'SITE-WISSENSMOTOR', busy: 'Simorgh liest den Website-Kontext…', placeholder: 'Über Simorgh fragen…', minimize: 'Minimieren', close: 'Schließen', open: 'Simorgh Site Intelligence öffnen' },
    fr: { initial: 'Je suis Simorgh Site Intelligence. Posez-moi vos questions sur toute page, tout produit, toute solution ou technologie du site.', title: 'Simorgh Intelligence', engine: 'MOTEUR DE CONNAISSANCES DU SITE', busy: 'Simorgh analyse le contexte du site…', placeholder: 'Demander à Simorgh…', minimize: 'Réduire', close: 'Fermer', open: 'Ouvrir Simorgh Site Intelligence' },
    es: { initial: 'Soy Simorgh Site Intelligence. Pregúntame sobre cualquier página, producto, solución o tecnología de este sitio.', title: 'Simorgh Intelligence', engine: 'MOTOR DE CONOCIMIENTO DEL SITIO', busy: 'Simorgh está leyendo el contexto del sitio…', placeholder: 'Pregunta sobre Simorgh…', minimize: 'Minimizar', close: 'Cerrar', open: 'Abrir Simorgh Site Intelligence' },
    zh: { initial: '我是 Simorgh Site Intelligence。您可以询问本网站的任何页面、产品、解决方案或技术。', title: 'Simorgh Intelligence', engine: '网站知识引擎', busy: 'Simorgh 正在读取网站内容…', placeholder: '询问 Simorgh…', minimize: '最小化', close: '关闭', open: '打开 Simorgh Site Intelligence' },
    ja: { initial: '私は Simorgh Site Intelligence です。このサイトのページ、製品、ソリューション、テクノロジーについて質問できます。', title: 'Simorgh Intelligence', engine: 'サイト知識エンジン', busy: 'Simorgh がサイト情報を確認しています…', placeholder: 'Simorgh に質問…', minimize: '最小化', close: '閉じる', open: 'Simorgh Site Intelligence を開く' },
    ru: { initial: 'Я Simorgh Site Intelligence. Спрашивайте о любой странице, продукте, решении или технологии этого сайта.', title: 'Simorgh Intelligence', engine: 'ДВИЖОК ЗНАНИЙ САЙТА', busy: 'Simorgh изучает контекст сайта…', placeholder: 'Спросить о Simorgh…', minimize: 'Свернуть', close: 'Закрыть', open: 'Открыть Simorgh Site Intelligence' }
  };
  const copy = chatCopy[locale] || chatCopy.en;
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: copy.initial }]);
  useEffect(() => { setMessages((current) => current.length === 1 && current[0].role === 'assistant' ? [{ role: 'assistant', content: copy.initial }] : current); }, [locale, copy.initial]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next, locale }) });
      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', content: data.answer || 'I could not answer that right now.' }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'The site intelligence service is temporarily unavailable.' }]);
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed bottom-5 end-5 z-[80]" dir="ltr" data-no-translate>
      {!open && <button onClick={() => setOpen(true)} aria-label={copy.open} className="group relative flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan/30 bg-space-1/95 text-cyan shadow-[0_12px_50px_rgba(42,211,240,.18)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan/70">
        <span className="absolute inset-1 rounded-[14px] border border-white/5" />
        <SimorghMindIcon className="h-9 w-9 transition-transform group-hover:scale-110" />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-space-0 bg-cyan" />
      </button>}
      {open && <div className={`w-[min(390px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-line bg-space-1/98 shadow-[0_25px_90px_rgba(0,0,0,.55)] backdrop-blur-xl ${minimized ? 'h-auto' : ''}`}>
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan/25 text-cyan"><SimorghMindIcon className="h-6 w-6" /></div><div><div className="text-sm font-semibold text-white">{copy.title}</div><div className="font-mono text-[9px] tracking-[.12em] text-cyan/70">{copy.engine}</div></div></div>
          <div className="flex gap-1"><button onClick={() => setMinimized(v=>!v)} className="p-2 text-ink-faint hover:text-white" aria-label={copy.minimize}><Minus className="h-4 w-4"/></button><button onClick={() => setOpen(false)} className="p-2 text-ink-faint hover:text-white" aria-label={copy.close}><X className="h-4 w-4"/></button></div>
        </div>
        {!minimized && <><div className="max-h-[430px] space-y-3 overflow-y-auto p-4">
          {messages.map((m,i)=><div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}><div className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${m.role==='user'?'bg-cyan/10 text-cyan-soft border border-cyan/15':'bg-space-2 text-ink-muted border border-line'}`}>{m.content}</div></div>)}
          {busy && <div className="text-xs text-ink-faint">{copy.busy}</div>}
        </div><div className="border-t border-line p-3"><div className="flex items-center gap-2 rounded-xl border border-line bg-space-2 p-2"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send()}} placeholder={copy.placeholder} className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-ink-faint"/><button onClick={send} disabled={busy||!input.trim()} className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan text-space-0 disabled:opacity-40"><Send className="h-4 w-4"/></button></div></div></>}
      </div>}
    </div>
  );
}
