import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg:      "#060810",
  surf:    "#0c1018",
  card:    "#101622",
  border:  "rgba(255,255,255,0.055)",
  borderA: "rgba(255,255,255,0.11)",
  accent:  "#4fffb0",
  accentD: "rgba(79,255,176,0.08)",
  accentB: "rgba(79,255,176,0.2)",
  blue:    "#6366f1",
  blueD:   "rgba(99,102,241,0.1)",
  blueB:   "rgba(99,102,241,0.25)",
  text:    "rgba(255,255,255,0.93)",
  sub:     "rgba(255,255,255,0.46)",
  muted:   "rgba(255,255,255,0.18)",
  danger:  "#f87171",
  grad:    "linear-gradient(135deg,#4fffb0 0%,#6366f1 100%)",
  gradT:   "linear-gradient(135deg,rgba(79,255,176,0.15),rgba(99,102,241,0.15))",
};

// ─────────────────────────────────────────────────────────────────────────────
// PERSONAS
// ─────────────────────────────────────────────────────────────────────────────
const PERSONAS = [
  {
    key:"supportive", label:"Supportive", icon:"💛", tagline:"Always listening",
    color:"#fbbf24", dim:"rgba(251,191,36,0.1)", bd:"rgba(251,191,36,0.3)",
    desc:"Leads with empathy. Makes you feel heard before anything else.",
    prompt:`You are in SUPPORTIVE mode. Your entire approach centres on emotional warmth and making the student feel deeply heard. Before offering any advice or solution, always acknowledge their feelings genuinely. Ask caring questions like "How does that make you feel?" or "What do you need right now?" Validate their experiences without judgment. Celebrate even small wins enthusiastically. Sit with them in their feelings — never rush to fix. Be unconditionally warm, soft, and present.`,
  },
  {
    key:"hardworking", label:"Hard Working", icon:"💪", tagline:"Push your limits",
    color:"#fb923c", dim:"rgba(251,146,60,0.1)", bd:"rgba(251,146,60,0.3)",
    desc:"Motivational coach energy. Holds you to your potential.",
    prompt:`You are in HARD WORKING mode. You are a motivational coach — driven, energetic, and results-focused. You respect the student's potential and hold them to it. Help them set clear goals, break tasks into steps, and push through resistance. Ask "What's actually stopping you?" and help them answer it honestly. Celebrate effort and progress, not just results. Be direct, uplifting, and slightly intense in a healthy way. Never let them give up easily without exploring why.`,
  },
  {
    key:"teacher", label:"Teacher", icon:"📖", tagline:"Let's understand it together",
    color:"#818cf8", dim:"rgba(129,140,248,0.1)", bd:"rgba(129,140,248,0.3)",
    desc:"Patient and clear. Guides you to understand, not just get answers.",
    prompt:`You are in TEACHER mode. You are patient, knowledgeable, and deeply passionate about understanding. Guide students to think rather than just giving answers. Use Socratic questions: "What do you already know about this?" "What do you think happens next?" Break complex ideas into simple steps. Use analogies and real-world examples. Never make anyone feel dumb — curiosity is always celebrated. If something isn't clear, explain it a different way. Stay calm, methodical, and genuinely excited about ideas.`,
  },
  {
    key:"parent", label:"Parent", icon:"🏡", tagline:"I'm proud of you, always",
    color:"#34d399", dim:"rgba(52,211,153,0.1)", bd:"rgba(52,211,153,0.25)",
    desc:"Warm, wise, honest. The grounded guidance of a caring parent.",
    prompt:`You are in PARENT mode. You are a warm, wise, grounding presence — like a loving and honest parent. Listen deeply and offer steady perspective. Challenge the student gently when needed, always from a place of love. Be honest even when it's uncomfortable. Occasionally share unprompted wisdom — the kind of thing a thoughtful parent might say at the dinner table. Hold firm on important things with kindness. Remind the student of their worth. Be grounded, safe, and unconditionally caring.`,
  },
  {
    key:"companion", label:"Companion", icon:"🤝", tagline:"We're in this together",
    color:"#f472b6", dim:"rgba(244,114,182,0.1)", bd:"rgba(244,114,182,0.3)",
    desc:"Friendly and real. Like a trusted older friend who truly gets it.",
    prompt:`You are in COMPANION mode. You are friendly, relatable, and genuinely fun — like a trusted older sibling who also happens to be wise. Use casual, natural language. Share in the student's excitement, frustration, and humour. Use light humour when appropriate. Be honest but never preachy. Relate to what they're going through. Say things like "Oh I totally get that" or "Okay here's what I'd honestly do..." Be warm, real, and easy-going.`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────
const MOODS = [
  {emoji:"😊",label:"Good"},{emoji:"😐",label:"Okay"},
  {emoji:"😟",label:"Stressed"},{emoji:"😢",label:"Upset"},{emoji:"🤔",label:"Confused"},
];
const TOPICS = [
  {icon:"📚",label:"Homework Help"},{icon:"💬",label:"Something Personal"},
  {icon:"😰",label:"Feeling Stressed"},{icon:"🤝",label:"Friend Problems"},
  {icon:"🏠",label:"Family Stuff"},{icon:"🎯",label:"My Future"},
];
const TIPS = [
  {icon:"🍅",t:"Pomodoro",d:"25 min focus, 5 min break. Four rounds, then rest longer."},
  {icon:"🧠",t:"Active Recall",d:"Close the book. Write what you remember. Gaps reveal what to study."},
  {icon:"📅",t:"Spaced Repetition",d:"Review at 1 day, 3 days, 1 week. Each pass deepens memory."},
  {icon:"💡",t:"Feynman Method",d:"Explain it simply as if to a child. Can't? That's exactly what to study."},
  {icon:"🗺️",t:"Mind Mapping",d:"Draw connections between ideas. Great for complex, linked topics."},
  {icon:"😴",t:"Sleep Over Cramming",d:"Sleep consolidates memory far better than any all-nighter."},
];
const PROMPTS = [
  "What's one thing that went well today, however small?",
  "What's on your mind right now that you haven't said out loud?",
  "Who is someone you're grateful for — and have you told them?",
  "What's something you wish people understood about you?",
  "Describe a challenge you overcame. What did it teach you?",
  "What would your ideal week look like?",
  "What's one thing you're genuinely proud of this week?",
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
const fmtDate = () => new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
const fmtSecs = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

const clean = raw => raw
  .replace(/\*\*(.+?)\*\*/gs,"$1").replace(/\*(.+?)\*/gs,"$1")
  .replace(/^#{1,6}\s+/gm,"").replace(/__(.+?)__/gs,"$1")
  .replace(/_(.+?)_/gs,"$1").replace(/^[\s]*[-•]\s+/gm,"").trim();

const nl = text => text.split("\n").map((l,i,a)=><span key={i}>{l}{i<a.length-1&&<br/>}</span>);

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE (for memory feature)
// ─────────────────────────────────────────────────────────────────────────────
const MK = name => "gm_"+(name||"u").replace(/\W/g,"_").toLowerCase();
const loadMems = async k => { try{ const r=await window.storage.get(MK(k)); return r?JSON.parse(r.value):[]; }catch{return[];} };
const saveMems = async (k,m) => { try{ await window.storage.set(MK(k),JSON.stringify(m)); }catch{} };

// ─────────────────────────────────────────────────────────────────────────────
// CLAUDE API
// ─────────────────────────────────────────────────────────────────────────────
const H = {"Content-Type":"application/json","anthropic-dangerous-direct-browser-calls":"true"};

async function askClaude(msgs, sys) {
  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST", headers:H,
    body:JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens:1024,
      system: sys,
      messages: msgs.map(m=>({role:m.role,content:m.content})),
    }),
  });
  if(!res.ok){ const e=await res.text(); throw new Error(e); }
  const d = await res.json();
  if(d.error) throw new Error(d.error.message);
  return (d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("")||"";
}

async function extractMemories(msgs, existing) {
  const tail = msgs.slice(-12).map(m=>(m.role==="user"?"Student: ":"Guardian: ")+m.content).join("\n\n");
  const ex = existing.length ? existing.map(m=>"- "+m.text).join("\n") : "None yet.";
  try {
    const raw = await askClaude(
      [{role:"user",content:`Existing memories:\n${ex}\n\nConversation:\n${tail}`}],
      `You extract memorable personal facts from student conversations. Extract only genuinely reusable personal facts: names of friends/family/teachers, subjects they love or struggle with, hobbies, goals, recurring worries, significant life events. Do NOT extract vague emotions or one-off statements. Do NOT duplicate anything already in existing memories. Return ONLY a raw JSON array of short strings in third person (e.g. ["Has a friend named Maya","Wants to study medicine"]). If nothing worth remembering, return [].`
    );
    const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
    if(!Array.isArray(parsed)) return [];
    return parsed.filter(f=>typeof f==="string"&&f.length>2).map(text=>({id:Date.now()+Math.random(),text,date:fmtDate()}));
  } catch{ return []; }
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────────────────
const buildSys = (name, mood, persona, mems) => {
  const p = PERSONAS.find(x=>x.key===persona)||PERSONAS[3];
  const memBlock = mems?.length
    ? `\nYOU REMEMBER THESE FACTS ABOUT THIS STUDENT — weave them in naturally when relevant, never robotically list them:\n${mems.map(m=>"- "+m.text).join("\n")}\n`
    : "";
  return `You are GuardianGPT — a trusted AI companion built specifically for students. You are warm, wise, honest, and always in the student's corner.

STUDENT'S NAME: ${name||"the student"}. Use their name occasionally in conversation — naturally, not every single message.
${mood?`STUDENT'S CURRENT MOOD: ${mood.label} ${mood.emoji}. Keep this in mind throughout your response.`:""}
${memBlock}
${p.prompt}

CRITICAL FORMATTING RULES — follow these exactly:
- Never use asterisks, stars, or any markdown symbols (*,**,#,##,_,__)
- Never use bullet points or dashes at the start of lines
- Write in natural, flowing prose — like a real human would speak and write
- For lists, write them as part of a sentence or use numbered format only when clearly listing steps
- No bold, no italics, no headers via symbols — just clean plain text

CRITICAL LANGUAGE RULE — spell/typo correction:
Students often make spelling mistakes. Silently understand and respond to what they meant. Examples: "lide"=life, "scool"=school, "teecher"=teacher, "sucsess"=success. Never point out the error — just respond to the intended meaning naturally.

RESPONSE QUALITY:
- Always give a full, thoughtful, genuinely helpful response
- Match response length to the question — short questions can get short answers, emotional or complex topics deserve more
- For emotional topics: acknowledge feelings first, then gently offer perspective
- For academic questions: guide understanding, don't just hand over answers
- For difficult decisions: help them think through consequences, share your honest view
- End every difficult conversation with warmth and care
- Never leave anyone feeling judged, dismissed, or alone

FIRM LIMITS (always, enforced with kindness):
- Will not assist with self-harm or harming others — redirect to real support with care
- Will not help cheat on academic work — explain why and offer legitimate help instead
- Will not produce age-inappropriate content
- When declining anything, always explain warmly and offer an alternative path forward

You are GuardianGPT. You always show up. You always care.`;
};

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL CSS
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@keyframes fadeUp  {from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn  {from{opacity:0}to{opacity:1}}
@keyframes scaleIn {from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}
@keyframes blink   {0%,100%{opacity:0.15}50%{opacity:1}}
@keyframes vbar    {0%,100%{height:3px}50%{height:14px}}
@keyframes spin    {to{transform:rotate(360deg)}}
@keyframes float   {0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes ripple  {from{opacity:0.6;transform:scale(0.5)}to{opacity:0;transform:scale(1.8)}}
@keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes pill    {from{opacity:0;transform:scale(0.75)}to{opacity:1;transform:scale(1)}}
@keyframes slideUp {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;font-family:'Inter','Segoe UI',system-ui,sans-serif;background:#060810}
input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.2)}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:3px}
::-webkit-scrollbar-track{background:transparent}
button{font-family:'Inter','Segoe UI',system-ui,sans-serif}
`;

// ─────────────────────────────────────────────────────────────────────────────
// MICRO COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const Btn = ({ch,variant="primary",full,dis,sx={},onClick,title})=>{
  const base={display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,padding:"11px 22px",fontSize:14,fontWeight:600,borderRadius:10,cursor:dis?"not-allowed":"pointer",border:"none",transition:"all 0.15s",letterSpacing:"0.01em",width:full?"100%":undefined,opacity:dis?0.4:1,...sx};
  const vs={
    primary:{background:C.grad,color:"#060810"},
    ghost:  {background:"rgba(255,255,255,0.05)",color:C.sub,border:`1px solid ${C.border}`},
    outline:{background:"transparent",color:C.accent,border:`1px solid ${C.accentB}`},
    danger: {background:"rgba(248,113,113,0.07)",color:C.danger,border:"1px solid rgba(248,113,113,0.2)"},
    flat:   {background:"none",border:"none",color:C.muted,padding:"4px 0"},
  };
  return <button title={title} disabled={dis} style={{...base,...vs[variant]}} onClick={onClick}
    onMouseEnter={e=>{if(!dis){e.currentTarget.style.opacity="0.78";e.currentTarget.style.transform="translateY(-1px)";}}}
    onMouseLeave={e=>{e.currentTarget.style.opacity=dis?"0.4":"1";e.currentTarget.style.transform="translateY(0)"}}
  >{ch}</button>;
};

const Toggle = ({on,onChange})=>(
  <div onClick={()=>onChange(!on)} style={{width:42,height:22,borderRadius:11,background:on?C.accent:"rgba(255,255,255,0.1)",cursor:"pointer",position:"relative",flexShrink:0,transition:"background 0.22s",border:`1px solid ${on?C.accentB:C.border}`}}>
    <div style={{position:"absolute",top:2,left:on?21:2,width:16,height:16,borderRadius:"50%",background:on?"#060810":"rgba(255,255,255,0.4)",transition:"left 0.22s",boxShadow:"0 1px 4px rgba(0,0,0,0.4)"}}/>
  </div>
);

const Spinner = ({size=14,color="rgba(0,0,0,0.6)"})=>(
  <div style={{width:size,height:size,borderRadius:"50%",border:`2px solid ${color}`,borderTopColor:"transparent",animation:"spin 0.65s linear infinite"}}/>
);

// ─────────────────────────────────────────────────────────────────────────────
// DISCLAIMER
// ─────────────────────────────────────────────────────────────────────────────
function Disclaimer({name,onAccept}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",backdropFilter:"blur(12px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:C.surf,border:`1px solid ${C.borderA}`,borderRadius:20,maxWidth:460,width:"100%",padding:"34px 28px",animation:"scaleIn 0.22s ease"}}>
        <div style={{display:"flex",gap:13,alignItems:"center",marginBottom:22}}>
          <div style={{width:44,height:44,borderRadius:12,background:C.accentD,border:`1px solid ${C.accentB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,flexShrink:0}}>🛡️</div>
          <div>
            <p style={{color:C.text,fontSize:16,fontWeight:700}}>Before we begin{name?`, ${name.split(" ")[0]}`:""}</p>
            <p style={{color:C.sub,fontSize:12,marginTop:2}}>Please read this carefully</p>
          </div>
        </div>
        <div style={{background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:11,padding:"13px 15px",marginBottom:18}}>
          <p style={{color:"#fbbf24",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:7}}>⚠ Important</p>
          <p style={{color:"rgba(255,255,255,0.72)",fontSize:13,lineHeight:1.72}}>GuardianGPT is an <strong style={{color:C.text}}>artificial intelligence</strong> — not a real parent, therapist, or guardian. It is designed to support and guide, but it <strong style={{color:C.text}}>cannot replace human care or professional help.</strong></p>
        </div>
        {[["💛","My responses are thoughtful, but they may not always reflect your full situation. Use your own judgment too."],["👨‍👩‍👧","For anything serious — mental health, family crises, or emergencies — please speak to a trusted adult or professional."],["🔒","This is a private, judgment-free space. Be mindful about what personal information you share."]].map(([icon,text])=>(
          <div key={icon} style={{display:"flex",gap:11,alignItems:"flex-start",marginBottom:11}}>
            <span style={{fontSize:14,marginTop:2,flexShrink:0}}>{icon}</span>
            <p style={{color:C.sub,fontSize:13,lineHeight:1.65}}>{text}</p>
          </div>
        ))}
        <Btn ch="I understand — let's go" variant="primary" full sx={{marginTop:18,fontSize:15,padding:"13px"}} onClick={onAccept}/>
        <p style={{color:C.muted,fontSize:11,textAlign:"center",marginTop:11,lineHeight:1.5}}>By continuing you acknowledge GuardianGPT is an AI, not a licensed therapist or parent.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSONA PICKER
// ─────────────────────────────────────────────────────────────────────────────
function PersonaPicker({name,onPick}){
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{width:"100%",maxWidth:540,animation:"fadeUp 0.4s ease"}}>
        <div style={{textAlign:"center",marginBottom:34}}>
          <div style={{width:56,height:56,borderRadius:15,background:C.accentD,border:`1px solid ${C.accentB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 16px",animation:"float 4s ease-in-out infinite"}}>🛡️</div>
          <h1 style={{color:C.text,fontSize:22,fontWeight:800,letterSpacing:"-0.02em",margin:"0 0 8px"}}>Choose your Guardian mode</h1>
          <p style={{color:C.sub,fontSize:14,lineHeight:1.6}}>Hi {name||"there"} — how would you like me to show up?<br/>You can switch anytime in Settings.</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {PERSONAS.map((p,i)=>(
            <button key={p.key} onClick={()=>onPick(p.key)}
              style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"17px 18px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14,transition:"all 0.17s",animation:`slideUp 0.35s ${i*0.06}s ease both`,opacity:0}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=p.bd;e.currentTarget.style.background=p.dim;e.currentTarget.style.transform="translateY(-1px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card;e.currentTarget.style.transform="translateY(0)";}}>
              <div style={{width:44,height:44,borderRadius:12,background:p.dim,border:`1px solid ${p.bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,flexShrink:0}}>{p.icon}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <span style={{color:C.text,fontSize:15,fontWeight:700}}>{p.label}</span>
                  <span style={{color:p.color,fontSize:11,fontWeight:600,background:p.dim,border:`1px solid ${p.bd}`,borderRadius:20,padding:"1px 9px"}}>{p.tagline}</span>
                </div>
                <p style={{color:C.sub,fontSize:13,lineHeight:1.5,margin:0}}>{p.desc}</p>
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ))}
        </div>
      </div>
      <style>{CSS}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App(){
  // onboarding
  const [screen,setScreen]   = useState("name"); // name | persona | app
  const [userName,setUserName] = useState("");
  const [nameInput,setNameInput] = useState("");
  const [persona,setPersona] = useState(null);
  const [showDisc,setShowDisc] = useState(false);

  // chat
  const [msgs,setMsgs]       = useState([]);
  const [input,setInput]     = useState("");
  const [busy,setBusy]       = useState(false);
  const [mood,setMood]       = useState(null);
  const [moodPicker,setMoodPicker] = useState(true);

  // navigation
  const [tab,setTab]         = useState("chat");

  // journal
  const [jEntries,setJEntries] = useState([]);
  const [jText,setJText]     = useState("");
  const [jIdx,setJIdx]       = useState(0);

  // study timer
  const [tSecs,setTSecs]     = useState(25*60);
  const [tOn,setTOn]         = useState(false);
  const [tMode,setTMode]     = useState("focus");
  const [pomos,setPomos]     = useState(0);

  // stats
  const [totalMsgs,setTotalMsgs] = useState(0);
  const [streak]             = useState(4);

  // voice
  const [listening,setListening] = useState(false);
  const [voiceErr,setVoiceErr]   = useState("");
  const recRef                   = useRef(null);

  // memory
  const [memOn,setMemOn]     = useState(false);
  const [mems,setMems]       = useState([]);
  const [memSaving,setMemSaving] = useState(false);

  const endRef   = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const AP       = PERSONAS.find(p=>p.key===persona)||PERSONAS[3];

  // ── effects ────────────────────────────────────────────────────────────────
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,busy]);

  useEffect(()=>{
    if(screen==="app"&&persona&&msgs.length===0){
      const n=userName||"there";
      const w={
        supportive: `Hey ${n} — I'm really glad you're here. 💛\n\nThis is your space. No pressure, no judgment. I'm just here to listen and be with you. How are you feeling today?`,
        hardworking:`Hey ${n}! Ready to make today count? 💪\n\nI'm here to help you push through whatever's in your way — tough assignments, big goals, or just finding your momentum. What are we working on?`,
        teacher:    `Hello ${n}! Really great to meet you.\n\nI'm here for every question — no matter how big or small, and definitely no matter how "silly" you think it is. There's no such thing as a bad question. What's on your mind?`,
        parent:     `Hi ${n}, I'm so glad you're here today.\n\nThink of me as someone always in your corner — honest with you, but always from a place of genuine care. Nothing is too big or too small to talk about. How are you doing?`,
        companion:  `Hey ${n}! So glad you're here. 🤝\n\nI'm your go-to for pretty much anything — venting, homework, life questions, big feelings, or just a solid chat. No topic is off limits. What's going on?`,
      };
      setMsgs([{role:"assistant",content:w[persona]||w.parent}]);
    }
  },[screen,persona]);

  useEffect(()=>{
    if(userName) loadMems(userName).then(m=>setMems(m));
  },[userName]);

  useEffect(()=>{
    if(tOn){
      timerRef.current=setInterval(()=>{
        setTSecs(s=>{
          if(s<=1){
            clearInterval(timerRef.current); setTOn(false);
            if(tMode==="focus"){setPomos(p=>p+1);setTMode("break");setTSecs(5*60);}
            else{setTMode("focus");setTSecs(25*60);}
            return 0;
          }
          return s-1;
        });
      },1000);
    } else clearInterval(timerRef.current);
    return()=>clearInterval(timerRef.current);
  },[tOn,tMode]);

  // ── send message ──────────────────────────────────────────────────────────
  const send = async(text)=>{
    const txt=(text||input).trim(); if(!txt||busy) return;
    setInput(""); setMoodPicker(false);
    const next=[...msgs,{role:"user",content:txt}];
    setMsgs(next); setBusy(true); setTotalMsgs(n=>n+1);
    try{
      const raw = await askClaude(next, buildSys(userName,mood,persona,memOn?mems:[]));
      const reply = clean(raw);
      const full = [...next,{role:"assistant",content:reply||"I'm here — could you say that again?"}];
      setMsgs(full);
      // background memory extraction every 4 user messages
      if(memOn&&full.filter(m=>m.role==="user").length%4===0){
        setMemSaving(true);
        extractMemories(full,mems).then(newF=>{
          if(newF.length){
            const updated=[...mems,...newF];
            setMems(updated); saveMems(userName,updated);
          }
          setMemSaving(false);
        }).catch(()=>setMemSaving(false));
      }
    }catch(e){
      console.error(e);
      setMsgs(p=>[...p,{role:"assistant",content:"Something went wrong on my end — please try again in a moment. I'm still here."}]);
    }finally{
      setBusy(false);
      setTimeout(()=>inputRef.current?.focus(),80);
    }
  };

  // ── voice ─────────────────────────────────────────────────────────────────
  const startVoice=()=>{
    setVoiceErr("");
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return setVoiceErr("Voice input isn't supported in this browser. Try Chrome or Safari.");
    const r=new SR(); r.continuous=false; r.interimResults=true; r.lang="en-US";
    r.onstart=()=>setListening(true);
    r.onresult=e=>setInput(Array.from(e.results).map(r=>r[0].transcript).join(""));
    r.onerror=e=>{setVoiceErr(e.error==="not-allowed"?"Mic access denied — allow it in browser settings and try again.":"Couldn't hear you clearly — please try again.");setListening(false);};
    r.onend=()=>setListening(false);
    recRef.current=r; r.start();
  };
  const stopVoice=()=>{recRef.current?.stop();setListening(false);};

  // ── memory helpers ────────────────────────────────────────────────────────
  const toggleMem=async val=>{ setMemOn(val); if(val&&!mems.length){ const m=await loadMems(userName); setMems(m); } };
  const delMem=async id=>{ const u=mems.filter(m=>m.id!==id); setMems(u); saveMems(userName,u); };
  const clearAllMems=async()=>{ setMems([]); saveMems(userName,[]); };

  // ── SCREEN: name entry ────────────────────────────────────────────────────
  if(screen==="name") return(
    <div style={{height:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Inter',system-ui,sans-serif",overflow:"hidden",position:"relative"}}>
      {/* Background glow orbs */}
      <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(79,255,176,0.06),transparent 70%)",top:-100,left:"50%",transform:"translateX(-50%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.05),transparent 70%)",bottom:0,right:0,pointerEvents:"none"}}/>

      <div style={{width:"100%",maxWidth:420,textAlign:"center",position:"relative",zIndex:1,animation:"fadeUp 0.5s ease"}}>
        {/* Logo mark */}
        <div style={{position:"relative",width:80,height:80,margin:"0 auto 28px"}}>
          <div style={{position:"absolute",inset:-18,borderRadius:"50%",border:`1px solid rgba(79,255,176,0.15)`,animation:"ripple 3s ease-out infinite"}}/>
          <div style={{position:"absolute",inset:-10,borderRadius:"50%",border:`1px solid rgba(79,255,176,0.1)`,animation:"ripple 3s 0.8s ease-out infinite"}}/>
          <div style={{width:80,height:80,borderRadius:20,background:C.gradT,border:`1px solid ${C.accentB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,boxShadow:"0 0 50px rgba(79,255,176,0.1)",animation:"float 4s ease-in-out infinite"}}>🛡️</div>
        </div>

        <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(79,255,176,0.07)",border:`1px solid ${C.accentB}`,borderRadius:100,padding:"5px 14px",marginBottom:22}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:C.accent,animation:"blink 2s infinite"}}/>
          <span style={{color:C.accent,fontSize:11,fontWeight:600,letterSpacing:"0.1em"}}>ALWAYS IN YOUR CORNER</span>
        </div>

        <h1 style={{color:C.text,fontSize:"clamp(28px,5vw,40px)",fontWeight:800,letterSpacing:"-0.03em",lineHeight:1.1,margin:"0 0 10px"}}>
          Your personal<br/>
          <span style={{background:C.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundSize:"200% 200%",animation:"gradShift 4s ease infinite"}}>AI guardian.</span>
        </h1>
        <p style={{color:C.sub,fontSize:15,lineHeight:1.65,margin:"0 0 40px"}}>A safe space to talk through anything — homework, stress, friendships, life. No judgment. No lectures.</p>

        <div style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:16,padding:"24px 22px"}}>
          <p style={{color:C.sub,fontSize:13,marginBottom:14,fontWeight:500}}>What should I call you?</p>
          <input value={nameInput} onChange={e=>setNameInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"&&nameInput.trim()){ setUserName(nameInput.trim()); setShowDisc(true); setScreen("persona"); } }}
            placeholder="Your first name..." maxLength={30}
            style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:10,padding:"13px 15px",color:C.text,fontSize:16,fontFamily:"inherit",outline:"none",marginBottom:14,transition:"border-color 0.2s",boxSizing:"border-box"}}
            onFocus={e=>e.target.style.borderColor=C.accentB} onBlur={e=>e.target.style.borderColor=C.border}
          />
          <Btn ch="Get started →" variant="primary" full sx={{fontSize:15,padding:"13px"}}
            dis={!nameInput.trim()} onClick={()=>{ if(nameInput.trim()){ setUserName(nameInput.trim()); setShowDisc(true); setScreen("persona"); } }}/>
        </div>

        <div style={{display:"flex",gap:24,justifyContent:"center",marginTop:30,flexWrap:"wrap"}}>
          {[["🔒","Private"],["💛","Judgment-free"],["🎓","Student-first"],["🆓","100% Free"]].map(([icon,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontSize:18}}>{icon}</div>
              <div style={{color:C.muted,fontSize:11,marginTop:4,fontWeight:500}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{CSS}</style>
    </div>
  );

  // ── SCREEN: persona picker ────────────────────────────────────────────────
  if(screen==="persona") return(
    <>
      {showDisc&&<Disclaimer name={userName} onAccept={()=>setShowDisc(false)}/>}
      <PersonaPicker name={userName} onPick={k=>{setPersona(k);setScreen("app");}}/>
    </>
  );

  // ── SCREEN: main app ──────────────────────────────────────────────────────
  const TABS=[
    {key:"chat",   icon:"💬",label:"Chat"},
    {key:"journal",icon:"📓",label:"Journal"},
    {key:"study",  icon:"⏱", label:"Study"},
    {key:"progress",icon:"📈",label:"Progress"},
    {key:"settings",icon:"⚙️",label:"Settings"},
  ];

  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:C.bg,fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",overflow:"hidden"}}>
      <style>{CSS}</style>
      {showDisc&&<Disclaimer name={userName} onAccept={()=>setShowDisc(false)}/>}

      {/* ── TOP BAR ── */}
      <header style={{height:54,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",borderBottom:`1px solid ${C.border}`,background:C.surf}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:8,background:AP.dim,border:`1px solid ${AP.bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🛡️</div>
          <div>
            <span style={{color:C.text,fontSize:14,fontWeight:700}}>GuardianGPT</span>
            <span style={{color:AP.color,fontSize:11,marginLeft:8,background:AP.dim,border:`1px solid ${AP.bd}`,borderRadius:20,padding:"1px 8px",fontWeight:600}}>{AP.icon} {AP.label}</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          {!memOn&&<span style={{color:C.muted,fontSize:11}}>🔥 {streak}d</span>}
          {memOn&&<span style={{color:C.accent,fontSize:11,background:C.accentD,border:`1px solid ${C.accentB}`,borderRadius:20,padding:"2px 9px",fontWeight:500}}>🧠 {mems.length} mem{mems.length!==1?"s":""}</span>}
          <Btn ch="Switch" variant="ghost" sx={{padding:"5px 10px",fontSize:12}} onClick={()=>{setPersona(null);setMsgs([]);setMoodPicker(true);setScreen("persona");}}/>
          <Btn ch="New chat" variant="ghost" sx={{padding:"5px 10px",fontSize:12}} onClick={()=>{setMsgs([]);setMoodPicker(true);setMood(null);}}/>
        </div>
      </header>

      {/* ── TAB BAR ── */}
      <div style={{flexShrink:0,display:"flex",borderBottom:`1px solid ${C.border}`,background:C.surf,overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{padding:"0 14px",height:40,background:"none",border:"none",cursor:"pointer",color:tab===t.key?AP.color:C.sub,borderBottom:tab===t.key?`2px solid ${AP.color}`:"2px solid transparent",fontSize:12,fontWeight:tab===t.key?600:400,display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap",transition:"color 0.15s",fontFamily:"inherit"}}>
            <span style={{fontSize:13}}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>

        {/* ════ CHAT TAB ════ */}
        {tab==="chat"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

            {/* Memory status strip */}
            <div style={{flexShrink:0,padding:"5px 16px",borderBottom:`1px solid ${C.border}`,background:"rgba(255,255,255,0.015)",display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:memOn?"#4ade80":C.muted,boxShadow:memOn?"0 0 5px #4ade80":"none",flexShrink:0}}/>
              <span style={{color:memOn?"#4ade80":C.muted,fontSize:11,fontWeight:500}}>
                {memOn?`Memory on · ${mems.length} fact${mems.length!==1?"s":""} remembered`:"Memory off · each session is fresh"}
              </span>
              {memSaving&&<span style={{marginLeft:"auto",color:C.muted,fontSize:11,display:"flex",alignItems:"center",gap:5}}><Spinner size={10} color="rgba(255,255,255,0.3)"/>saving...</span>}
              <button onClick={()=>setTab("settings")} style={{marginLeft:memSaving?"4px":"auto",background:"none",border:"none",color:C.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit",textDecoration:"underline"}}>{memOn?"manage":"turn on"}</button>
            </div>

            {/* Messages */}
            <div style={{flex:1,overflowY:"auto",padding:"18px 16px 8px",display:"flex",flexDirection:"column",gap:16}}>
              {msgs.map((m,i)=>(
                <div key={i} style={{display:"flex",flexDirection:m.role==="user"?"row-reverse":"row",alignItems:"flex-end",gap:9,animation:"fadeUp 0.25s ease"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:m.role==="assistant"?AP.dim:"rgba(255,255,255,0.05)",border:`1px solid ${m.role==="assistant"?AP.bd:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>
                    {m.role==="assistant"?"🛡️":"👤"}
                  </div>
                  <div style={{maxWidth:"78%",background:m.role==="user"?C.accentD:C.card,border:`1px solid ${m.role==="user"?C.accentB:C.border}`,borderRadius:m.role==="user"?"15px 3px 15px 15px":"3px 15px 15px 15px",padding:"11px 14px",color:C.text,fontSize:14.5,lineHeight:1.78,wordBreak:"break-word"}}>
                    {nl(m.content)}
                  </div>
                </div>
              ))}

              {/* Mood picker */}
              {moodPicker&&msgs.length===1&&(
                <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 18px",animation:"fadeUp 0.3s 0.1s ease both"}}>
                  <p style={{color:C.sub,fontSize:13,textAlign:"center",marginBottom:13}}>How are you feeling right now?</p>
                  <div style={{display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap"}}>
                    {MOODS.map(m=>(
                      <button key={m.label} onClick={()=>{setMood(m);setMoodPicker(false);send(`I'm feeling ${m.label} today ${m.emoji}`);}}
                        style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",cursor:"pointer",color:C.sub,fontSize:13,display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all 0.14s",fontFamily:"inherit"}}
                        onMouseEnter={e=>{e.currentTarget.style.background=AP.dim;e.currentTarget.style.borderColor=AP.bd;e.currentTarget.style.color=AP.color;}}
                        onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.sub;}}>
                        <span style={{fontSize:21}}>{m.emoji}</span><span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick topics */}
              {!moodPicker&&msgs.length<=2&&(
                <div style={{animation:"fadeUp 0.3s ease"}}>
                  <p style={{color:C.muted,fontSize:11,marginBottom:8,fontWeight:500}}>Tap a topic to get started:</p>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {TOPICS.map(t=>(
                      <button key={t.label} onClick={()=>send(`I'd like to talk about: ${t.label}`)}
                        style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 11px",cursor:"pointer",color:C.sub,fontSize:12,display:"flex",gap:5,alignItems:"center",transition:"all 0.14s",fontFamily:"inherit"}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=AP.bd;e.currentTarget.style.color=AP.color;}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.sub;}}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {busy&&(
                <div style={{display:"flex",alignItems:"flex-end",gap:9,animation:"fadeIn 0.2s ease"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:AP.dim,border:`1px solid ${AP.bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🛡️</div>
                  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"3px 15px 15px 15px",padding:"13px 16px",display:"flex",gap:5,alignItems:"center"}}>
                    {[0,0.15,0.3].map((d,i)=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:AP.color,animation:`blink 1.1s ${d}s ease-in-out infinite`}}/>)}
                  </div>
                </div>
              )}
              <div ref={endRef}/>
            </div>

            {/* Input bar */}
            <div style={{flexShrink:0,padding:"10px 16px 16px",borderTop:`1px solid ${C.border}`,background:C.surf}}>
              {voiceErr&&(
                <div style={{background:"rgba(248,113,113,0.06)",border:"1px solid rgba(248,113,113,0.18)",borderRadius:9,padding:"8px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:13}}>⚠</span>
                  <span style={{color:C.danger,fontSize:12,flex:1}}>{voiceErr}</span>
                  <button onClick={()=>setVoiceErr("")} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>×</button>
                </div>
              )}
              {listening&&(
                <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:8,padding:"8px 12px",background:AP.dim,border:`1px solid ${AP.bd}`,borderRadius:9}}>
                  <div style={{display:"flex",gap:3,alignItems:"center",height:18}}>
                    {[0,0.1,0.2,0.3,0.4].map((d,i)=><div key={i} style={{width:3,borderRadius:3,background:AP.color,animation:`vbar 0.75s ${d}s ease-in-out infinite`,minHeight:3}}/>)}
                  </div>
                  <span style={{color:AP.color,fontSize:12,fontWeight:600}}>Listening — speak now</span>
                  <button onClick={stopVoice} style={{marginLeft:"auto",background:"rgba(255,255,255,0.07)",border:`1px solid ${C.border}`,borderRadius:6,padding:"3px 9px",color:C.sub,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Stop</button>
                </div>
              )}
              <div style={{display:"flex",gap:7,alignItems:"flex-end"}}>
                {/* Mic button */}
                <button onClick={listening?stopVoice:startVoice} disabled={busy} title={listening?"Stop recording":"Speak your message"}
                  style={{width:38,height:38,borderRadius:9,border:"none",cursor:busy?"not-allowed":"pointer",background:listening?AP.color:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.18s",boxShadow:listening?`0 0 0 4px ${AP.dim}`:"none"}}>
                  {listening
                    ?<svg width="12" height="12" viewBox="0 0 24 24" fill="#060810"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                    :<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="11" rx="3" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/><path d="M5 11a7 7 0 0 0 14 0" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="18" x2="12" y2="22" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"/><line x1="9" y1="22" x2="15" y2="22" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"/></svg>
                  }
                </button>
                {/* Text input */}
                <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
                  placeholder={listening?"Your words appear here...":"Message GuardianGPT..."} rows={1}
                  style={{flex:1,background:"rgba(255,255,255,0.04)",border:`1px solid ${listening?AP.bd:C.border}`,borderRadius:11,padding:"11px 13px",color:C.text,fontSize:14,fontFamily:"inherit",resize:"none",outline:"none",lineHeight:1.6,maxHeight:110,transition:"border-color 0.2s",scrollbarWidth:"none"}}
                  onFocus={e=>e.target.style.borderColor=C.accentB} onBlur={e=>{if(!listening)e.target.style.borderColor=C.border;}}
                  onInput={e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,110)+"px";}}
                />
                {/* Send button */}
                <button onClick={()=>send()} disabled={!input.trim()||busy}
                  style={{width:38,height:38,borderRadius:9,border:"none",cursor:input.trim()&&!busy?"pointer":"not-allowed",background:input.trim()&&!busy?C.grad:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                  {busy?<Spinner size={13} color={input.trim()?"#060810":"rgba(255,255,255,0.3)"}/>
                  :<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13" stroke={input.trim()&&!busy?"#060810":"rgba(255,255,255,0.2)"} strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={input.trim()&&!busy?"#060810":"rgba(255,255,255,0.2)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>}
                </button>
              </div>
              <p style={{color:C.muted,fontSize:10,textAlign:"center",marginTop:7,lineHeight:1.5}}>{listening?"Tap the square to stop, then press send":"Type or tap the mic · For serious issues, please speak to a trusted adult"}</p>
            </div>
          </div>
        )}

        {/* ════ JOURNAL TAB ════ */}
        {tab==="journal"&&(
          <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h2 style={{color:C.text,fontSize:17,fontWeight:700}}>My Journal</h2>
              <span style={{color:C.muted,fontSize:12}}>{jEntries.length} entries</span>
            </div>
            {/* Prompt card */}
            <div style={{background:C.card,border:`1px solid ${C.accentB}`,borderRadius:14,padding:"16px 18px",boxShadow:"0 0 24px rgba(79,255,176,0.05)"}}>
              <p style={{color:C.muted,fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>✦ Today's prompt</p>
              <p style={{color:C.text,fontSize:14,lineHeight:1.7,marginBottom:12}}>"{PROMPTS[jIdx%PROMPTS.length]}"</p>
              <Btn ch="Next prompt →" variant="ghost" sx={{padding:"5px 12px",fontSize:12}} onClick={()=>setJIdx(i=>i+1)}/>
            </div>
            <textarea value={jText} onChange={e=>setJText(e.target.value)} placeholder="Write freely — this space is just for you." rows={5}
              style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"13px 14px",color:C.text,fontSize:14,fontFamily:"inherit",resize:"vertical",minHeight:120,lineHeight:1.78,outline:"none",transition:"border-color 0.2s"}}
              onFocus={e=>e.target.style.borderColor=C.accentB} onBlur={e=>e.target.style.borderColor=C.border}/>
            <Btn ch="Save entry" variant="primary" sx={{alignSelf:"flex-start"}}
              dis={!jText.trim()}
              onClick={()=>{ if(!jText.trim()) return; setJEntries(p=>[{text:jText,date:fmtDate(),prompt:PROMPTS[jIdx%PROMPTS.length]},...p]); setJText(""); }}/>
            {jEntries.map((e,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px"}}>
                <p style={{color:C.muted,fontSize:10,fontFamily:"monospace",marginBottom:5}}>{e.date}</p>
                <p style={{color:C.sub,fontSize:12,fontStyle:"italic",marginBottom:8}}>"{e.prompt}"</p>
                <p style={{color:C.text,fontSize:14,lineHeight:1.75}}>{e.text}</p>
              </div>
            ))}
            {!jEntries.length&&<p style={{color:C.muted,textAlign:"center",fontSize:13,padding:"24px 0"}}>Your entries will appear here ✍️</p>}
          </div>
        )}

        {/* ════ STUDY TAB ════ */}
        {tab==="study"&&(
          <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:16}}>
            <h2 style={{color:C.text,fontSize:17,fontWeight:700}}>Study Timer</h2>
            <div style={{background:C.card,border:`1px solid ${tMode==="focus"?AP.bd:C.border}`,borderRadius:16,padding:"30px 20px",textAlign:"center",boxShadow:tMode==="focus"?`0 0 28px ${AP.dim}`:"none",transition:"all 0.3s"}}>
              <p style={{color:tMode==="focus"?AP.color:"#fb923c",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:10}}>{tMode==="focus"?"▸ Focus time":"☕ Break time"}</p>
              <p style={{color:C.text,fontSize:60,fontFamily:"'Courier New',monospace",fontWeight:700,lineHeight:1,marginBottom:24,letterSpacing:"-0.02em"}}>{fmtSecs(tSecs)}</p>
              <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                <Btn ch={tOn?"Pause":"Start"} variant={tOn?"ghost":"primary"} sx={{minWidth:96}} onClick={()=>setTOn(a=>!a)}/>
                <Btn ch="Reset" variant="ghost" onClick={()=>{setTOn(false);setTMode("focus");setTSecs(25*60);}}/>
              </div>
              <p style={{color:C.muted,fontSize:12,marginTop:16}}>Sessions completed: <strong style={{color:AP.color}}>{pomos}</strong></p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {TIPS.map(tip=>(
                <div key={tip.t} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px"}}>
                  <div style={{fontSize:20,marginBottom:7}}>{tip.icon}</div>
                  <p style={{color:C.text,fontSize:13,fontWeight:600,marginBottom:5}}>{tip.t}</p>
                  <p style={{color:C.sub,fontSize:12,lineHeight:1.6}}>{tip.d}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ PROGRESS TAB ════ */}
        {tab==="progress"&&(
          <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:16}}>
            <h2 style={{color:C.text,fontSize:17,fontWeight:700}}>My Progress</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {[
                {l:"Day Streak",v:streak,i:"🔥",c:"#fb923c"},
                {l:"Study Sessions",v:pomos,i:"🎯",c:C.accent},
                {l:"Messages",v:totalMsgs,i:"💬",c:"#818cf8"},
                {l:"Journal Entries",v:jEntries.length,i:"📓",c:"#f472b6"},
                {l:"Memories",v:mems.length,i:"🧠",c:"#34d399"},
                {l:"Guardian Mode",v:AP.icon,i:"🛡️",c:AP.color},
              ].map(s=>(
                <div key={s.l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 10px",textAlign:"center"}}>
                  <div style={{fontSize:20,marginBottom:5}}>{s.i}</div>
                  <div style={{color:s.c,fontSize:19,fontWeight:700,fontFamily:"'Courier New',monospace"}}>{s.v}</div>
                  <div style={{color:C.muted,fontSize:10,marginTop:3,fontWeight:500}}>{s.l}</div>
                </div>
              ))}
            </div>
            {/* Activity bar */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px"}}>
              <p style={{color:C.sub,fontSize:11,fontWeight:600,marginBottom:13}}>Weekly Activity</p>
              <div style={{display:"flex",gap:4,alignItems:"flex-end",height:50}}>
                {["M","T","W","T","F","S","S"].map((d,i)=>{
                  const h=[40,65,48,82,58,22,72][i];
                  return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <div style={{width:"100%",background:AP.color,borderRadius:"2px 2px 0 0",height:`${h}%`,opacity:0.65}}/>
                    <div style={{color:C.muted,fontSize:9,fontFamily:"monospace"}}>{d}</div>
                  </div>;
                })}
              </div>
            </div>
            {/* Note */}
            <div style={{background:C.card,border:`1px solid ${AP.bd}`,borderRadius:14,padding:"16px 18px",boxShadow:`0 0 20px ${AP.dim}`}}>
              <p style={{color:AP.color,fontSize:13,fontWeight:600,marginBottom:7}}>💛 Guardian's Note</p>
              <p style={{color:C.sub,fontSize:14,lineHeight:1.78}}>You're showing up — and that matters more than you know. Every conversation, every journal entry, every study session is a quiet investment in yourself. Keep going, {userName||"there"}.</p>
            </div>
          </div>
        )}

        {/* ════ SETTINGS TAB ════ */}
        {tab==="settings"&&(
          <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:16}}>
            <h2 style={{color:C.text,fontSize:17,fontWeight:700}}>Settings</h2>

            {/* Profile */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"20px",textAlign:"center"}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:AP.dim,border:`1px solid ${AP.bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,margin:"0 auto 12px",color:AP.color,fontWeight:700}}>{userName?.[0]?.toUpperCase()||"?"}</div>
              <p style={{color:C.text,fontSize:18,fontWeight:700,marginBottom:4}}>{userName}</p>
              <span style={{color:C.accent,fontSize:11,background:C.accentD,border:`1px solid ${C.accentB}`,padding:"2px 11px",borderRadius:20,fontWeight:600}}>GuardianGPT User</span>
            </div>

            {/* Memory toggle */}
            <div>
              <p style={{color:C.sub,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Memory</p>
              <div style={{background:C.card,border:`1px solid ${memOn?"rgba(74,222,128,0.28)":C.border}`,borderRadius:12,padding:"14px 15px",display:"flex",alignItems:"center",gap:12,marginBottom:10,transition:"border-color 0.2s"}}>
                <div style={{flex:1}}>
                  <p style={{color:C.text,fontSize:14,fontWeight:600,marginBottom:2}}>Remember conversations</p>
                  <p style={{color:C.muted,fontSize:12,lineHeight:1.5}}>{memOn?`GuardianGPT remembers facts from your chats and brings them up naturally.`:"Each chat starts fresh. Nothing is remembered between sessions."}</p>
                </div>
                <Toggle on={memOn} onChange={toggleMem}/>
              </div>
              {memOn&&(
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {mems.length>0&&(
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                      <p style={{color:C.muted,fontSize:11}}>{mems.length} fact{mems.length!==1?"s":""} stored</p>
                      <button onClick={clearAllMems} style={{background:"none",border:"none",color:"rgba(248,113,113,0.65)",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Clear all</button>
                    </div>
                  )}
                  {!mems.length&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px",textAlign:"center"}}><p style={{color:C.muted,fontSize:13,lineHeight:1.6}}>No memories yet. Keep chatting — I'll quietly remember what matters.</p></div>}
                  {mems.map(m=>(
                    <div key={m.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 13px",display:"flex",alignItems:"flex-start",gap:9}}>
                      <span style={{fontSize:13,flexShrink:0,marginTop:1}}>🧠</span>
                      <div style={{flex:1}}><p style={{color:C.text,fontSize:13,lineHeight:1.55}}>{m.text}</p><p style={{color:C.muted,fontSize:10,marginTop:2}}>Remembered {m.date}</p></div>
                      <button onClick={()=>delMem(m.id)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:15,lineHeight:1,flexShrink:0}}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Guardian mode */}
            <div>
              <p style={{color:C.sub,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Guardian Mode</p>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {PERSONAS.map(p=>(
                  <button key={p.key} onClick={()=>{setPersona(p.key);setMsgs([]);setMoodPicker(true);setTab("chat");}}
                    style={{background:persona===p.key?p.dim:C.card,border:`1px solid ${persona===p.key?p.bd:C.border}`,borderRadius:11,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:11,transition:"all 0.15s",fontFamily:"inherit"}}
                    onMouseEnter={e=>{if(persona!==p.key){e.currentTarget.style.borderColor=p.bd;e.currentTarget.style.background=p.dim;}}}
                    onMouseLeave={e=>{if(persona!==p.key){e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card;}}}>
                    <span style={{fontSize:17}}>{p.icon}</span>
                    <div style={{flex:1,textAlign:"left"}}>
                      <span style={{color:persona===p.key?p.color:C.text,fontSize:13,fontWeight:600}}>{p.label}</span>
                      <span style={{color:C.muted,fontSize:12,marginLeft:7}}>{p.tagline}</span>
                    </div>
                    {persona===p.key&&<span style={{color:p.color,fontSize:10,fontWeight:700,background:p.dim,border:`1px solid ${p.bd}`,borderRadius:20,padding:"1px 8px"}}>Active</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px"}}>
              <p style={{color:C.sub,fontSize:12,lineHeight:1.65}}>GuardianGPT is an AI companion — not a real therapist, parent, or medical professional. For serious concerns, always speak to a trusted adult or qualified professional.</p>
            </div>

            {/* Reset */}
            <Btn ch="Start over" variant="danger" sx={{alignSelf:"flex-start"}} onClick={()=>{setMsgs([]);setPersona(null);setJEntries([]);setMems([]);setMoodPicker(true);setMood(null);setNameInput("");setUserName("");setScreen("name");}}/>
          </div>
        )}
      </div>
    </div>
  );
}
