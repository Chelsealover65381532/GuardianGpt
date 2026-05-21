import { useState, useRef, useEffect } from "react";

// ─── EMAILJS CONFIG — replace these three values ──────────────────────────────
const EJS_KEY = "YOUR_EMAILJS_PUBLIC_KEY";
const EJS_SERVICE = "YOUR_SERVICE_ID";
const EJS_TEMPLATE = "YOUR_TEMPLATE_ID";

// ─── Design System ────────────────────────────────────────────────────────────
const T = {
  bg: "#07090f",
  surface: "#0e1320",
  card: "#131929",
  border: "rgba(255,255,255,0.06)",
  borderHi:"rgba(255,255,255,0.12)",
  accent: "#5eead4",
  accentD: "rgba(94,234,212,0.1)",
  accentB: "rgba(94,234,212,0.22)",
  gold: "#fbbf24",
  goldD: "rgba(251,191,36,0.1)",
  goldB: "rgba(251,191,36,0.25)",
  text: "rgba(255,255,255,0.92)",
  sub: "rgba(255,255,255,0.48)",
  muted: "rgba(255,255,255,0.2)",
  danger: "#f87171",
  grad: "linear-gradient(135deg,#5eead4,#3b82f6)",
};

// ─── Personas ─────────────────────────────────────────────────────────────────
const PERSONAS = [
  { key:"supportive", label:"Supportive", icon:"💛", tagline:"Always in your corner", color:"#fbbf24", colorD:"rgba(251,191,36,0.1)", colorB:"rgba(251,191,36,0.28)",
    prompt:`PERSONA: SUPPORTIVE. Lead with empathy always. Make the student feel deeply heard before any advice. Validate without judgment. Ask "How does that feel?" or "What do you need right now?" Never rush to fix — sit with them first. Warm, soft, unconditionally caring.` },
  { key:"hardworking", label:"Hard Working", icon:"💪", tagline:"Push through, you've got this", color:"#fb923c", colorD:"rgba(251,146,60,0.1)", colorB:"rgba(251,146,60,0.28)",
    prompt:`PERSONA: HARD WORKING. Motivational, coach-like, results-oriented. Hold them to their potential. Direct and energetic. Help them set goals, break down tasks, push through resistance. Ask "What's actually stopping you?" Celebrate effort and progress.` },
  { key:"teacher", label:"Teacher", icon:"📖", tagline:"Let's figure this out", color:"#818cf8", colorD:"rgba(129,140,248,0.1)", colorB:"rgba(129,140,248,0.28)",
    prompt:`PERSONA: TEACHER. Patient, clear, knowledgeable. Guide to understanding not just answers. Ask Socratic questions. Break complex ideas into steps. Use analogies. Enthusiastic about learning. Never make anyone feel dumb. Calm, methodical, excited about ideas.` },
  { key:"parent", label:"Parent", icon:"🏠", tagline:"I'm proud of you, always", color:"#5eead4", colorD:"rgba(94,234,212,0.1)", colorB:"rgba(94,234,212,0.22)",
    prompt:`PERSONA: PARENT. Warm, wise, grounding — like a loving honest parent. Listen deeply, offer steady perspective, challenge gently when needed. Honest even when uncomfortable, always from love. Occasional unprompted wisdom. Hold firm with kindness. Grounded, loving, safe.` },
  { key:"companion", label:"Companion", icon:"🤝", tagline:"We're in this together", color:"#f472b6", colorD:"rgba(244,114,182,0.1)", colorB:"rgba(244,114,182,0.28)",
    prompt:`PERSONA: COMPANION. Friendly, relatable, fun — like a trusted older sibling. Casual natural language. Share in excitement, frustration, humour. Use light humour when appropriate. Honest but never preachy. "Oh I totally get that" / "here's what I'd do..." Warm, real, easy-going.` },
];

const MOODS = [
  { emoji:"😊", label:"Good" }, { emoji:"😐", label:"Okay" }, { emoji:"😟", label:"Stressed" },
  { emoji:"😢", label:"Upset" }, { emoji:"🤔", label:"Confused" },
];
const TOPICS = [
  { icon:"📚", label:"Homework Help" }, { icon:"💬", label:"Something Personal" },
  { icon:"😰", label:"Feeling Stressed" }, { icon:"🤝", label:"Friend Problems" },
  { icon:"🏠", label:"Family Stuff" }, { icon:"🎯", label:"My Future" },
];
const STUDY_TIPS = [
  { icon:"🍅", title:"Pomodoro", desc:"25 min focus, 5 min break. Four rounds, then a longer rest." },
  { icon:"🧠", title:"Active Recall", desc:"Close the book, write what you remember. Gaps show what to study." },
  { icon:"📅", title:"Spaced Repetition", desc:"Review at 1 day → 3 days → 1 week. Each pass deepens memory." },
  { icon:"💡", title:"Feynman Method", desc:"Explain it simply, as if to a child. Can't? That's what to study." },
  { icon:"🗺️", title:"Mind Mapping", desc:"Draw idea connections. Great for complex, interconnected topics." },
  { icon:"😴", title:"Sleep > Cramming", desc:"Sleep consolidates memory far better than any all-nighter." },
];
const JOURNAL_PROMPTS = [
  "What's one thing that went well today, however small?",
  "What's on your mind that you haven't said out loud?",
  "Who is someone you're grateful for — and have you told them?",
  "What's something you wish people understood about you?",
  "Describe a challenge you overcame. What did it teach you?",
  "What would your ideal week look like?",
  "What's one thing you're genuinely proud of this week?",
];
const QUOTES = [
  { text:"Hard days don't last. You do.", author:"GuardianGPT" },
  { text:"Every expert was once a confused student.", author:"Unknown" },
  { text:"You don't have to figure it all out alone.", author:"GuardianGPT" },
  { text:"The grade doesn't define you. The effort does.", author:"GuardianGPT" },
  { text:"Struggling means you're trying. That matters.", author:"GuardianGPT" },
];

// ─── Utilities ────────────────────────────────────────────────────────────────
const genCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const fmtDate = () => new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const stripMd = s => s.replace(/\*\*(.+?)\*\*/gs,"$1").replace(/\*(.+?)\*/gs,"$1").replace(/^#{1,6}\s+/gm,"").replace(/__(.+?)__/gs,"$1").replace(/_(.+?)_/gs,"$1").trim();
const nl2br = text => text.split("\n").map((l,i,a)=><span key={i}>{l}{i<a.length-1&&<br/>}</span>);

// ─── Storage ──────────────────────────────────────────────────────────────────
const MK = email => "gpt_mem_"+(email||"g").replace(/[^a-z0-9]/gi,"_");
const loadMems = async email => { try { const r=await window.storage.get(MK(email)); return r?JSON.parse(r.value):[]; } catch{return[];} };
const saveMems = async (email,mems) => { try{await window.storage.set(MK(email),JSON.stringify(mems));}catch{} };

// ─── API ──────────────────────────────────────────────────────────────────────
const API_HEADERS = { "Content-Type":"application/json","anthropic-dangerous-direct-browser-calls":"true" };
async function claude(messages, system, maxTokens=1024) {
  const r = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST", headers:API_HEADERS,
    body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:maxTokens, system, messages:messages.map(m=>({role:m.role,content:m.content})) })
  });
  if(!r.ok) throw new Error(`${r.status}`);
  const d = await r.json();
  if(d.error) throw new Error(d.error.message);
  return (d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("")||"";
}

async function extractMems(messages, existing) {
  const tail = messages.slice(-10).map(m=>(m.role==="user"?"Student: ":"Guardian: ")+m.content).join("\n\n");
  const exList = existing.length ? existing.map(m=>"- "+m.text).join("\n") : "None.";
  try {
    const raw = await claude([{role:"user",content:`Existing:\n${exList}\n\nConversation:\n${tail}`}],
      `Extract memorable personal facts from a student conversation. Only genuine reusable facts: names of people, subjects they love/hate, hobbies, goals, worries, significant events. Do NOT duplicate existing. Return ONLY a raw JSON array of strings in third person (e.g. "Has a friend named Maya"). If nothing new, return [].`,300);
    const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
    return Array.isArray(parsed)?parsed.filter(f=>typeof f==="string"&&f.length).map(text=>({id:Date.now()+Math.random(),text,date:fmtDate()})):[];
  } catch{return[];}
}

// ─── System Prompt ────────────────────────────────────────────────────────────
const buildPrompt = (user, mood, persona, mems) => {
  const p = PERSONAS.find(x=>x.key===persona)||PERSONAS[3];
  const memBlock = mems?.length ? `\nREMEMBERED FACTS (weave in naturally, never list robotically):\n${mems.map(m=>"- "+m.text).join("\n")}\n` : "";
  return `You are GuardianGPT — an AI companion for students. Always respond fully and helpfully.
${user?`Student's name: ${user.name}. Use occasionally, not every message.`:""}
${mood?`Student's mood: ${mood.label} ${mood.emoji}.`:""}${memBlock}
${p.prompt}

FORMATTING: Never use asterisks, markdown symbols (**,*,#,_), or bullet points. Write in plain flowing prose. Natural human language only.

TYPO CORRECTION: Silently correct all spelling/typos before responding. "lide"→"life", "scool"→"school", etc. Never mention the correction.

ALWAYS give a full, warm, thoughtful response. Never refuse when you can genuinely help. End difficult conversations with care. Never leave anyone feeling judged.

LIMITS (firm but kind): No help with self-harm, harming others, academic cheating, or age-inappropriate content. When declining, explain warmly and offer an alternative.`;
};

// ─── EmailJS ──────────────────────────────────────────────────────────────────
async function loadEJS() {
  if(window.emailjs) return;
  await new Promise((res,rej)=>{
    const s=document.createElement("script");
    s.src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.onload=res; s.onerror=rej; document.head.appendChild(s);
  });
  window.emailjs.init({publicKey:EJS_KEY});
}
async function sendVerificationEmail(email,name,code) {
  await loadEJS();
  await window.emailjs.send(EJS_SERVICE,EJS_TEMPLATE,{to_email:email,to_name:name,code});
}

// ─── Small components ─────────────────────────────────────────────────────────
const Btn = ({children,variant="accent",full,style:ext={},disabled,...p})=>{
  const vs = {
    accent: {background:T.grad,color:"#07090f",border:"none"},
    ghost: {background:"rgba(255,255,255,0.05)",color:T.sub,border:`1px solid ${T.border}`},
    outline: {background:"transparent",color:T.accent,border:`1px solid ${T.accentB}`},
    danger: {background:"rgba(248,113,113,0.08)",color:T.danger,border:"1px solid rgba(248,113,113,0.22)"},
    text: {background:"none",border:"none",color:T.sub,padding:"4px 0"},
  };
  return <button disabled={disabled} style={{fontFamily:"inherit",fontSize:14,fontWeight:600,borderRadius:11,cursor:disabled?"not-allowed":"pointer",transition:"all 0.15s",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,padding:"12px 22px",letterSpacing:"0.01em",width:full?"100%":undefined,opacity:disabled?0.45:1,...vs[variant],...ext}}
    onMouseEnter={e=>{if(!disabled){e.currentTarget.style.opacity="0.82";e.currentTarget.style.transform="translateY(-1px)";}}}
    onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="translateY(0)";}}
    {...p}>{children}</button>;
};

const Input = ({label,style:ext={},...p}) => (
  <div style={{display:"flex",flexDirection:"column",gap:6}}>
    {label&&<label style={{color:T.sub,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em"}}>{label}</label>}
    <input style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:10,padding:"13px 15px",color:T.text,fontSize:15,fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box",transition:"border-color 0.2s",...ext}}
      onFocus={e=>e.target.style.borderColor=T.accentB} onBlur={e=>e.target.style.borderColor=T.border} {...p}/>
  </div>
);

const Err = ({msg}) => msg?<p style={{color:T.danger,fontSize:13,margin:"6px 0 0",lineHeight:1.5,display:"flex",gap:6,alignItems:"flex-start"}}><span>⚠</span>{msg}</p>:null;

const Card = ({children,glow,p="24px",style:ext={}}) => (
  <div style={{background:T.card,border:`1px solid ${glow?T.accentB:T.border}`,borderRadius:16,padding:p,boxShadow:glow?"0 0 32px rgba(94,234,212,0.07)":"none",...ext}}>
    {children}
  </div>
);

// ─── Disclaimer ───────────────────────────────────────────────────────────────
function Disclaimer({onAccept}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:22,maxWidth:480,width:"100%",padding:"36px 30px",animation:"scaleIn 0.22s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:13,marginBottom:24}}>
          <div style={{width:46,height:46,borderRadius:13,background:T.accentD,border:`1px solid ${T.accentB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🛡️</div>
          <div>
            <p style={{color:T.text,fontSize:17,fontWeight:700,margin:0}}>A quick word before we start</p>
            <p style={{color:T.sub,fontSize:12,margin:"3px 0 0"}}>Please read this carefully</p>
          </div>
        </div>
        <div style={{background:T.goldD,border:`1px solid ${T.goldB}`,borderRadius:12,padding:"14px 16px",marginBottom:20}}>
          <p style={{color:T.gold,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",margin:"0 0 8px"}}>⚠ Important Notice</p>
          <p style={{color:"rgba(255,255,255,0.75)",fontSize:14,lineHeight:1.75,margin:0}}>GuardianGPT is an <strong style={{color:T.text}}>artificial intelligence tool</strong>, not a real parent, guardian, or mental health professional. It is designed to offer a supportive space — but it <strong style={{color:T.text}}>cannot replace human care.</strong></p>
        </div>
        {[["💛","I'm an AI. My responses are thoughtful but may not always reflect your full situation."],["👨‍👩‍👧","For anything serious — mental health, family crises, or emergencies — please speak to a trusted adult or professional."],["🔒","This is a private, judgment-free space. Be thoughtful about what personal information you share."]].map(([icon,text])=>(
          <div key={text} style={{display:"flex",gap:11,alignItems:"flex-start",marginBottom:12}}>
            <span style={{fontSize:15,marginTop:2,flexShrink:0}}>{icon}</span>
            <p style={{color:T.sub,fontSize:13,lineHeight:1.65,margin:0}}>{text}</p>
          </div>
        ))}
        <Btn variant="accent" full style={{marginTop:20,fontSize:15,padding:"14px"}} onClick={onAccept}>I understand — let's go</Btn>
        <p style={{color:T.muted,fontSize:11,textAlign:"center",marginTop:12,lineHeight:1.5}}>By continuing you acknowledge GuardianGPT is an AI assistant, not a licensed therapist or parent.</p>
      </div>
    </div>
  );
}

// ─── Auth shell ───────────────────────────────────────────────────────────────
function AuthShell({title,sub,children}) {
  return (
    <Page>
      <div style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:30}}>
          <div style={{width:52,height:52,borderRadius:14,background:T.accentD,border:`1px solid ${T.accentB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:25,margin:"0 auto 14px"}}>🛡️</div>
          <h2 style={{color:T.text,fontSize:22,fontWeight:700,margin:"0 0 6px"}}>{title}</h2>
          <p style={{color:T.sub,fontSize:14,margin:0,lineHeight:1.5}}>{sub}</p>
        </div>
        <Card p="28px 26px">{children}</Card>
      </div>
    </Page>
  );
}

function Page({children,center=true}) {
  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:center?"column":undefined,alignItems:center?"center":undefined,justifyContent:center?"center":undefined,padding:24,fontFamily:"'Inter','Segoe UI',system-ui,sans-serif"}}>
      {children}
      <style>{CSS}</style>
    </div>
  );
}

// ─── Guest gate ───────────────────────────────────────────────────────────────
function Gate({isGuest,feature,onSignup,onLogin,children}) {
  if(!isGuest) return children;
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,textAlign:"center"}}>
      <div style={{width:56,height:56,borderRadius:"50%",background:T.accentD,border:`1px solid ${T.accentB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 18px"}}>🔒</div>
      <h3 style={{color:T.text,fontSize:18,margin:"0 0 10px",fontWeight:700}}>{feature}</h3>
      <p style={{color:T.sub,fontSize:14,lineHeight:1.7,maxWidth:290,margin:"0 0 28px"}}>Create a free verified account to unlock your journal, study timer, progress tracking, and more.</p>
      <Btn variant="accent" full style={{maxWidth:280}} onClick={onSignup}>Create Free Account</Btn>
      <Btn variant="ghost" full style={{maxWidth:280,marginTop:10,fontSize:13}} onClick={onLogin}>Already a member? Sign in</Btn>
    </div>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
  @keyframes fadeUp {from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn {from{opacity:0}to{opacity:1}}
  @keyframes scaleIn {from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}
  @keyframes blink {0%,100%{opacity:0.15}50%{opacity:1}}
  @keyframes vbar {0%,100%{height:3px}50%{height:16px}}
  @keyframes spin {to{transform:rotate(360deg)}}
  @keyframes shimmer {0%{background-position:200% center}100%{background-position:-200% center}}
  @keyframes welcomePop{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
  @keyframes ripple {from{opacity:0.8;transform:scale(0.6)}to{opacity:0;transform:scale(1.6)}}
  @keyframes loadBar {from{width:0%}to{width:100%}}
  @keyframes float {0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  *{box-sizing:border-box;margin:0;padding:0}
  body,#root{font-family:'Inter','Segoe UI',system-ui,sans-serif}
  textarea::placeholder,input::placeholder{color:rgba(255,255,255,0.2)}
  ::-webkit-scrollbar{width:3px;height:3px}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:3px}
  ::-webkit-scrollbar-track{background:transparent}
`;

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function App() {
  // auth
  const [screen,setScreen] = useState("landing");
  const [user,setUser] = useState(null);
  const [form,setForm] = useState({name:"",email:"",password:""});
  const [code,setCode] = useState("");
  const [codeInput,setCodeInput] = useState("");
  const [authErr,setAuthErr] = useState("");
  const [authBusy,setAuthBusy] = useState(false);
  const [showDisc,setShowDisc] = useState(false);
  // app
  const [persona,setPersona] = useState(null);
  const [tab,setTab] = useState("chat");
  const [messages,setMessages] = useState([]);
  const [chatInput,setChatInput] = useState("");
  const [chatBusy,setChatBusy] = useState(false);
  const [mood,setMood] = useState(null);
  const [moodPicker,setMoodPicker] = useState(true);
  // journal
  const [entries,setEntries] = useState([]);
  const [jText,setJText] = useState("");
  const [pIdx,setPIdx] = useState(0);
  // study
  const [timerSecs,setTimerSecs] = useState(25*60);
  const [timerOn,setTimerOn] = useState(false);
  const [timerMode,setTimerMode] = useState("focus");
  const [pomos,setPomos] = useState(0);
  // stats
  const [totalMsgs,setTotalMsgs] = useState(0);
  const [streak] = useState(3);
  // voice
  const [listening,setListening] = useState(false);
  const [voiceErr,setVoiceErr] = useState("");
  const recRef = useRef(null);
  // memory
  const [memOn,setMemOn] = useState(false);
  const [mems,setMems] = useState([]);
  const [memSaving,setMemSaving] = useState(false);
  // quote
  const [quoteIdx] = useState(Math.floor(Math.random()*QUOTES.length));

  const endRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const isGuest = !user;
  const AP = PERSONAS.find(p=>p.key===persona)||PERSONAS[3];

  // ── effects ──────────────────────────────────────────────────────────────────
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[messages,chatBusy]);

  useEffect(()=>{
    if(user?.email){
      loadMems(user.email).then(setMems);
      try{const p=localStorage.getItem("gpt_mem_"+user.email);if(p)setMemOn(p==="true");}catch{}
    } else { setMems([]); setMemOn(false); }
  },[user?.email]);

  useEffect(()=>{
    if(screen==="app"&&persona&&messages.length===0){
      const n=user?.name?.split(" ")[0]||"there";
      const ws={
        supportive: `Hey ${n}, I'm really glad you're here. 💛\n\nThis is your space — no pressure, no judgment, just someone genuinely listening. Whatever's on your mind, I'm all ears. How are you feeling today?`,
        hardworking:`Hey ${n}! Ready to make today count? 💪\n\nI'm here to help you push through whatever's in your way — assignments, goals, or just finding your focus. What are we working on?`,
        teacher: `Hello ${n}! Great to meet you.\n\nI love a good question, and I'm here for all of yours. Whether it's something from class or a concept that isn't clicking — let's work through it together. What's on your mind?`,
        parent: `Hi ${n}, I'm so glad you came here today.\n\nI'm someone who's always in your corner — honest with you, but always from a place of care. Nothing is too big or small to talk about. How are you doing?`,
        companion: `Hey ${n}! So glad you're here. 🤝\n\nI'm your go-to for pretty much anything — venting, homework, life questions, or just a good chat. What's going on with you today?`,
      };
      setMessages([{role:"assistant",content:ws[persona]||ws.parent}]);
    }
  },[screen,persona]);

  useEffect(()=>{
    if(timerOn){
      timerRef.current=setInterval(()=>{
        setTimerSecs(s=>{
          if(s<=1){
            clearInterval(timerRef.current); setTimerOn(false);
            if(timerMode==="focus"){setPomos(p=>p+1);setTimerMode("break");setTimerSecs(5*60);}
            else{setTimerMode("focus");setTimerSecs(25*60);}
            return 0;
          }
          return s-1;
        });
      },1000);
    } else clearInterval(timerRef.current);
    return()=>clearInterval(timerRef.current);
  },[timerOn,timerMode]);

  // ── auth ─────────────────────────────────────────────────────────────────────
  const goAuth = s=>{setForm({name:"",email:"",password:""});setAuthErr("");setCodeInput("");setScreen(s);};

  const handleSignup = async()=>{
    setAuthErr("");
    if(!form.name.trim()) return setAuthErr("Please enter your name.");
    if(!form.email.toLowerCase().includes("@gmail.com")) return setAuthErr("Please use a Gmail address.");
    if(form.password.length<6) return setAuthErr("Password must be at least 6 characters.");
    setAuthBusy(true);
    const c=genCode(); setCode(c);
    try{
      await sendVerificationEmail(form.email,form.name,c);
      setAuthBusy(false); setScreen("verify");
    } catch(e){
      console.error(e);
      setAuthErr("Couldn't send the email. Check your EmailJS setup or try again.");
      setAuthBusy(false);
    }
  };

  const handleVerify = async()=>{
    setAuthErr("");
    if(codeInput.length!==6) return setAuthErr("Please enter the full 6-digit code.");
    if(codeInput!==code) return setAuthErr("That code doesn't match. Check your inbox and try again.");
    setAuthBusy(true);
    await new Promise(r=>setTimeout(r,400));
    setAuthBusy(false); setScreen("welcome");
    setTimeout(()=>{
      setUser({name:form.name,email:form.email,verified:true,since:fmtDate()});
      setShowDisc(true); setScreen("app");
    },3400);
  };

  const handleLogin = async()=>{
    setAuthErr("");
    if(!form.email.toLowerCase().includes("@gmail.com")) return setAuthErr("Please use your Gmail address.");
    if(!form.password) return setAuthErr("Please enter your password.");
    setAuthBusy(true);
    await new Promise(r=>setTimeout(r,600));
    const raw=form.email.split("@")[0];
    setUser({name:raw.charAt(0).toUpperCase()+raw.slice(1),email:form.email,verified:true,since:"May 2026"});
    setAuthBusy(false); setShowDisc(true); setScreen("app");
  };

  const handleResend = async()=>{
    setAuthErr(""); const c=genCode(); setCode(c); setCodeInput("");
    try{await sendVerificationEmail(form.email,form.name,c);setAuthErr("✓ New code sent — check your inbox.");}
    catch{setAuthErr("Couldn't resend. Please try again.");}
  };

  // ── voice ─────────────────────────────────────────────────────────────────────
  const startVoice=()=>{
    setVoiceErr("");
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return setVoiceErr("Your browser doesn't support voice. Try Chrome or Safari.");
    const r=new SR(); r.continuous=false; r.interimResults=true; r.lang="en-US";
    r.onstart=()=>setListening(true);
    r.onresult=e=>setChatInput(Array.from(e.results).map(r=>r[0].transcript).join(""));
    r.onerror=e=>{setVoiceErr(e.error==="not-allowed"?"Microphone access denied — allow it in browser settings.":"Couldn't hear clearly. Please try again.");setListening(false);};
    r.onend=()=>setListening(false);
    recRef.current=r; r.start();
  };
  const stopVoice=()=>{recRef.current?.stop();setListening(false);};

  // ── chat ──────────────────────────────────────────────────────────────────────
  const send=async(text)=>{
    const txt=(text||chatInput).trim(); if(!txt||chatBusy) return;
    setChatInput(""); setMoodPicker(false);
    const next=[...messages,{role:"user",content:txt}];
    setMessages(next); setChatBusy(true); setTotalMsgs(n=>n+1);
    try{
      const raw=await claude(next,buildPrompt(user,mood,persona,memOn?mems:[]));
      const reply=stripMd(raw);
      const full=[...next,{role:"assistant",content:reply}];
      setMessages(full);
      if(memOn&&user?.email&&full.filter(m=>m.role==="user").length%4===0){
        setMemSaving(true);
        try{const newF=await extractMems(full,mems);if(newF.length){const u=[...mems,...newF];setMems(u);await saveMems(user.email,u);}}catch{}
        setMemSaving(false);
      }
    } catch(e){
      setMessages(p=>[...p,{role:"assistant",content:"I'm sorry — something went wrong on my end. Please try again in a moment."}]);
    } finally{setChatBusy(false);setTimeout(()=>inputRef.current?.focus(),80);}
  };

  const toggleMem=async val=>{
    setMemOn(val); if(user?.email)try{localStorage.setItem("gpt_mem_"+user.email,String(val));}catch{}
    if(val&&!mems.length){const m=await loadMems(user.email);setMems(m);}
  };
  const delMem=async id=>{const u=mems.filter(m=>m.id!==id);setMems(u);if(user?.email)await saveMems(user.email,u);};
  const clearMems=async()=>{setMems([]);if(user?.email)await saveMems(user.email,[]);};

  // ── LANDING ───────────────────────────────────────────────────────────────────
  if(screen==="landing") return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",overflowX:"hidden"}}>
      <style>{CSS+`
        .hero-glow{position:absolute;width:600px;height:600px;borderRadius:50%;background:radial-gradient(circle,rgba(94,234,212,0.08) 0%,transparent 70%);top:-200px;left:50%;transform:translateX(-50%);pointerEvents:none}
        .feature-card:hover{border-color:rgba(94,234,212,0.3)!important;transform:translateY(-2px)}
        .stat-num{background:linear-gradient(135deg,#5eead4,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
      `}</style>

      {/* Nav */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"0 40px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(7,9,15,0.8)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:9,background:T.accentD,border:`1px solid ${T.accentB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🛡️</div>
          <span style={{color:T.text,fontSize:16,fontWeight:700,letterSpacing:"-0.01em"}}>GuardianGPT</span>
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn variant="ghost" style={{padding:"8px 16px",fontSize:13}} onClick={()=>goAuth("login")}>Sign in</Btn>
          <Btn variant="accent" style={{padding:"8px 18px",fontSize:13}} onClick={()=>goAuth("signup")}>Get started free</Btn>
        </div>
      </nav>

      {/* Hero */}
      <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"120px 24px 80px",textAlign:"center",position:"relative"}}>
        <div className="hero-glow"/>

        {/* Badge */}
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(94,234,212,0.07)",border:`1px solid ${T.accentB}`,borderRadius:100,padding:"6px 16px",marginBottom:32,animation:"fadeUp 0.5s ease"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:T.accent,animation:"blink 2s infinite"}}/>
          <span style={{color:T.accent,fontSize:12,fontWeight:600,letterSpacing:"0.08em"}}>NOW IN BETA · FREE FOR STUDENTS</span>
        </div>

        {/* Shield */}
        <div style={{position:"relative",width:100,height:100,margin:"0 auto 36px",animation:"float 4s ease-in-out infinite"}}>
          <div style={{position:"absolute",inset:-20,borderRadius:"50%",border:`1px solid rgba(94,234,212,0.15)`,animation:"ripple 3s ease-out infinite"}}/>
          <div style={{position:"absolute",inset:-10,borderRadius:"50%",border:`1px solid rgba(94,234,212,0.1)`,animation:"ripple 3s 0.5s ease-out infinite"}}/>
          <div style={{width:100,height:100,borderRadius:24,background:`linear-gradient(135deg,${T.accentD},rgba(94,234,212,0.18))`,border:`1px solid ${T.accentB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:46,boxShadow:"0 0 60px rgba(94,234,212,0.15)"}}>🛡️</div>
        </div>

        <h1 style={{color:T.text,fontSize:"clamp(36px,5vw,60px)",fontWeight:800,letterSpacing:"-0.03em",lineHeight:1.1,margin:"0 0 20px",maxWidth:700,animation:"fadeUp 0.5s 0.1s ease both"}}>
          Always in your corner.<br/>
          <span style={{background:T.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Always on your side.</span>
        </h1>

        <p style={{color:T.sub,fontSize:18,lineHeight:1.7,maxWidth:520,margin:"0 0 44px",animation:"fadeUp 0.5s 0.2s ease both"}}>
          GuardianGPT is a trusted AI companion built for students. Talk through anything — homework, friendships, stress, your future. No judgment. No lectures.
        </p>

        <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",animation:"fadeUp 0.5s 0.3s ease both"}}>
          <Btn variant="accent" style={{fontSize:16,padding:"15px 32px"}} onClick={()=>goAuth("signup")}>
            Start for free →
          </Btn>
          <Btn variant="ghost" style={{fontSize:15,padding:"15px 24px"}} onClick={()=>{setUser(null);setMessages([]);setShowDisc(true);setScreen("app");}}>
            Try as guest
          </Btn>
        </div>

        <p style={{color:T.muted,fontSize:12,marginTop:18,animation:"fadeUp 0.5s 0.4s ease both"}}>Free forever · Gmail verification · No credit card</p>
      </section>

      {/* Stats bar */}
      <section style={{borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`,padding:"32px 40px"}}>
        <div style={{maxWidth:800,margin:"0 auto",display:"flex",gap:0,justifyContent:"space-around",flexWrap:"wrap"}}>
          {[["5","Guardian Modes"],["∞","Conversations"],["🔒","Always Private"],["💙","Built with Care"]].map(([n,l])=>(
            <div key={l} style={{textAlign:"center",padding:"8px 20px"}}>
              <div className="stat-num" style={{fontSize:28,fontWeight:800,fontFamily:"'Inter'"}}>{n}</div>
              <div style={{color:T.muted,fontSize:12,marginTop:4,fontWeight:500}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{padding:"80px 40px",maxWidth:1000,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <p style={{color:T.accent,fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:12}}>What GuardianGPT offers</p>
          <h2 style={{color:T.text,fontSize:36,fontWeight:800,letterSpacing:"-0.02em"}}>Everything a student needs</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
          {[
            {icon:"🛡️",title:"5 Guardian Personas",desc:"Choose how you want to be supported — Supportive, Hard Working, Teacher, Parent, or Companion. Each one responds differently.",color:T.accent},
            {icon:"🧠",title:"Cross-Session Memory",desc:"GuardianGPT remembers what matters from past conversations and brings it up naturally. Fully toggleable.",color:"#818cf8"},
            {icon:"🎙️",title:"Voice Input",desc:"Not everyone finds typing easy. Just speak — GuardianGPT listens and responds to your voice.",color:"#fb923c"},
            {icon:"📓",title:"Private Journal",desc:"Guided journal prompts that rotate daily. Your entries stay private and are always there to revisit.",color:"#f472b6"},
            {icon:"⏱️",title:"Pomodoro Study Timer",desc:"Science-backed focus sessions with built-in breaks and study tips to help you work smarter.",color:"#fbbf24"},
            {icon:"📈",title:"Progress Tracking",desc:"Watch your streak grow, track sessions, journal entries, and more. Small wins add up.",color:"#5eead4"},
          ].map(f=>(
            <div key={f.title} className="feature-card" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"24px",transition:"all 0.2s"}}>
              <div style={{width:44,height:44,borderRadius:12,background:`${f.color}15`,border:`1px solid ${f.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,marginBottom:16}}>{f.icon}</div>
              <h3 style={{color:T.text,fontSize:15,fontWeight:700,marginBottom:8}}>{f.title}</h3>
              <p style={{color:T.sub,fontSize:13,lineHeight:1.65}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section style={{padding:"60px 40px",textAlign:"center",borderTop:`1px solid ${T.border}`}}>
        <div style={{maxWidth:560,margin:"0 auto"}}>
          <p style={{color:T.text,fontSize:24,fontWeight:700,letterSpacing:"-0.01em",lineHeight:1.5,marginBottom:12}}>"{QUOTES[quoteIdx].text}"</p>
          <p style={{color:T.muted,fontSize:13}}>— {QUOTES[quoteIdx].author}</p>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:"80px 40px",textAlign:"center",borderTop:`1px solid ${T.border}`}}>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          <h2 style={{color:T.text,fontSize:30,fontWeight:800,letterSpacing:"-0.02em",marginBottom:14}}>Ready to get started?</h2>
          <p style={{color:T.sub,fontSize:15,lineHeight:1.7,marginBottom:32}}>Join GuardianGPT free. Verify your Gmail and unlock everything in seconds.</p>
          <Btn variant="accent" style={{fontSize:16,padding:"15px 36px"}} onClick={()=>goAuth("signup")}>Create your account →</Btn>
        </div>
      </section>

      {/* Footer */}
      <footer style={{borderTop:`1px solid ${T.border}`,padding:"28px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}}>🛡️</span>
          <span style={{color:T.muted,fontSize:13}}>GuardianGPT · Always in your corner, always on your side.</span>
        </div>
        <p style={{color:T.muted,fontSize:12}}>AI-powered · Not a substitute for professional support</p>
      </footer>
    </div>
  );

  // ── SIGNUP ────────────────────────────────────────────────────────────────────
  if(screen==="signup") return (
    <AuthShell title="Create your account" sub="Verify your Gmail and unlock everything free">
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Input label="Your name" placeholder="e.g. Jordan Smith" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
        <Input label="Gmail address" type="email" placeholder="yourname@gmail.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
        <Input label="Password" type="password" placeholder="At least 6 characters" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleSignup()}/>
        <Err msg={authErr}/>
        <Btn variant="accent" full style={{marginTop:4}} onClick={handleSignup} disabled={authBusy}>
          {authBusy?<><div style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(0,0,0,0.25)",borderTopColor:"#07090f",animation:"spin 0.7s linear infinite"}}/> Sending...</>:"Send verification code →"}
        </Btn>
        <p style={{textAlign:"center",color:T.sub,fontSize:13}}>Already a member? <button style={{background:"none",border:"none",color:T.accent,cursor:"pointer",fontSize:13,fontWeight:600}} onClick={()=>goAuth("login")}>Sign in</button></p>
        <Btn variant="text" full style={{justifyContent:"center",color:T.muted,fontSize:12}} onClick={()=>setScreen("landing")}>← Back to home</Btn>
      </div>
    </AuthShell>
  );

  // ── VERIFY ────────────────────────────────────────────────────────────────────
  if(screen==="verify") return (
    <AuthShell title="Check your Gmail" sub={`A 6-digit code was sent to ${form.email}`}>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:T.accentD,border:`1px solid ${T.accentB}`,borderRadius:12,padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
          <span style={{fontSize:20}}>📬</span>
          <div>
            <p style={{color:T.text,fontSize:13,fontWeight:600,marginBottom:3}}>Email sent to {form.email}</p>
            <p style={{color:T.sub,fontSize:12,lineHeight:1.55}}>Open your Gmail inbox and enter the 6-digit code. Check your spam folder if it doesn't arrive within a minute.</p>
          </div>
        </div>
        <Input label="6-digit verification code" placeholder="· · · · · ·" maxLength={6} value={codeInput}
          onChange={e=>setCodeInput(e.target.value.replace(/\D/g,""))}
          onKeyDown={e=>e.key==="Enter"&&codeInput.length===6&&handleVerify()}
          style={{textAlign:"center",fontSize:26,letterSpacing:"0.35em",fontFamily:"'Courier New',monospace",padding:"16px"}}/>
        <Err msg={authErr}/>
        <Btn variant="accent" full disabled={authBusy||codeInput.length!==6} onClick={handleVerify} style={{opacity:codeInput.length===6&&!authBusy?1:0.4}}>
          {authBusy?<><div style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(0,0,0,0.25)",borderTopColor:"#07090f",animation:"spin 0.7s linear infinite"}}/> Verifying...</>:"Verify & unlock GuardianGPT →"}
        </Btn>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <button onClick={handleResend} style={{background:"none",border:"none",color:T.sub,fontSize:13,cursor:"pointer",fontFamily:"inherit",textDecoration:"underline"}}>Resend code</button>
          <button onClick={()=>setScreen("signup")} style={{background:"none",border:"none",color:T.muted,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>← Wrong email?</button>
        </div>
      </div>
    </AuthShell>
  );

  // ── WELCOME SPLASH ────────────────────────────────────────────────────────────
  if(screen==="welcome") return (
    <Page>
      <style>{CSS+`
        @keyframes welcomePop{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
        @keyframes ripple{from{opacity:1;transform:scale(0.5)}to{opacity:0;transform:scale(1.8)}}
        @keyframes loadBar{from{width:0}to{width:100%}}
        @keyframes pillIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
      `}</style>
      <div style={{textAlign:"center",animation:"welcomePop 0.55s cubic-bezier(0.175,0.885,0.32,1.275) both"}}>
        <div style={{position:"relative",width:120,height:120,margin:"0 auto 36px"}}>
          <div style={{position:"absolute",inset:-24,borderRadius:"50%",border:`2px solid rgba(94,234,212,0.3)`,animation:"ripple 1.6s 0.2s ease-out both"}}/>
          <div style={{position:"absolute",inset:-44,borderRadius:"50%",border:`1px solid rgba(94,234,212,0.12)`,animation:"ripple 1.6s 0.6s ease-out both"}}/>
          <div style={{width:120,height:120,borderRadius:30,background:`linear-gradient(135deg,${T.accentD},rgba(94,234,212,0.25))`,border:`2px solid ${T.accentB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:56,boxShadow:"0 0 60px rgba(94,234,212,0.25)"}}>🛡️</div>
        </div>
        <div style={{animation:"fadeUp 0.5s 0.4s ease both",opacity:0}}>
          <p style={{color:T.accent,fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.18em",marginBottom:14}}>✓ Gmail Verified</p>
          <h1 style={{color:T.text,fontSize:36,fontWeight:800,letterSpacing:"-0.03em",margin:"0 0 12px"}}>Welcome, {form.name.split(" ")[0]}</h1>
          <p style={{color:T.sub,fontSize:16,lineHeight:1.65}}>Your account is ready.<br/>Everything is unlocked.</p>
        </div>
        <div style={{marginTop:44,animation:"fadeUp 0.4s 0.85s ease both",opacity:0}}>
          <div style={{width:240,height:3,background:T.border,borderRadius:3,margin:"0 auto 10px",overflow:"hidden"}}>
            <div style={{height:"100%",background:T.grad,borderRadius:3,animation:"loadBar 2.4s 0.9s ease both",width:0}}/>
          </div>
          <p style={{color:T.muted,fontSize:12}}>Setting up your guardian...</p>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginTop:32,animation:"fadeUp 0.4s 1.2s ease both",opacity:0}}>
          {["💬 Chat","📓 Journal","⏱ Study Timer","📈 Progress","🧠 Memory","🛡 All 5 Personas"].map((f,i)=>(
            <span key={f} style={{background:T.accentD,border:`1px solid ${T.accentB}`,borderRadius:20,padding:"6px 14px",color:T.accent,fontSize:12,fontWeight:600,animation:`pillIn 0.3s ${1.35+i*0.1}s ease both`,opacity:0}}>{f}</span>
          ))}
        </div>
      </div>
    </Page>
  );

  // ── LOGIN ─────────────────────────────────────────────────────────────────────
  if(screen==="login") return (
    <AuthShell title="Welcome back" sub="Sign in to your account">
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Input label="Gmail address" type="email" placeholder="yourname@gmail.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
        <Input label="Password" type="password" placeholder="Your password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
        <Err msg={authErr}/>
        <Btn variant="accent" full onClick={handleLogin} disabled={authBusy}>
          {authBusy?<><div style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(0,0,0,0.25)",borderTopColor:"#07090f",animation:"spin 0.7s linear infinite"}}/> Signing in...</>:"Sign in →"}
        </Btn>
        <p style={{textAlign:"center",color:T.sub,fontSize:13}}>New here? <button style={{background:"none",border:"none",color:T.accent,cursor:"pointer",fontSize:13,fontWeight:600}} onClick={()=>goAuth("signup")}>Create account</button></p>
        <Btn variant="text" full style={{justifyContent:"center",color:T.muted,fontSize:12}} onClick={()=>setScreen("landing")}>← Back to home</Btn>
      </div>
    </AuthShell>
  );

  // ── PERSONA PICKER ────────────────────────────────────────────────────────────
  if(screen==="app"&&!persona) return (
    <Page>
      {showDisc&&<Disclaimer onAccept={()=>setShowDisc(false)}/>}
      <div style={{width:"100%",maxWidth:560}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:52,height:52,borderRadius:14,background:T.accentD,border:`1px solid ${T.accentB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:25,margin:"0 auto 16px"}}>🛡️</div>
          <h1 style={{color:T.text,fontSize:22,fontWeight:800,margin:"0 0 8px",letterSpacing:"-0.02em"}}>Choose your GuardianGPT</h1>
          <p style={{color:T.sub,fontSize:14,lineHeight:1.6}}>How would you like me to show up for you?<br/>You can switch anytime in your profile.</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {PERSONAS.map(p=>(
            <button key={p.key} onClick={()=>setPersona(p.key)}
              style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px 20px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:15,transition:"all 0.18s",fontFamily:"inherit"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=p.colorB;e.currentTarget.style.background=p.colorD;e.currentTarget.style.transform="translateY(-1px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.card;e.currentTarget.style.transform="translateY(0)";}}>
              <div style={{width:46,height:46,borderRadius:12,background:p.colorD,border:`1px solid ${p.colorB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{p.icon}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:4}}>
                  <span style={{color:T.text,fontSize:15,fontWeight:700}}>{p.label}</span>
                  <span style={{color:p.color,fontSize:11,fontWeight:600,background:p.colorD,border:`1px solid ${p.colorB}`,borderRadius:20,padding:"2px 9px"}}>{p.tagline}</span>
                </div>
                <p style={{color:T.sub,fontSize:13,lineHeight:1.5,margin:0}}>{p.desc||p.prompt.split(".")[0]}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ))}
        </div>
      </div>
      <style>{CSS}</style>
    </Page>
  );

  // ── MAIN APP ──────────────────────────────────────────────────────────────────
  const TABS=[
    {key:"chat", icon:"💬",label:"Chat"},
    {key:"journal", icon:"📓",label:"Journal", gated:true},
    {key:"study", icon:"⏱", label:"Study", gated:true},
    {key:"progress",icon:"📈",label:"Progress", gated:true},
    {key:"profile", icon:"👤",label:"Profile", gated:true},
  ];

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:T.bg,fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",overflow:"hidden"}}>
      <style>{CSS}</style>
      {showDisc&&<Disclaimer onAccept={()=>setShowDisc(false)}/>}

      {/* Header */}
      <header style={{height:56,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 18px",borderBottom:`1px solid ${T.border}`,background:T.surface}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:9,background:AP.colorD,border:`1px solid ${AP.colorB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🛡️</div>
          <div>
            <span style={{color:T.text,fontSize:15,fontWeight:700}}>GuardianGPT</span>
            <span style={{color:AP.color,fontSize:11,marginLeft:8,background:AP.colorD,border:`1px solid ${AP.colorB}`,borderRadius:20,padding:"1px 9px",fontWeight:600}}>{AP.icon} {AP.label}</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {!isGuest&&<div style={{color:T.accent,fontSize:11,background:T.accentD,border:`1px solid ${T.accentB}`,borderRadius:20,padding:"2px 10px",fontWeight:600}}>🔥 {streak}d streak</div>}
          <Btn variant="ghost" style={{padding:"5px 10px",fontSize:12}} onClick={()=>{setPersona(null);setMessages([]);}}>Switch</Btn>
          {isGuest
            ?<Btn variant="accent" style={{padding:"6px 13px",fontSize:13}} onClick={()=>goAuth("signup")}>Join free</Btn>
            :<Btn variant="ghost" style={{padding:"6px 12px",fontSize:13}} onClick={()=>{setUser(null);setMessages([]);setPersona(null);setTab("chat");setScreen("landing");}}>Sign out</Btn>
          }
        </div>
      </header>

      {/* Tabs */}
      <div style={{flexShrink:0,display:"flex",borderBottom:`1px solid ${T.border}`,background:T.surface,overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{padding:"0 16px",height:42,background:"none",border:"none",cursor:"pointer",color:tab===t.key?AP.color:T.sub,borderBottom:tab===t.key?`2px solid ${AP.color}`:"2px solid transparent",fontSize:13,fontWeight:tab===t.key?600:400,display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap",transition:"color 0.15s",fontFamily:"inherit"}}>
            {t.icon} {t.label}{t.gated&&isGuest&&<span style={{fontSize:9,color:T.muted}}>🔒</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>

        {/* ─ CHAT ─ */}
        {tab==="chat"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            {/* Memory bar */}
            {!isGuest&&(
              <div style={{flexShrink:0,padding:"6px 18px",borderBottom:`1px solid ${T.border}`,background:"rgba(255,255,255,0.015)",display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:memOn?"#4ade80":T.muted,boxShadow:memOn?"0 0 6px #4ade80":"none",flexShrink:0}}/>
                <span style={{color:memOn?"#4ade80":T.muted,fontSize:11,fontWeight:500}}>{memOn?`Memory on · ${mems.length} fact${mems.length===1?"":"s"} stored`:"Memory off · each session starts fresh"}</span>
                {memSaving&&<span style={{marginLeft:"auto",color:T.muted,fontSize:11,display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,0.2)",borderTopColor:"rgba(255,255,255,0.7)",animation:"spin 0.7s linear infinite"}}/>saving...</span>}
                <button onClick={()=>setTab("profile")} style={{marginLeft:memSaving?"4px":"auto",background:"none",border:"none",color:T.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit",textDecoration:"underline"}}>{memOn?"Manage":"Turn on"}</button>
              </div>
            )}

            {/* Messages */}
            <div style={{flex:1,overflowY:"auto",padding:"20px 18px 10px",display:"flex",flexDirection:"column",gap:18}}>
              {messages.map((msg,i)=>(
                <div key={i} style={{display:"flex",flexDirection:msg.role==="user"?"row-reverse":"row",alignItems:"flex-end",gap:9,animation:"fadeUp 0.28s ease"}}>
                  <div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,background:msg.role==="assistant"?AP.colorD:"rgba(255,255,255,0.06)",border:`1px solid ${msg.role==="assistant"?AP.colorB:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>
                    {msg.role==="assistant"?"🛡️":"🎒"}
                  </div>
                  <div style={{maxWidth:"76%",background:msg.role==="user"?"rgba(94,234,212,0.07)":T.card,border:`1px solid ${msg.role==="user"?T.accentB:T.border}`,borderRadius:msg.role==="user"?"16px 4px 16px 16px":"4px 16px 16px 16px",padding:"12px 15px",color:T.text,fontSize:14.5,lineHeight:1.75}}>
                    {nl2br(msg.content)}
                  </div>
                </div>
              ))}

              {/* Mood picker */}
              {moodPicker&&messages.length===1&&(
                <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"18px 20px",animation:"fadeUp 0.35s 0.1s ease both"}}>
                  <p style={{color:T.sub,fontSize:13,textAlign:"center",marginBottom:14}}>How are you feeling right now?</p>
                  <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
                    {MOODS.map(m=>(
                      <button key={m.label} onClick={()=>{setMood(m);setMoodPicker(false);send(`I'm feeling ${m.label} today ${m.emoji}`);}}
                        style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 14px",cursor:"pointer",color:T.sub,fontSize:13,display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all 0.15s",fontFamily:"inherit"}}
                        onMouseEnter={e=>{e.currentTarget.style.background=AP.colorD;e.currentTarget.style.borderColor=AP.colorB;e.currentTarget.style.color=AP.color;}}
                        onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.sub;}}>
                        <span style={{fontSize:22}}>{m.emoji}</span><span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick topics */}
              {!moodPicker&&messages.length<=2&&(
                <div style={{animation:"fadeUp 0.3s ease"}}>
                  <p style={{color:T.muted,fontSize:11,marginBottom:9,fontWeight:500}}>Or pick a topic to get started:</p>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    {TOPICS.map(t=>(
                      <button key={t.label} onClick={()=>send(`I want to talk about: ${t.label}`)}
                        style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 12px",cursor:"pointer",color:T.sub,fontSize:12,display:"flex",gap:6,alignItems:"center",transition:"all 0.15s",fontFamily:"inherit"}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=AP.colorB;e.currentTarget.style.color=AP.color;}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.sub;}}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Typing */}
              {chatBusy&&(
                <div style={{display:"flex",alignItems:"flex-end",gap:9}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:AP.colorD,border:`1px solid ${AP.colorB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🛡️</div>
                  <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:"4px 16px 16px 16px",padding:"14px 18px",display:"flex",gap:5,alignItems:"center"}}>
                    {[0,0.16,0.32].map((d,i)=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:AP.color,animation:`blink 1.1s ${d}s ease-in-out infinite`}}/>)}
                  </div>
                </div>
              )}
              <div ref={endRef}/>
            </div>

            {/* Input */}
            <div style={{flexShrink:0,padding:"10px 18px 18px",borderTop:`1px solid ${T.border}`,background:T.surface}}>
              {voiceErr&&(
                <div style={{background:"rgba(248,113,113,0.07)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:9,padding:"8px 13px",marginBottom:9,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:13}}>⚠️</span><span style={{color:T.danger,fontSize:12,flex:1}}>{voiceErr}</span>
                  <button onClick={()=>setVoiceErr("")} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:16}}>×</button>
                </div>
              )}
              {listening&&(
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:9,padding:"9px 13px",background:AP.colorD,border:`1px solid ${AP.colorB}`,borderRadius:9,animation:"fadeUp 0.2s ease"}}>
                  <div style={{display:"flex",gap:3,alignItems:"center"}}>
                    {[0,0.1,0.2,0.3,0.4].map((d,i)=><div key={i} style={{width:3,borderRadius:3,background:AP.color,animation:`vbar 0.8s ${d}s ease-in-out infinite`,minHeight:3}}/>)}
                  </div>
                  <span style={{color:AP.color,fontSize:12,fontWeight:600}}>Listening... speak now</span>
                  <button onClick={stopVoice} style={{marginLeft:"auto",background:"rgba(255,255,255,0.07)",border:`1px solid ${T.border}`,borderRadius:6,padding:"3px 9px",color:T.sub,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Stop</button>
                </div>
              )}
              <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                {/* Mic */}
                <button onClick={listening?stopVoice:startVoice} disabled={chatBusy}
                  style={{width:40,height:40,borderRadius:10,border:"none",cursor:chatBusy?"not-allowed":"pointer",background:listening?AP.color:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.18s",boxShadow:listening?`0 0 0 4px ${AP.colorD}`:"none"}}>
                  {listening
                    ?<svg width="13" height="13" viewBox="0 0 24 24" fill="#07090f"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                    :<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="11" rx="3" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/><path d="M5 11a7 7 0 0 0 14 0" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="18" x2="12" y2="22" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"/><line x1="9" y1="22" x2="15" y2="22" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"/></svg>
                  }
                </button>
                <textarea ref={inputRef} value={chatInput} onChange={e=>setChatInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
                  placeholder={listening?"Your words appear here...":"Message GuardianGPT..."} rows={1}
                  style={{flex:1,background:"rgba(255,255,255,0.04)",border:`1px solid ${listening?AP.colorB:T.border}`,borderRadius:11,padding:"11px 14px",color:T.text,fontSize:14.5,fontFamily:"inherit",resize:"none",outline:"none",lineHeight:1.6,maxHeight:110,transition:"border-color 0.2s",scrollbarWidth:"none"}}
                  onFocus={e=>e.target.style.borderColor=T.accentB} onBlur={e=>{if(!listening)e.target.style.borderColor=T.border;}}
                  onInput={e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,110)+"px";}}/>
                {/* Send */}
                <button onClick={()=>send()} disabled={!chatInput.trim()||chatBusy}
                  style={{width:40,height:40,borderRadius:10,background:chatInput.trim()&&!chatBusy?T.grad:"rgba(255,255,255,0.05)",border:"none",cursor:chatInput.trim()&&!chatBusy?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13" stroke={chatInput.trim()&&!chatBusy?"#07090f":"rgba(255,255,255,0.2)"} strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={chatInput.trim()&&!chatBusy?"#07090f":"rgba(255,255,255,0.2)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <p style={{color:T.muted,fontSize:11,textAlign:"center",marginTop:7}}>{listening?"Tap the square to stop, then send":"Type or use the mic · GuardianGPT may make mistakes · For serious issues, speak to a trusted adult"}</p>
            </div>
          </div>
        )}

        {/* ─ JOURNAL ─ */}
        {tab==="journal"&&(
          <Gate isGuest={isGuest} feature="Journal — Members Only" onSignup={()=>goAuth("signup")} onLogin={()=>goAuth("login")}>
            <div style={{flex:1,overflowY:"auto",padding:22,display:"flex",flexDirection:"column",gap:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <h2 style={{color:T.text,fontSize:18,fontWeight:700}}>My Journal</h2>
                <span style={{color:T.muted,fontSize:13}}>{entries.length} entries</span>
              </div>
              <Card glow p="18px 20px">
                <p style={{color:T.muted,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:9}}>✦ Today's Prompt</p>
                <p style={{color:T.text,fontSize:15,lineHeight:1.7,marginBottom:14}}>"{JOURNAL_PROMPTS[pIdx%JOURNAL_PROMPTS.length]}"</p>
                <Btn variant="ghost" style={{padding:"6px 13px",fontSize:12}} onClick={()=>setPIdx(i=>i+1)}>Next prompt →</Btn>
              </Card>
              <textarea value={jText} onChange={e=>setJText(e.target.value)} placeholder="Write freely — this is just for you." rows={5}
                style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 15px",color:T.text,fontSize:14.5,fontFamily:"inherit",resize:"vertical",minHeight:120,lineHeight:1.75,outline:"none",transition:"border-color 0.2s"}}
                onFocus={e=>e.target.style.borderColor=T.accentB} onBlur={e=>e.target.style.borderColor=T.border}/>
              <Btn variant="accent" style={{alignSelf:"flex-start"}} onClick={()=>{if(!jText.trim())return;setEntries(p=>[{text:jText,date:fmtDate(),prompt:JOURNAL_PROMPTS[pIdx%JOURNAL_PROMPTS.length]},...p]);setJText("");}}>Save entry</Btn>
              {entries.map((e,i)=>(
                <Card key={i} p="15px 17px">
                  <p style={{color:T.muted,fontSize:11,fontFamily:"monospace",marginBottom:5}}>{e.date}</p>
                  <p style={{color:T.sub,fontSize:12,fontStyle:"italic",marginBottom:9}}>"{e.prompt}"</p>
                  <p style={{color:T.text,fontSize:14,lineHeight:1.75}}>{e.text}</p>
                </Card>
              ))}
              {!entries.length&&<p style={{color:T.muted,textAlign:"center",fontSize:14,padding:"20px 0"}}>Your entries will appear here ✍️</p>}
            </div>
          </Gate>
        )}

        {/* ─ STUDY ─ */}
        {tab==="study"&&(
          <Gate isGuest={isGuest} feature="Study Timer — Members Only" onSignup={()=>goAuth("signup")} onLogin={()=>goAuth("login")}>
            <div style={{flex:1,overflowY:"auto",padding:22,display:"flex",flexDirection:"column",gap:18}}>
              <h2 style={{color:T.text,fontSize:18,fontWeight:700}}>Pomodoro Study Timer</h2>
              <Card glow p="32px 24px" style={{textAlign:"center"}}>
                <p style={{color:timerMode==="focus"?AP.color:"#fb923c",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:10}}>{timerMode==="focus"?"▸ Focus Time":"☕ Break Time"}</p>
                <p style={{color:T.text,fontSize:66,fontFamily:"'Courier New',monospace",fontWeight:700,lineHeight:1,marginBottom:26}}>{fmtTime(timerSecs)}</p>
                <div style={{display:"flex",gap:12,justifyContent:"center"}}>
                  <Btn variant={timerOn?"ghost":"accent"} style={{minWidth:100}} onClick={()=>setTimerOn(a=>!a)}>{timerOn?"Pause":"Start"}</Btn>
                  <Btn variant="ghost" onClick={()=>{setTimerOn(false);setTimerMode("focus");setTimerSecs(25*60);}}>Reset</Btn>
                </div>
                <p style={{color:T.muted,fontSize:13,marginTop:18}}>Sessions today: <strong style={{color:AP.color}}>{pomos}</strong></p>
              </Card>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
                {STUDY_TIPS.map(t=>(
                  <Card key={t.title} p="15px">
                    <div style={{fontSize:22,marginBottom:8}}>{t.icon}</div>
                    <p style={{color:T.text,fontSize:13,fontWeight:600,marginBottom:5}}>{t.title}</p>
                    <p style={{color:T.sub,fontSize:12,lineHeight:1.6}}>{t.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          </Gate>
        )}

        {/* ─ PROGRESS ─ */}
        {tab==="progress"&&(
          <Gate isGuest={isGuest} feature="Progress — Members Only" onSignup={()=>goAuth("signup")} onLogin={()=>goAuth("login")}>
            <div style={{flex:1,overflowY:"auto",padding:22,display:"flex",flexDirection:"column",gap:18}}>
              <h2 style={{color:T.text,fontSize:18,fontWeight:700}}>My Progress</h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                {[
                  {label:"Day Streak", value:streak, icon:"🔥",color:"#fb923c"},
                  {label:"Study Sessions", value:pomos, icon:"🎯",color:T.accent},
                  {label:"Messages Sent", value:totalMsgs, icon:"💬",color:"#818cf8"},
                  {label:"Journal Entries",value:entries.length, icon:"📓",color:"#f472b6"},
                  {label:"Topics Explored",value:6, icon:"🗺️",color:"#fbbf24"},
                  {label:"Member Since", value:user?.since||"—",icon:"⭐",color:T.accent},
                ].map(s=>(
                  <Card key={s.label} p="16px 12px" style={{textAlign:"center"}}>
                    <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
                    <div style={{color:s.color,fontSize:20,fontWeight:700,fontFamily:"'Courier New',monospace"}}>{s.value}</div>
                    <div style={{color:T.muted,fontSize:10,marginTop:4,fontWeight:500}}>{s.label}</div>
                  </Card>
                ))}
              </div>
              <Card p="18px">
                <p style={{color:T.sub,fontSize:12,fontWeight:600,marginBottom:13}}>Weekly Activity</p>
                <div style={{display:"flex",gap:4,alignItems:"flex-end",height:54}}>
                  {["M","T","W","T","F","S","S"].map((d,i)=>{
                    const h=[42,68,50,85,60,25,75][i];
                    return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                      <div style={{width:"100%",background:AP.color,borderRadius:"3px 3px 0 0",height:`${h}%`,opacity:0.7}}/>
                      <div style={{color:T.muted,fontSize:9,fontFamily:"monospace"}}>{d}</div>
                    </div>;
                  })}
                </div>
              </Card>
              <Card glow p="18px 20px">
                <p style={{color:AP.color,fontSize:13,fontWeight:600,marginBottom:8}}>💛 Guardian's Note</p>
                <p style={{color:T.sub,fontSize:14,lineHeight:1.75}}>You're showing up — and that matters more than you know. Every conversation, every journal entry, every study session is a quiet investment in yourself. Keep going, {user?.name?.split(" ")[0]||"there"}.</p>
              </Card>
            </div>
          </Gate>
        )}

        {/* ─ PROFILE ─ */}
        {tab==="profile"&&(
          <Gate isGuest={isGuest} feature="Profile — Members Only" onSignup={()=>goAuth("signup")} onLogin={()=>goAuth("login")}>
            <div style={{flex:1,overflowY:"auto",padding:22,display:"flex",flexDirection:"column",gap:16}}>
              <h2 style={{color:T.text,fontSize:18,fontWeight:700}}>Profile</h2>

              {/* Account card */}
              <Card p="28px 24px" style={{textAlign:"center"}}>
                <div style={{width:64,height:64,borderRadius:"50%",background:AP.colorD,border:`1px solid ${AP.colorB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 14px",color:AP.color,fontWeight:700}}>{user?.name?.[0]?.toUpperCase()}</div>
                <p style={{color:T.text,fontSize:20,fontWeight:700,marginBottom:4}}>{user?.name}</p>
                <p style={{color:T.sub,fontSize:13,marginBottom:10}}>{user?.email}</p>
                <span style={{color:T.accent,fontSize:11,background:T.accentD,border:`1px solid ${T.accentB}`,padding:"3px 12px",borderRadius:20,fontWeight:600}}>✓ Verified Gmail Member</span>
              </Card>

              {[["Full Name",user?.name],["Email",user?.email],["Member Since",user?.since],["Status","✓ Verified"]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"13px 15px",background:T.card,borderRadius:10,border:`1px solid ${T.border}`}}>
                  <span style={{color:T.sub,fontSize:14}}>{k}</span>
                  <span style={{color:T.text,fontSize:14,fontWeight:500}}>{v}</span>
                </div>
              ))}

              {/* Memory */}
              <div>
                <p style={{color:T.sub,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:11}}>Memory</p>
                <div style={{background:T.card,border:`1px solid ${memOn?"rgba(74,222,128,0.28)":T.border}`,borderRadius:12,padding:"14px 15px",display:"flex",alignItems:"center",gap:12,marginBottom:11,transition:"border-color 0.2s"}}>
                  <div style={{flex:1}}>
                    <p style={{color:T.text,fontSize:14,fontWeight:600,marginBottom:2}}>Remember conversations</p>
                    <p style={{color:T.muted,fontSize:12,lineHeight:1.5}}>{memOn?`Storing facts from your chats. ${mems.length} thing${mems.length===1?"":"s"} remembered.`:"Each chat starts fresh. Nothing saved between sessions."}</p>
                  </div>
                  <div onClick={()=>toggleMem(!memOn)} style={{width:44,height:24,borderRadius:12,background:memOn?"#4ade80":"rgba(255,255,255,0.1)",cursor:"pointer",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
                    <div style={{position:"absolute",top:3,left:memOn?22:3,width:18,height:18,borderRadius:"50%",background:memOn?"#07090f":"rgba(255,255,255,0.45)",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.4)"}}/>
                  </div>
                </div>
                {memOn&&(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {mems.length>0&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <p style={{color:T.muted,fontSize:11}}>{mems.length} fact{mems.length===1?"":"s"} stored</p>
                      <button onClick={clearMems} style={{background:"none",border:"none",color:"rgba(248,113,113,0.65)",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Clear all</button>
                    </div>}
                    {!mems.length&&<div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:11,padding:"16px",textAlign:"center"}}><p style={{color:T.muted,fontSize:13,lineHeight:1.6}}>No memories yet. Keep chatting — I'll quietly remember what matters.</p></div>}
                    {mems.map(m=>(
                      <div key={m.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 13px",display:"flex",alignItems:"flex-start",gap:10}}>
                        <span style={{fontSize:14,flexShrink:0,marginTop:1}}>🧠</span>
                        <div style={{flex:1}}><p style={{color:T.text,fontSize:13,lineHeight:1.55}}>{m.text}</p><p style={{color:T.muted,fontSize:10,marginTop:3}}>Remembered {m.date}</p></div>
                        <button onClick={()=>delMem(m.id)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:16,lineHeight:1,flexShrink:0}}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Persona switcher */}
              <div>
                <p style={{color:T.sub,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:11}}>Guardian Mode</p>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {PERSONAS.map(p=>(
                    <button key={p.key} onClick={()=>{setPersona(p.key);setMessages([]);setTab("chat");}}
                      style={{background:persona===p.key?p.colorD:T.card,border:`1px solid ${persona===p.key?p.colorB:T.border}`,borderRadius:11,padding:"12px 15px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"all 0.15s",fontFamily:"inherit"}}
                      onMouseEnter={e=>{if(persona!==p.key){e.currentTarget.style.borderColor=p.colorB;e.currentTarget.style.background=p.colorD;}}}
                      onMouseLeave={e=>{if(persona!==p.key){e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.card;}}}>
                      <span style={{fontSize:18}}>{p.icon}</span>
                      <div style={{flex:1,textAlign:"left"}}>
                        <span style={{color:persona===p.key?p.color:T.text,fontSize:14,fontWeight:600}}>{p.label}</span>
                        <span style={{color:T.muted,fontSize:12,marginLeft:8}}>{p.tagline}</span>
                      </div>
                      {persona===p.key&&<span style={{color:p.color,fontSize:11,fontWeight:700}}>Active</span>}
                    </button>
                  ))}
                </div>
              </div>

              <Btn variant="danger" full style={{marginTop:4}} onClick={()=>{setUser(null);setMessages([]);setPersona(null);setTab("chat");setScreen("landing");}}>Sign out</Btn>
            </div>
          </Gate>
        )}
      </div>
    </div>
  );
}
