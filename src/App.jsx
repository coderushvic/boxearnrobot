import { useMemo, useState } from "react";
import {
  ArrowDownToLine, ArrowRight, ArrowUpRight, Bell, CalendarCheck2, Check,
  CheckCircle2, ChevronRight, CircleHelp, Copy, Gift, History, Home,
  Link2, LockKeyhole, LogOut, Menu, MoreHorizontal, PlayCircle, Plus,
  Settings, ShieldCheck, Sparkles, Target, Ticket, Trophy, UserRound,
  Users, Wallet, Zap
} from "lucide-react";

const navItems = [
  { id: "home", label: "Home", Icon: Home },
  { id: "tasks", label: "Tasks", Icon: Target },
  { id: "boxes", label: "Boxes", Icon: Gift },
  { id: "invite", label: "Invite", Icon: Users },
  { id: "profile", label: "Profile", Icon: UserRound }
];

function Brand() {
  return <div className="brand"><span className="brand-symbol"><span /></span><span>BOX<span className="brand-green">EARN</span></span></div>;
}

function BoxArtwork({ open = false }) {
  return <div className={`box-stage ${open ? "box-stage-open" : ""}`} aria-label="Emerald mystery gift box">
    <div className="box-aura" />
    <div className="box-shadow" />
    <div className="gift-box">
      <div className="gift-lid"><span className="lid-ribbon" /><span className="lid-bow bow-left" /><span className="lid-bow bow-right" /></div>
      <div className="gift-body"><span className="body-ribbon" /><span className="body-front-glow" /></div>
    </div>
    <span className="sparkle sparkle-one">✦</span><span className="sparkle sparkle-two">✧</span><span className="sparkle sparkle-three">✦</span>
  </div>;
}

function SectionTitle({ eyebrow, title, action, onAction }) {
  return <div className="section-title"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{action && <button className="text-action" onClick={onAction}>{action}<ArrowRight size={15}/></button>}</div>;
}

function HomePage({ onNavigate, checkedIn, onCheckIn }) {
  return <div className="page-content home-page">
    <div className="welcome-row"><div><div className="eyebrow">FRIDAY, 20 NOVEMBER</div><h1>Good morning<span className="green-dot">.</span></h1><p className="muted">Your next reward is closer than you think.</p></div><button className="icon-button" aria-label="Notifications"><Bell size={19}/><i /></button></div>
    <section className="balance-card">
      <div className="balance-card-top"><span className="balance-caption"><Wallet size={14}/> TOTAL BALANCE</span><span className="secure-label"><ShieldCheck size={13}/> SECURE WALLET</span></div>
      <div className="balance-amount">0.00 <span>USDT</span></div>
      <div className="balance-bottom"><span className="muted small">Your available earnings</span><button className="withdraw-button" onClick={() => onNavigate("profile")}><ArrowDownToLine size={15}/> Withdraw</button></div>
      <div className="balance-orb" />
    </section>
    <div className="quick-stats">
      <div className="quick-stat"><span className="stat-icon emerald"><Gift size={17}/></span><div><small>AVAILABLE BOXES</small><strong>0 <em>boxes</em></strong></div><ChevronRight size={16}/></div>
      <div className="quick-stat" onClick={() => onNavigate("invite")} role="button" tabIndex={0}><span className="stat-icon cyan"><Users size={17}/></span><div><small>REFERRALS</small><strong>0 <em>friends</em></strong></div><ChevronRight size={16}/></div>
    </div>
    <section className="checkin-card">
      <div className="checkin-head"><div className="checkin-icon"><CalendarCheck2 size={18}/></div><div><span className="eyebrow">DAILY REWARD</span><h3>Daily check-in</h3></div><span className="streak-pill">DAY 1 OF 3</span></div>
      <div className="checkin-days">{[1,2,3].map((day,i)=><div className={`day-reward ${i===0?"today":""} ${checkedIn && i===0?"claimed":""}`} key={day}><span>DAY {day}</span><strong>{day}</strong><small>BOX{day>1?"ES":""}</small>{checkedIn && i===0 && <i><Check size={11}/></i>}</div>)}</div>
      <button className={`primary-button checkin-button ${checkedIn?"button-done":""}`} onClick={onCheckIn} disabled={checkedIn}>{checkedIn?<><CheckCircle2 size={17}/> Checked in today</>:<>Claim today's box <ArrowRight size={16}/></>}</button>
      <p className="fine-print">Check in daily to collect 1, 2 and 3 boxes in rotation.</p>
    </section>
    <section className="mystery-section">
      <SectionTitle eyebrow="A LITTLE MYSTERY. A REAL REWARD." title="Your mystery boxes" action="View all" onAction={() => onNavigate("boxes")}/>
      <div className="mystery-card">
        <div className="mystery-copy"><span className="limited-tag"><Sparkles size={12}/> THE BOX EXPERIENCE</span><h3>Something good<br/>is inside.</h3><p>Open a box and discover your USDT reward.</p><button className="dark-button" onClick={() => onNavigate("boxes")}>Explore boxes <ArrowUpRight size={15}/></button></div>
        <BoxArtwork/>
        <div className="mystery-count"><Ticket size={13}/> <b>0</b> BOXES READY</div>
      </div>
    </section>
    <section className="earn-section">
      <SectionTitle eyebrow="KEEP YOUR MOMENTUM" title="Ways to earn" action="All tasks" onAction={() => onNavigate("tasks")}/>
      <div className="earn-row" onClick={() => onNavigate("tasks")} role="button" tabIndex={0}><span className="earn-icon"><Target size={19}/></span><div><b>Complete tasks</b><small>Simple activities. More boxes.</small></div><ArrowRight size={17}/></div>
      <div className="earn-row" onClick={() => onNavigate("tasks")} role="button" tabIndex={0}><span className="earn-icon cyan-bg"><PlayCircle size={19}/></span><div><b>Watch rewarded ads</b><small>Watch verified ads to earn boxes.</small></div><ArrowRight size={17}/></div>
    </section>
    <div className="referral-strip" onClick={() => onNavigate("invite")} role="button" tabIndex={0}><span className="referral-glyph"><Users size={20}/></span><div><b>Good things are better shared</b><small>Invite a friend and earn a mystery box.</small></div><ArrowRight size={17}/></div>
    <div className="activity-footer"><span><History size={14}/> Recent activity</span><span className="muted">No activity yet</span></div>
  </div>;
}

function TasksPage() {
  const [completed, setCompleted] = useState([]);
  const tasks = [
    { id:"telegram", title:"Join our Telegram channel", desc:"Stay up to date with BOX EARN news.", reward:"2 boxes", tag:"COMMUNITY", Icon:Users },
    { id:"daily", title:"Daily check-in", desc:"Come back every day to collect your boxes.", reward:"1–3 boxes", tag:"DAILY", Icon:CalendarCheck2 },
    { id:"watch", title:"Watch rewarded ads", desc:"Watch verified Monetag ads and earn boxes.", reward:"50 boxes / 200 ads", tag:"MONETAG", Icon:PlayCircle }
  ];
  return <div className="page-content subpage"><div className="page-intro"><span className="eyebrow">YOUR EARNING HUB</span><h1>Tasks<span className="green-dot">.</span></h1><p className="muted">Complete activities and collect more mystery boxes.</p></div>
    <div className="task-summary"><div><small>TASKS AVAILABLE</small><b>03</b></div><div><small>BOXES EARNED</small><b>{completed.length*2}</b></div><div><small>IN PROGRESS</small><b>{3-completed.length}</b></div></div>
    <SectionTitle eyebrow="EARN BOXES" title="Available tasks"/>
    <div className="task-list">{tasks.map(t=><article className="task-card" key={t.id}><div className="task-card-top"><span className="task-icon"><t.Icon size={19}/></span><span className="task-tag">{t.tag}</span></div><h3>{t.title}</h3><p>{t.desc}</p><div className="task-card-bottom"><span className="reward-chip"><Gift size={13}/>{t.reward}</span><button className={completed.includes(t.id)?"task-done":"outline-button"} onClick={()=>setCompleted(v=>v.includes(t.id)?v:[...v,t.id])}>{completed.includes(t.id)?<><Check size={14}/> Submitted</>:"View task"}</button></div></article>)}</div>
    <div className="notice-card"><ShieldCheck size={18}/><p>Rewards are credited after task completion is verified. Ad views are verified server-side.</p></div>
  </div>;
}

function BoxesPage() {
  const [showOpen,setShowOpen]=useState(false);
  return <div className="page-content subpage"><div className="page-intro"><span className="eyebrow">THE REWARD REVEAL</span><h1>Mystery boxes<span className="green-dot">.</span></h1><p className="muted">Every box holds a little surprise.</p></div>
    <div className="boxes-hero"><span className="limited-tag"><Sparkles size={12}/> YOUR BOX COLLECTION</span><BoxArtwork open={showOpen}/><div className="boxes-count"><b>0</b><span>BOXES AVAILABLE</span></div><h2>{showOpen?"Your next surprise awaits":"Ready for a surprise?"}</h2><p>Collect boxes through daily check-ins, tasks and referrals. Each opened box reveals a USDT reward.</p><button className="primary-button" onClick={()=>setShowOpen(v=>!v)}>{showOpen?"Close preview":"Preview opening"}<ArrowRight size={16}/></button><small className="fine-print">Box opening and rewards will activate when your account is connected.</small></div>
    <div className="reward-range"><span>REWARD RANGE</span><b>$0.05 – $0.09 <small>USDT</small></b></div>
    <SectionTitle eyebrow="YOUR HISTORY" title="Recent box activity"/><div className="empty-state"><History size={22}/><b>No boxes opened yet</b><span>Your box history will appear here.</span></div>
  </div>;
}

function InvitePage() {
  const link = "https://t.me/boxearnrobot?start=ref_your_id";
  const [copied,setCopied]=useState(false);
  return <div className="page-content subpage"><div className="page-intro"><span className="eyebrow">GROW TOGETHER</span><h1>Invite & earn<span className="green-dot">.</span></h1><p className="muted">Share BOX EARN with friends and earn more boxes.</p></div>
    <div className="invite-hero"><div className="invite-orbit"><Users size={29}/></div><span className="eyebrow">YOUR REFERRAL REWARD</span><h2>1 mystery box</h2><p>For every friend who joins with your link and completes 2 approved tasks.</p><div className="invite-steps"><span><i>1</i> Invite a friend</span><span><i>2</i> They complete 2 tasks</span><span><i>3</i> You get 1 box</span></div></div>
    <div className="referral-link-card"><span className="eyebrow">YOUR INVITE LINK</span><div className="link-value"><Link2 size={16}/><span>{link}</span></div><button className="primary-button" onClick={()=>{navigator.clipboard?.writeText(link);setCopied(true);}}>{copied?<><Check size={16}/> Copied</>:<><Copy size={16}/> Copy invite link</>}</button></div>
    <div className="task-summary"><div><small>TOTAL INVITES</small><b>0</b></div><div><small>QUALIFIED</small><b>0</b></div><div><small>BOXES EARNED</small><b>0</b></div></div>
    <SectionTitle eyebrow="YOUR NETWORK" title="Referral activity"/><div className="empty-state"><Users size={22}/><b>Your network starts here</b><span>Friends who join with your link will appear here.</span></div>
  </div>;
}

function ProfilePage({onWithdraw}) {
  return <div className="page-content subpage"><div className="page-intro"><span className="eyebrow">YOUR ACCOUNT</span><h1>Profile<span className="green-dot">.</span></h1><p className="muted">Manage your wallet and account preferences.</p></div>
    <div className="profile-card"><div className="avatar"><UserRound size={25}/></div><div><b>BOX EARN member</b><span>Telegram account connected at launch</span></div><span className="member-pill">MEMBER</span></div>
    <div className="wallet-panel"><div className="wallet-panel-head"><span><Wallet size={16}/> WALLET BALANCE</span><span className="secure-label"><LockKeyhole size={12}/> SECURE</span></div><b>0.00 <small>USDT</small></b><p>Minimum withdrawal: $0.10 USDT · BEP20</p><button className="primary-button" onClick={onWithdraw}><ArrowDownToLine size={16}/> Withdraw funds</button></div>
    <SectionTitle eyebrow="ACCOUNT" title="Account settings"/>
    <div className="settings-list"><button><span><History size={18}/> Transaction history</span><ChevronRight size={17}/></button><button><Wallet size={18}/><span>Withdrawal history</span><ChevronRight size={17}/></button><button><Settings size={18}/><span>Preferences</span><ChevronRight size={17}/></button><button><CircleHelp size={18}/><span>Help & support</span><ChevronRight size={17}/></button><button><LogOut size={18}/><span>Sign out</span><ChevronRight size={17}/></button></div>
    <div className="notice-card"><ShieldCheck size={18}/><p>Your balance and rewards are protected. All withdrawals are reviewed before processing.</p></div>
  </div>;
}

export default function App() {
  const [active,setActive]=useState("home");
  const [checkedIn,setCheckedIn]=useState(false);
  const [withdrawOpen,setWithdrawOpen]=useState(false);
  const current=useMemo(()=>navItems.find(n=>n.id===active),[active]);
  return <div className="app-shell">
    <header className="topbar"><Brand/><button className="top-avatar" onClick={()=>setActive("profile")} aria-label="Open profile"><UserRound size={17}/></button></header>
    <main key={active} className="main-view">
      {active==="home"&&<HomePage onNavigate={setActive} checkedIn={checkedIn} onCheckIn={()=>setCheckedIn(true)}/>}
      {active==="tasks"&&<TasksPage/>}
      {active==="boxes"&&<BoxesPage/>}
      {active==="invite"&&<InvitePage/>}
      {active==="profile"&&<ProfilePage onWithdraw={()=>setWithdrawOpen(true)}/>}
    </main>
    <nav className="bottom-nav" aria-label="Main navigation">{navItems.map(({id,label,Icon})=><button key={id} className={active===id?"active":""} onClick={()=>setActive(id)}><Icon size={20} strokeWidth={active===id?2.2:1.7}/><span>{label}</span></button>)}</nav>
    {withdrawOpen&&<div className="modal-backdrop" onClick={()=>setWithdrawOpen(false)}><div className="withdraw-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setWithdrawOpen(false)}>×</button><span className="modal-icon"><Wallet size={22}/></span><span className="eyebrow">USDT · BEP20</span><h2>Withdraw funds</h2><p>Withdrawals will be enabled once your wallet and account verification are connected.</p><div className="modal-balance"><span>AVAILABLE BALANCE</span><b>0.00 USDT</b></div><button className="primary-button" onClick={()=>setWithdrawOpen(false)}>Got it</button></div></div>}
  </div>;
}
