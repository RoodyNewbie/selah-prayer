// Selah — prayer flow v2 (illuminated)
const { useState, useEffect, useRef } = React;

// ── SIGILS ────────────────────────────────────────────────────
const SIGIL_PATHS = {
  praise:     'M12 7 L13.8 11.2 L18 12 L13.8 12.8 L12 17 L10.2 12.8 L6 12 L10.2 11.2 Z',
  will:       'M12 4c-4 4-5 8-5 10a5 5 0 0010 0c0-2-1-6-5-10z',
  needs:      'M5 9h14 M7 9l1.5 9h7L17 9',
  forgiveness:'M12 3l5 9a5 5 0 01-10 0z',
  protection: 'M12 3l9 3.5V12c0 5.5-4 9-9 10-5-1-9-4.5-9-10V6.5z',
  worship:    'M12 3c-4 4-4 9-4 10a4 4 0 008 0c0-1 0-6-4-10z',
};

function Sigil({ phase, size = 16, color = 'currentColor', sw = 1.75 }) {
  const d = SIGIL_PATHS[phase];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// ── PHASES ────────────────────────────────────────────────────
const PHASES = [
  { id:'praise',      name:'Adoration',   prompt:'What do you love about God today?',                    sub:'Begin with who He is, not what you need.',                 scripture:'"Holy, holy, holy is the Lord Almighty; the whole earth is full of his glory." — Isaiah 6:3' },
  { id:'will',        name:'Surrender',   prompt:'Where do you need to release control?',                sub:'Place what you hold tightly into open hands.',              scripture:'"Not my will, but yours be done." — Luke 22:42' },
  { id:'needs',       name:'Intercession',prompt:'What needs are you carrying today?',                   sub:'Bring your burdens — and others\' — before Him.',           scripture:'"Cast all your anxiety on him because he cares for you." — 1 Peter 5:7' },
  { id:'forgiveness', name:'Confession',  prompt:'Is there anything to bring before God?',               sub:'A clean conscience is a gift freely given.',                scripture:'"If we confess our sins, he is faithful and just to forgive us." — 1 John 1:9' },
  { id:'protection',  name:'Protection',  prompt:'Where do you need God\'s covering?',                   sub:'Name what feels exposed, threatened, or fragile.',          scripture:'"The Lord is my light and my salvation — whom shall I fear?" — Psalm 27:1' },
  { id:'worship',     name:'Gratitude',   prompt:'What are you thankful for today?',                     sub:'Let the last note of your prayer be praise.',               scripture:'"Give thanks in all circumstances; for this is the will of God." — 1 Thessalonians 5:18' },
];

const FORMATS = [
  { id:'lords',  name:"The Lord's Prayer",  desc:'Six-phase structure modeled on the prayer Jesus taught his disciples.',          phases:6, phaseIds:['praise','will','needs','forgiveness','protection','worship'] },
  { id:'acts',   name:'ACTS Prayer',         desc:'Adoration, Confession, Thanksgiving, Supplication — classic and memorable.',     phases:4, phaseIds:['praise','forgiveness','worship','needs'] },
  { id:'examen', name:'Daily Examen',         desc:'Reflective practice from St. Ignatius of Loyola. Ideal for evening prayer.',    phases:5, phaseIds:['praise','needs','forgiveness','protection','worship'] },
];

// ── ILLUMINATED PROGRESS RAIL ─────────────────────────────────
function PhaseProgressRail({ phaseIdx, phases }) {
  return (
    <div style={{ display:'flex', alignItems:'center', padding:'10px 20px' }}>
      {phases.map((phase, i) => {
        const done = i < phaseIdx;
        const curr = i === phaseIdx;
        const future = i > phaseIdx;
        return (
          <React.Fragment key={phase.id}>
            {i > 0 && (
              <div style={{
                flex:1, height:1.5, minWidth:4,
                background: i <= phaseIdx ? 'var(--pri)' : 'var(--rule)',
                transition:'background 600ms cubic-bezier(0.37,0,0.63,1)',
              }} />
            )}
            <div title={phase.name} style={{
              width: curr ? 30 : 22, height: curr ? 30 : 22,
              borderRadius:'50%', flexShrink:0,
              background: done ? 'var(--pri)' : 'transparent',
              border: future ? '1.5px solid var(--rule)' : '1.5px solid var(--pri)',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 600ms cubic-bezier(0.37,0,0.63,1)',
              boxShadow: curr ? '0 0 0 4px var(--pri-shadow)' : 'none',
            }}>
              <Sigil phase={phase.id}
                size={curr ? 14 : 10}
                color={done ? 'white' : curr ? 'var(--pri)' : 'var(--fg3)'}
                sw={done ? 2 : 1.5}
              />
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── SHARED COMPONENTS ─────────────────────────────────────────
function XBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      width:34, height:34, borderRadius:'50%',
      background:'hsl(0 0% 0% / 0.07)',
      border:'none', cursor:'pointer', flexShrink:0,
      display:'flex', alignItems:'center', justifyContent:'center', color:'var(--fg2)',
    }}>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>
  );
}

// ── FORMAT SELECT ─────────────────────────────────────────────
function FormatSelectScreen({ onSelect, onClose }) {
  return (
    <div className="screen sin" data-screen-label="Pray — Format Select"
         style={{ paddingTop:56, display:'flex', flexDirection:'column' }}>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'10px 22px 16px', borderBottom:'1px solid var(--rule)' }}>
        <XBtn onClick={onClose} />
        <span className="df" style={{ fontSize:16, fontWeight:500, color:'var(--fg)' }}>
          How would you like to pray?
        </span>
        <div style={{ width:34 }} />
      </div>

      <div style={{ padding:'16px 22px', display:'flex', flexDirection:'column', gap:12, flex:1 }}>
        {FORMATS.map((fmt, i) => {
          const fmtPhases = fmt.phaseIds.map(id => PHASES.find(p => p.id === id)).filter(Boolean);
          return (
            <button key={fmt.id} onClick={() => onSelect(fmt)}
              style={{
                background: i === 0 ? 'var(--pri)' : 'var(--bg1)',
                border: i === 0 ? 'none' : '1px solid var(--rule)',
                borderRadius: i === 0 ? '20px 8px 20px 8px' : 14,
                padding:'20px 22px', cursor:'pointer', textAlign:'left',
                transition:'all 200ms cubic-bezier(0.37,0,0.63,1)',
              }}
              onMouseEnter={e => { if (i!==0) e.currentTarget.style.background='var(--bg2)'; }}
              onMouseLeave={e => { if (i!==0) e.currentTarget.style.background='var(--bg1)'; }}
            >
              <div className="df" style={{ fontSize:17, fontWeight:500, marginBottom:6,
                color: i === 0 ? 'white' : 'var(--fg)' }}>{fmt.name}</div>
              <div style={{ fontSize:13, lineHeight:1.55, marginBottom:12,
                color: i === 0 ? 'rgba(255,255,255,0.72)' : 'var(--fg2)' }}>{fmt.desc}</div>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                {fmtPhases.map(phase => (
                  <Sigil key={phase.id} phase={phase.id} size={13}
                    color={i===0 ? 'rgba(255,255,255,0.65)' : 'var(--fg3)'} sw={1.5} />
                ))}
                <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.08em',
                  textTransform:'uppercase', marginLeft:4,
                  color: i===0 ? 'rgba(255,255,255,0.5)' : 'var(--fg3)' }}>
                  {fmt.phases} phases
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── PHASE SCREEN ──────────────────────────────────────────────
function PhaseScreen({ phase, phaseIdx, totalPhases, selectedPhases, content, onChange, onNext, onSkip, onExit }) {
  const textRef = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => textRef.current?.focus(), 420);
    return () => clearTimeout(t);
  }, [phase.id]);

  return (
    <div className="screen" data-screen-label={`Pray — ${phase.name}`}
         style={{
           background:`var(--ph-${phase.id})`,
           transition:'background 700ms cubic-bezier(0.37,0,0.63,1)',
           display:'flex', flexDirection:'column', paddingTop:56,
         }}>

      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 22px 0' }}>
        <XBtn onClick={onExit} />
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.12em',
            textTransform:'uppercase', color:'var(--fg2)' }}>{phase.name}</div>
        </div>
        <div style={{ fontSize:13, color:'var(--fg3)', minWidth:34, textAlign:'right' }}>
          {phaseIdx + 1} / {totalPhases}
        </div>
      </div>

      {/* Illuminated progress rail */}
      <PhaseProgressRail phaseIdx={phaseIdx} phases={selectedPhases} />

      {/* Content — breath animation on phase change */}
      <div key={phase.id} className="phin"
           style={{ flex:1, padding:'20px 28px 12px', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Scripture */}
        <div style={{ textAlign:'center', marginBottom:18 }}>
          <p style={{ fontSize:12, fontStyle:'italic', color:'var(--fg2)', lineHeight:1.65 }}>
            {phase.scripture}
          </p>
        </div>

        {/* THE PROMPT — hero element */}
        <div style={{ textAlign:'center', marginBottom:8 }}>
          <h2 className="dfi" style={{ fontSize:26, lineHeight:1.5, color:'var(--fg)', letterSpacing:'0.008em' }}>
            {phase.prompt}
          </h2>
          <p style={{ fontSize:13, color:'var(--fg2)', marginTop:9, fontStyle:'italic' }}>
            {phase.sub}
          </p>
        </div>

        {/* Ruled textarea */}
        <div style={{ flex:1, borderTop:'1px solid var(--rule)', marginTop:18,
          display:'flex', flexDirection:'column' }}>
          <textarea
            ref={textRef}
            value={content}
            onChange={e => onChange(e.target.value)}
            placeholder="Write freely…"
            style={{
              flex:1, background:'transparent', border:'none', outline:'none', resize:'none',
              fontFamily:'DM Sans, sans-serif', fontSize:16, color:'var(--fg)',
              lineHeight:'28px', minHeight:100, caretColor:'var(--pri)', paddingTop:12,
              backgroundImage:'repeating-linear-gradient(transparent, transparent 27px, var(--rule) 27px, var(--rule) 28px)',
              backgroundPositionY:'12px',
            }}
          />
        </div>
      </div>

      {/* Bottom actions */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'12px 28px 34px', borderTop:'1px solid var(--rule)' }}>
        <button onClick={onSkip} style={{ fontFamily:'DM Sans, sans-serif', fontSize:14,
          color:'var(--fg2)', background:'none', border:'none', cursor:'pointer', padding:'8px 0' }}>
          Skip
        </button>
        <button onClick={onNext} style={{ fontFamily:'DM Sans, sans-serif', fontSize:15,
          fontWeight:500, color:'var(--pri)', background:'none', border:'none',
          cursor:'pointer', display:'flex', alignItems:'center', gap:6, padding:'8px 0' }}>
          {phaseIdx === totalPhases - 1 ? 'Finish' : 'Continue'}
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── COMPLETE SCREEN ───────────────────────────────────────────
function CompleteScreen({ content, phases, onHome }) {
  const [generated, setGenerated] = useState('');
  const [generating, setGenerating] = useState(false);
  const [personal, setPersonal] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const notes = phases.map(p => `${p.name}: ${content[p.id] || '(not written)'}`).join('\n');
      const result = await window.claude.complete(
        `You are a gentle, prayerful assistant. Based on these personal prayer notes, write a single flowing prayer of 3–4 sentences. Make it sincere, warm, and conversational — not formal or stiff. Only output the prayer text itself.\n\nNotes:\n${notes}`
      );
      setGenerated(result);
    } catch {
      setGenerated("Lord, we come before you with grateful hearts, bringing our joys and burdens alike. Thank you for your faithfulness and your steadfast love in every season. May your will be done in each area we've lifted to you today, and may we rest in the peace that surpasses understanding. Amen.");
    }
    setGenerating(false);
  };

  return (
    <div className="screen sin" data-screen-label="Pray — Complete"
         style={{ paddingTop:56, paddingBottom:24, display:'flex', flexDirection:'column' }}>

      {/* Amen with drop cap */}
      <section style={{ textAlign:'center', padding:'32px 28px 20px' }}>
        <div style={{ width:50, height:50, borderRadius:'50%', background:'var(--pri)',
          margin:'0 auto 18px', display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 6px 24px var(--pri-shadow)' }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
               stroke="white" strokeWidth={2.5} strokeLinecap="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        {/* Drop cap layout */}
        <div style={{ display:'inline-flex', alignItems:'baseline', gap:1, marginBottom:8 }}>
          <span className="df" style={{ fontSize:68, lineHeight:0.8, color:'var(--pri)',
            fontStyle:'italic', letterSpacing:'-0.02em' }}>A</span>
          <span className="df" style={{ fontSize:38, lineHeight:1, color:'var(--fg)',
            letterSpacing:'0.04em' }}>men.</span>
        </div>
        <p style={{ fontSize:14, color:'var(--fg2)', lineHeight:1.6 }}>
          Your prayer has been kept.
        </p>
      </section>

      <div className="rule" style={{ margin:'0 24px' }} />

      {/* Phase miniatures */}
      <section style={{ padding:'16px 24px' }}>
        <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase',
          color:'var(--fg2)', marginBottom:10 }}>Your reflections</div>
        <div className="noscroll" style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2 }}>
          {phases.map(phase => (
            <div key={phase.id} style={{ flexShrink:0, width:96, background:'var(--bg1)',
              border:'1px solid var(--rule)', borderRadius:10, padding:'10px 12px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:6 }}>
                <Sigil phase={phase.id} size={11} color="var(--pri)" sw={1.5} />
                <span style={{ fontSize:9, fontWeight:600, letterSpacing:'0.08em',
                  textTransform:'uppercase', color:'var(--fg2)' }}>{phase.name}</span>
              </div>
              <p style={{ fontSize:11, lineHeight:1.5,
                color: content[phase.id] ? 'var(--fg)' : 'var(--fg3)',
                fontStyle: content[phase.id] ? 'normal' : 'italic' }}>
                {content[phase.id]
                  ? content[phase.id].substring(0,55) + (content[phase.id].length > 55 ? '…' : '')
                  : 'Not written'}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* AI composer */}
      <section style={{ padding:'0 24px 14px' }}>
        {generated ? (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em',
                textTransform:'uppercase', color:'var(--fg2)' }}>Composed Prayer</div>
              <button onClick={() => { navigator.clipboard.writeText(generated).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
                style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg2)',
                  fontSize:12, fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', gap:4 }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  {copied ? <path d="M20 6L9 17l-5-5"/> : <><path d="M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2v-2"/><path d="M13 2h5a2 2 0 012 2v4"/><rect x="10" y="12" width="8" height="8" rx="1"/></>}
                </svg>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div style={{ background:'var(--bg1)', border:'1px solid var(--rule)', borderRadius:12, padding:'14px 16px' }}>
              <p className="dfi" style={{ fontSize:14, color:'var(--fg)', lineHeight:1.8 }}>{generated}</p>
            </div>
          </>
        ) : (
          <button onClick={handleGenerate} disabled={generating} style={{
            width:'100%', padding:'14px', background:'var(--bg1)',
            border:'1px solid var(--rule)', borderRadius:12,
            cursor: generating ? 'default' : 'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            fontFamily:'DM Sans, sans-serif', fontSize:14, fontWeight:500, color:'var(--fg)',
            opacity: generating ? 0.6 : 1, transition:'background 150ms',
          }}
            onMouseEnter={e => { if(!generating) e.currentTarget.style.background='var(--bg2)'; }}
            onMouseLeave={e => { if(!generating) e.currentTarget.style.background='var(--bg1)'; }}
          >
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="var(--pri)" strokeWidth={2} strokeLinecap="round">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
            </svg>
            {generating ? 'Composing…' : 'Compose a prayer from my notes'}
          </button>
        )}
      </section>

      {/* Personal prayer */}
      <section style={{ padding:'0 24px 16px' }}>
        <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em',
          textTransform:'uppercase', color:'var(--fg2)', marginBottom:10 }}>Add your own words</div>
        <textarea value={personal} onChange={e => setPersonal(e.target.value)}
          placeholder="Write your own prayer or reflection…"
          style={{ width:'100%', background:'var(--bg1)', border:'1px solid var(--rule)',
            borderRadius:12, padding:'13px 15px', fontSize:15, color:'var(--fg)',
            fontFamily:'DM Sans, sans-serif', resize:'none', outline:'none',
            minHeight:80, lineHeight:1.65, caretColor:'var(--pri)', transition:'border-color 150ms' }}
          onFocus={e => e.target.style.borderColor='var(--pri)'}
          onBlur={e => e.target.style.borderColor='var(--rule)'}
        />
      </section>

      <div style={{ padding:'0 24px', marginTop:'auto' }}>
        <button onClick={onHome} style={{ width:'100%', padding:'15px', background:'var(--pri)',
          color:'white', border:'none', borderRadius:12, fontSize:15, fontWeight:500,
          fontFamily:'DM Sans, sans-serif', cursor:'pointer' }}>
          Return Home
        </button>
      </div>
    </div>
  );
}

// ── PRAY FLOW ─────────────────────────────────────────────────
function PrayFlow({ state, setState, onEnd, dark }) {
  const getPhases = fmt => {
    if (!fmt) return PHASES;
    return fmt.phaseIds.map(id => PHASES.find(p => p.id === id)).filter(Boolean);
  };
  const selectedPhases = getPhases(state.format);

  if (state.step === 'format') {
    return <FormatSelectScreen onSelect={fmt => setState(s=>({...s,step:'phase',format:fmt,phaseIdx:0}))} onClose={onEnd} />;
  }
  if (state.step === 'phase') {
    const phase = selectedPhases[state.phaseIdx];
    if (!phase) return null;
    const advance = () => {
      if (state.phaseIdx < selectedPhases.length - 1) setState(s=>({...s,phaseIdx:s.phaseIdx+1}));
      else setState(s=>({...s,step:'complete'}));
    };
    return (
      <PhaseScreen key={phase.id}
        phase={phase} phaseIdx={state.phaseIdx}
        totalPhases={selectedPhases.length} selectedPhases={selectedPhases}
        content={state.content[phase.id]||''}
        onChange={val => setState(s=>({...s,content:{...s.content,[phase.id]:val}}))}
        onNext={advance} onSkip={advance} onExit={onEnd}
      />
    );
  }
  if (state.step === 'complete') {
    return <CompleteScreen content={state.content} phases={selectedPhases} onHome={onEnd} dark={dark} />;
  }
  return null;
}

Object.assign(window, { PrayFlow });
