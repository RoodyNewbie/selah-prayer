// Selah — screen components v2 (illuminated)
const { useState, useMemo } = React;

// ── MOCK DATA ─────────────────────────────────────────────────
const VERSES = [
  { text:"Be still, and know that I am God.",                                          ref:"Psalm 46:10" },
  { text:"Draw near to God, and he will draw near to you.",                            ref:"James 4:8" },
  { text:"You keep him in perfect peace whose mind is stayed on you.",                 ref:"Isaiah 26:3" },
  { text:"My presence will go with you, and I will give you rest.",                    ref:"Exodus 33:14" },
  { text:"In quietness and trust shall be your strength.",                             ref:"Isaiah 30:15" },
  { text:"The Lord is near to all who call on him.",                                   ref:"Psalm 145:18" },
  { text:"Come to me, all who labor and are heavy laden, and I will give you rest.",   ref:"Matthew 11:28" },
];

const REQUESTS = [
  { id:'1', title:"Mom's recovery after surgery",         tag:'health',   date:'Apr 18', recurring:true },
  { id:'2', title:"Peace with the job transition",        tag:'work',     date:'Apr 14' },
  { id:'3', title:"Our marriage deepened this season",    tag:'family',   date:'Apr 10', recurring:true },
  { id:'4', title:"Provision for rent this month",        tag:'finances', date:'Apr 5' },
  { id:'5', title:"Healing for David's anxiety",          tag:'health',   date:'Mar 28' },
];

const ANSWERED = [
  { id:'1', title:"Found the apartment in time",       testimony:"After three months of searching, we found a place the same week we had to move out. Only God.", date:'March 2025',   daysWaited:84 },
  { id:'2', title:"Reconciled with my brother",        testimony:"What felt impossible for years — one conversation changed everything. He called out of nowhere.", date:'February 2025', daysWaited:412 },
  { id:'3', title:"Got the position at the school",    testimony:"I'd almost given up applying. They called a week after I nearly withdrew.", date:'January 2025',  daysWaited:31 },
];

const JOURNAL = [
  { id:'1', date:'Apr 18', type:'dream', text:'A field of wheat, golden in the afternoon light. A figure walking through it, unhurried.' },
  { id:'2', date:'Apr 15', type:'word',  text:'"Perseverance"' },
  { id:'3', date:'Apr 9',  type:'dream', text:'Water — a river that seemed to know where it was going.' },
  { id:'4', date:'Mar 30', type:'word',  text:'"Be not afraid"' },
];

const THREADS = [
  { id:'1', title:"Mom's recovery",   days:7 },
  { id:'2', title:"Our marriage",     days:15 },
  { id:'3', title:"Job transition",   days:3 },
  { id:'4', title:"David's anxiety",  days:10 },
];

const PHASE_LIST = [
  {id:'praise'},{id:'will'},{id:'needs'},{id:'forgiveness'},{id:'protection'},{id:'worship'}
];

const TC  = { health:['hsl(155 42% 90%)','hsl(155 45% 25%)'], work:['hsl(222 40% 90%)','hsl(222 45% 25%)'], family:['hsl(22 55% 90%)','hsl(22 55% 25%)'], finances:['hsl(42 48% 90%)','hsl(42 50% 28%)'], spiritual:['hsl(272 38% 90%)','hsl(272 42% 28%)'], others:['hsl(0 0% 91%)','hsl(0 0% 32%)'] };
const TCD = { health:['hsl(155 30% 22%)','hsl(155 55% 70%)'], work:['hsl(222 28% 22%)','hsl(222 55% 70%)'], family:['hsl(22 38% 22%)','hsl(22 60% 70%)'], finances:['hsl(42 35% 22%)','hsl(42 60% 70%)'], spiritual:['hsl(272 28% 22%)','hsl(272 55% 70%)'], others:['hsl(0 0% 20%)','hsl(0 0% 65%)'] };

// ── SIGILS (local copy) ───────────────────────────────────────
const SIGIL_PATHS = {
  praise:     'M12 7 L13.8 11.2 L18 12 L13.8 12.8 L12 17 L10.2 12.8 L6 12 L10.2 11.2 Z',
  will:       'M12 4c-4 4-5 8-5 10a5 5 0 0010 0c0-2-1-6-5-10z',
  needs:      'M5 9h14 M7 9l1.5 9h7L17 9',
  forgiveness:'M12 3l5 9a5 5 0 01-10 0z',
  protection: 'M12 3l9 3.5V12c0 5.5-4 9-9 10-5-1-9-4.5-9-10V6.5z',
  worship:    'M12 3c-4 4-4 9-4 10a4 4 0 008 0c0-1 0-6-4-10z',
};

function Sigil({ phase, size=16, color='currentColor', sw=1.75 }) {
  const d = SIGIL_PATHS[phase];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// ── ICON PATHS ────────────────────────────────────────────────
const IP = {
  home:   ['M3 9L12 2l9 7v12H15v-6H9v6H3z'],
  list:   ['M9 6h12','M9 12h12','M9 18h8','M3 6h.01','M3 12h.01','M3 18h.01'],
  book:   ['M4 20.5V5.5A2.5 2.5 0 016.5 3H20v18H6.5A2.5 2.5 0 014 18.5z','M8 10h7','M8 14h5','M20 3v18'],
  star:   ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z'],
  arrowr: ['M5 12h14','M13 6l6 6-6 6'],
  plus:   ['M12 5v14','M5 12h14'],
  check:  ['M20 6L9 17l-5-5'],
  moon:   ['M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'],
  sun:    ['M12 1v2','M12 21v2','M4.22 4.22l1.42 1.42','M18.36 18.36l1.42 1.42','M1 12h2','M21 12h2','M4.22 19.78l1.42-1.42','M18.36 5.64l1.42-1.42','M12 17a5 5 0 100-10 5 5 0 000 10z'],
};
function Ic({ n, s=20, c='currentColor', sw=1.75 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
         stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {(IP[n]||[]).map((d,i) => <path key={i} d={d}/>)}
    </svg>
  );
}
function Tag({ tag, dark }) {
  const col = (dark ? TCD : TC)[tag] || (dark ? TCD : TC).others;
  return (
    <span style={{ fontSize:11, fontWeight:500, padding:'2px 9px', borderRadius:99,
      background:col[0], color:col[1], textTransform:'capitalize', whiteSpace:'nowrap' }}>
      {tag}
    </span>
  );
}

// ── BOTTOM NAV ────────────────────────────────────────────────
function BottomNav({ tab, onNav, onPray }) {
  const items = [
    {id:'home',ic:'home',lbl:'Home'}, {id:'requests',ic:'list',lbl:'Requests'}, null,
    {id:'journal',ic:'book',lbl:'Journal'}, {id:'answered',ic:'star',lbl:'Stones'},
  ];
  return (
    <nav style={{ position:'absolute', bottom:0, left:0, right:0, height:82,
      background:'var(--bg)', borderTop:'1px solid var(--rule)',
      display:'flex', alignItems:'flex-start', justifyContent:'space-around',
      paddingTop:10, zIndex:50 }}>
      {items.map((item, idx) => {
        if (!item) return (
          <button key="pray" onClick={onPray} style={{ flex:1, display:'flex',
            flexDirection:'column', alignItems:'center', background:'none',
            border:'none', cursor:'pointer', marginTop:-18 }}>
            <div style={{ width:54, height:54, borderRadius:'50%', background:'var(--pri)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 18px var(--pri-shadow)',
              transition:'transform 150ms, box-shadow 150ms' }}
              onMouseEnter={e => { e.currentTarget.style.transform='scale(1.06)'; e.currentTarget.style.boxShadow='0 6px 24px var(--pri-shadow)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 4px 18px var(--pri-shadow)'; }}
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
                   stroke="white" strokeWidth={2.2} strokeLinecap="round">
                <path d="M12 3v18M5 9h14"/>
              </svg>
            </div>
          </button>
        );
        const active = tab === item.id;
        return (
          <button key={item.id} onClick={() => onNav(item.id)} style={{ flex:1,
            display:'flex', flexDirection:'column', alignItems:'center', gap:3,
            background:'none', border:'none', cursor:'pointer', padding:'2px 0',
            color: active ? 'var(--pri)' : 'var(--fg3)', transition:'color 150ms' }}>
            <Ic n={item.ic} s={22} sw={active ? 2 : 1.75} />
            <span style={{ fontSize:10, fontWeight:500, letterSpacing:'0.04em', textTransform:'uppercase' }}>
              {item.lbl}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ── HOME SCREEN ───────────────────────────────────────────────
function HomeScreen({ onStartPray, onNav, dark, toggleDark }) {
  const verse = useMemo(() => VERSES[Math.floor(Math.random() * VERSES.length)], []);
  const stone = ANSWERED[0];

  return (
    <div className="screen sin" data-screen-label="Home" style={{ paddingTop:56, paddingBottom:90 }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 24px 0' }}>
        <span className="df" style={{ fontSize:22, fontWeight:500, color:'var(--fg)' }}>Selah</span>
        <button onClick={toggleDark} style={{ width:34, height:34, borderRadius:'50%',
          background:'var(--bg1)', border:'1px solid var(--rule)', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', color:'var(--fg2)',
          transition:'background 150ms' }}>
          <Ic n={dark ? 'sun' : 'moon'} s={14} />
        </button>
      </div>

      {/* SCRIPTURE PLATE with ornamental dividers */}
      <section style={{ padding:'28px 28px 22px', textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <div style={{ flex:1, height:1, background:'var(--rule)' }} />
          <span style={{ color:'var(--fg3)', fontSize:13 }}>✦</span>
          <div style={{ flex:1, height:1, background:'var(--rule)' }} />
        </div>

        <blockquote className="dfi" style={{ fontSize:26, lineHeight:1.55, color:'var(--fg)',
          marginBottom:14, letterSpacing:'0.005em', textWrap:'pretty' }}>
          "{verse.text}"
        </blockquote>
        <cite style={{ display:'block', fontSize:10, fontWeight:600, letterSpacing:'0.1em',
          textTransform:'uppercase', color:'var(--pri)', fontStyle:'normal' }}>
          — {verse.ref}
        </cite>

        <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:18 }}>
          <div style={{ flex:1, height:1, background:'var(--rule)' }} />
          <span style={{ color:'var(--fg3)', fontSize:13 }}>✦</span>
          <div style={{ flex:1, height:1, background:'var(--rule)' }} />
        </div>
      </section>

      {/* FEATURED BEGIN PRAYER — asymmetric tile */}
      <div style={{ padding:'0 20px 18px' }}>
        <button onClick={onStartPray}
          style={{ width:'100%', background:'var(--bg1)',
            border:'1.5px solid var(--rule)',
            borderRadius:'20px 8px 20px 8px',
            padding:'20px 22px', cursor:'pointer', textAlign:'left',
            transition:'all 200ms cubic-bezier(0.37,0,0.63,1)' }}
          onMouseEnter={e => { e.currentTarget.style.background='var(--bg2)'; e.currentTarget.style.boxShadow='0 4px 20px var(--pri-shadow)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='var(--bg1)'; e.currentTarget.style.boxShadow='none'; }}
        >
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
            <span className="df" style={{ fontSize:22, fontWeight:500, color:'var(--fg)' }}>Begin Prayer</span>
            <span style={{ fontSize:18, color:'var(--pri)', marginTop:2 }}>→</span>
          </div>
          <div style={{ fontSize:12, color:'var(--fg2)', marginBottom:14 }}>
            6 phases · ~10 minutes of guided reflection
          </div>
          <div style={{ display:'flex', gap:9, alignItems:'center' }}>
            {PHASE_LIST.map((p, i) => (
              <Sigil key={p.id} phase={p.id} size={14}
                color={i === 0 ? 'var(--pri)' : 'var(--fg3)'} sw={1.5} />
            ))}
          </div>
        </button>
      </div>

      {/* THREADS STRIP — ongoing prayer topics */}
      <div style={{ marginBottom:18 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'0 24px', marginBottom:10 }}>
          <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em',
            textTransform:'uppercase', color:'var(--fg2)' }}>
            Ongoing · {THREADS.length} carried
          </span>
          <button onClick={() => onNav('requests')} style={{ background:'none', border:'none',
            cursor:'pointer', fontSize:11, color:'var(--pri)', fontFamily:'DM Sans, sans-serif' }}>
            View all
          </button>
        </div>
        <div className="noscroll" style={{ display:'flex', gap:8, padding:'0 24px', overflowX:'auto' }}>
          {THREADS.map(t => (
            <div key={t.id} style={{ flexShrink:0, background:'var(--bg1)',
              border:'1px solid var(--rule)', borderRadius:12, padding:'12px 14px',
              cursor:'pointer', minWidth:100,
              transition:'background 150ms' }}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg2)'}
              onMouseLeave={e => e.currentTarget.style.background='var(--bg1)'}
            >
              <div style={{ fontSize:13, fontWeight:500, color:'var(--fg)', marginBottom:3, lineHeight:1.3 }}>
                {t.title}
              </div>
              <div style={{ fontSize:11, color:'var(--fg3)' }}>{t.days} days</div>
            </div>
          ))}
        </div>
      </div>

      {/* STONE OF REMEMBRANCE pull-quote */}
      <button onClick={() => onNav('answered')} style={{ display:'flex', gap:14,
        margin:'0 24px', padding:'16px 0', background:'none', border:'none',
        cursor:'pointer', textAlign:'left', width:'calc(100% - 48px)' }}>
        <div style={{ width:3, flexShrink:0, background:'var(--pri)', borderRadius:2, marginTop:4 }} />
        <div>
          <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em',
            textTransform:'uppercase', color:'var(--fg2)', marginBottom:6 }}>
            Stone of Remembrance
          </div>
          <div style={{ fontSize:15, fontWeight:500, color:'var(--fg)', lineHeight:1.5 }}>
            {stone.title}
          </div>
          <div style={{ fontSize:12, color:'var(--fg3)', marginTop:4 }}>
            {stone.date} · {stone.daysWaited} days carried
          </div>
        </div>
      </button>
    </div>
  );
}

// ── REQUESTS SCREEN ───────────────────────────────────────────
function RequestsScreen({ dark }) {
  const [tag, setTag] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [reqs, setReqs] = useState(REQUESTS);
  const tags = ['all','health','work','family','finances'];
  const filtered = tag === 'all' ? reqs : reqs.filter(r => r.tag === tag);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    setReqs(r => [{ id:Date.now()+'', title:newTitle.trim(), tag:'others', date:'Today' }, ...r]);
    setNewTitle(''); setShowAdd(false);
  };

  return (
    <div className="screen sin" data-screen-label="Requests" style={{ paddingTop:56, paddingBottom:90 }}>
      <div style={{ padding:'14px 24px 14px', borderBottom:'1px solid var(--rule)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1 className="df" style={{ fontSize:24, fontWeight:500, color:'var(--fg)' }}>Requests</h1>
          <button onClick={() => setShowAdd(true)} style={{ width:36, height:36, borderRadius:'50%',
            background:'var(--pri)', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Ic n="plus" s={16} c="white" sw={2.5} />
          </button>
        </div>
      </div>

      <div className="noscroll" style={{ display:'flex', gap:8, padding:'12px 24px', overflowX:'auto' }}>
        {tags.map(t => (
          <button key={t} onClick={() => setTag(t)} style={{ flexShrink:0,
            padding:'6px 14px', borderRadius:99, border:'none', cursor:'pointer',
            fontSize:12, fontWeight:500, fontFamily:'DM Sans, sans-serif',
            textTransform:'capitalize',
            background: tag===t ? 'var(--pri)' : 'var(--bg1)',
            color: tag===t ? 'white' : 'var(--fg2)',
            transition:'all 150ms' }}>
            {t === 'all' ? 'All' : t}
          </button>
        ))}
      </div>

      <div style={{ padding:'0 24px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--fg3)', fontSize:14, fontStyle:'italic' }}>
            No requests in this category
          </div>
        )}
        {filtered.map((req, i) => (
          <div key={req.id} style={{ padding:'16px 0',
            borderBottom: i < filtered.length-1 ? '1px solid var(--rule)' : 'none',
            display:'flex', alignItems:'flex-start', gap:14 }}>
            <div style={{ width:44, flexShrink:0, paddingTop:2 }}>
              <div style={{ fontSize:11, color:'var(--fg3)', textAlign:'right', lineHeight:1.4 }}>
                {req.date.includes(' ')
                  ? <>{req.date.split(' ')[0]}<br/>{req.date.split(' ')[1]}</>
                  : req.date}
              </div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:500, color:'var(--fg)', lineHeight:1.45, marginBottom:6 }}>
                {req.title}
              </div>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <Tag tag={req.tag} dark={dark} />
                {req.recurring && <span style={{ fontSize:11, color:'var(--fg3)' }}>· Recurring</span>}
              </div>
            </div>
            <button style={{ width:30, height:30, borderRadius:'50%', flexShrink:0,
              border:'1.5px solid var(--rule)', background:'none', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'var(--fg3)', marginTop:2, transition:'all 150ms' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--pri)'; e.currentTarget.style.color='var(--pri)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--rule)'; e.currentTarget.style.color='var(--fg3)'; }}>
              <Ic n="check" s={13} />
            </button>
          </div>
        ))}
      </div>

      {showAdd && (
        <div style={{ position:'absolute', inset:0, background:'hsl(0 0% 0% / 0.5)',
          display:'flex', alignItems:'flex-end', zIndex:100 }}
          onClick={() => setShowAdd(false)}>
          <div style={{ width:'100%', background:'var(--bg)', borderRadius:'24px 24px 0 0',
            padding:'24px 24px 52px', animation:'sIn 200ms ease-out both' }}
            onClick={e => e.stopPropagation()}>
            <h2 className="df" style={{ fontSize:20, fontWeight:500, color:'var(--fg)', marginBottom:20 }}>
              New Request
            </h2>
            <input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleAdd()}
              placeholder="What's on your heart?"
              style={{ width:'100%', background:'var(--bg1)', border:'1px solid var(--rule)',
                borderRadius:10, padding:'14px 16px', fontSize:15, color:'var(--fg)',
                fontFamily:'DM Sans, sans-serif', outline:'none', marginBottom:12,
                transition:'border-color 150ms' }}
              onFocus={e => e.target.style.borderColor='var(--pri)'}
              onBlur={e => e.target.style.borderColor='var(--rule)'}
            />
            <button onClick={handleAdd} style={{ width:'100%', padding:'14px',
              background:'var(--pri)', color:'white', border:'none', borderRadius:10,
              fontSize:15, fontWeight:500, fontFamily:'DM Sans, sans-serif', cursor:'pointer' }}>
              Add Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── JOURNAL SCREEN ────────────────────────────────────────────
function JournalScreen({ dark }) {
  return (
    <div className="screen sin" data-screen-label="Journal" style={{ paddingTop:56, paddingBottom:90 }}>
      <div style={{ padding:'14px 24px 14px', borderBottom:'1px solid var(--rule)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1 className="df" style={{ fontSize:24, fontWeight:500, color:'var(--fg)' }}>Journal</h1>
          <button style={{ width:36, height:36, borderRadius:'50%', background:'var(--pri)',
            border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Ic n="plus" s={16} c="white" sw={2.5} />
          </button>
        </div>
        <p style={{ fontSize:13, color:'var(--fg2)', marginTop:4 }}>Dreams and words to keep</p>
      </div>
      <div style={{ padding:'4px 0' }}>
        {JOURNAL.map((entry, i) => (
          <div key={entry.id} style={{ padding:'20px 24px',
            borderBottom: i < JOURNAL.length-1 ? '1px solid var(--rule)' : 'none' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:9 }}>
              <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase',
                color: entry.type==='dream' ? 'var(--pri)' : 'var(--acc)' }}>
                {entry.type==='dream' ? 'Dream' : 'Word'}
              </span>
              <span style={{ fontSize:11, color:'var(--fg3)' }}>{entry.date}</span>
            </div>
            <p className={entry.type==='word' ? 'dfi' : undefined}
               style={{ fontSize: entry.type==='word' ? 18 : 15, color:'var(--fg)', lineHeight:1.65 }}>
              {entry.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ANSWERED / STONES — timeline ──────────────────────────────
function AnsweredScreen({ dark }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div className="screen sin" data-screen-label="Stones of Remembrance" style={{ paddingTop:56, paddingBottom:90 }}>
      <div style={{ padding:'14px 24px 14px', borderBottom:'1px solid var(--rule)' }}>
        <h1 className="df" style={{ fontSize:22, fontWeight:500, color:'var(--fg)' }}>Stones of Remembrance</h1>
        <p style={{ fontSize:13, color:'var(--fg2)', marginTop:4 }}>Answered prayers, kept close</p>
      </div>

      <div style={{ padding:'28px 24px', position:'relative' }}>
        {/* Ink rail */}
        <div style={{ position:'absolute', left:36, top:28, bottom:28, width:1.5,
          background:'var(--rule)', zIndex:0 }} />

        {ANSWERED.map((item, i) => {
          const open = expanded === item.id;
          return (
            <div key={item.id} style={{ display:'flex', gap:18, position:'relative',
              marginBottom: i < ANSWERED.length-1 ? 40 : 0 }}>

              {/* Stone marker on rail */}
              <div style={{ width:26, height:26, borderRadius:'50%', flexShrink:0, zIndex:1,
                background: open ? 'var(--pri)' : 'var(--bg)',
                border:`2px solid ${open ? 'var(--pri)' : 'var(--rule)'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                marginTop:4, transition:'all 280ms cubic-bezier(0.37,0,0.63,1)',
                boxShadow: open ? '0 0 0 4px var(--pri-shadow)' : 'none' }}>
                <div style={{ width:7, height:7, borderRadius:'50%',
                  background: open ? 'white' : 'var(--rule)',
                  transition:'background 280ms' }} />
              </div>

              {/* Content */}
              <div style={{ flex:1, cursor:'pointer' }}
                   onClick={() => setExpanded(open ? null : item.id)}>
                {/* Date */}
                <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em',
                  textTransform:'uppercase', color:'var(--fg3)', marginBottom:4 }}>
                  {item.date}
                </div>
                {/* Title */}
                <div style={{ fontSize:15, fontWeight:600, color:'var(--fg)',
                  lineHeight:1.4, marginBottom:10 }}>
                  {item.title}
                </div>
                {/* DAYS WAITED — hero number */}
                <div style={{ display:'flex', alignItems:'baseline', gap:5, marginBottom: open ? 14 : 4 }}>
                  <span className="df" style={{ fontSize:36, fontWeight:400,
                    color:'var(--pri)', lineHeight:1 }}>
                    {item.daysWaited}
                  </span>
                  <span style={{ fontSize:11, color:'var(--fg2)', fontWeight:500 }}>
                    days carried
                  </span>
                </div>
                {/* Testimony (expanded) */}
                {open ? (
                  <div style={{ animation:'sIn 200ms ease-out both' }}>
                    <p className="dfi" style={{ fontSize:14, color:'var(--fg2)', lineHeight:1.78 }}>
                      "{item.testimony}"
                    </p>
                  </div>
                ) : (
                  <p style={{ fontSize:11, color:'var(--fg3)' }}>Tap to read testimony →</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SCREEN ROUTER ─────────────────────────────────────────────
function ScreenView({ tab, onNav, onStartPray, dark, toggleDark }) {
  return (
    <>
      {tab==='home'     && <HomeScreen     key="home" onStartPray={onStartPray} onNav={onNav} dark={dark} toggleDark={toggleDark} />}
      {tab==='requests' && <RequestsScreen key="req"  dark={dark} />}
      {tab==='journal'  && <JournalScreen  key="jrn"  dark={dark} />}
      {tab==='answered' && <AnsweredScreen  key="ans"  dark={dark} />}
    </>
  );
}

Object.assign(window, { ScreenView, BottomNav });
