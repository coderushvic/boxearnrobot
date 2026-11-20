import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine, ArrowRight, ArrowUpRight, Bell, CalendarCheck2, Check,
  CheckCircle2, ChevronRight, CircleHelp, Copy, Gift, History, Home,
  Link2, LockKeyhole, LogOut, PlayCircle, Settings, ShieldCheck, Sparkles,
  Target, Ticket, UserRound, Users, Wallet, X
} from "lucide-react";
import { apiRequest, authenticate } from "./api.js";
import { hasMonetagZone, playRewardedAd } from "./monetag.js";

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
  return <div className={"box-stage " + (open ? "box-stage-open" : "")} aria-label="Emerald mystery gift box">
    <div className="box-aura" /><div className="box-shadow" />
    <div className="gift-box"><div className="gift-lid"><span className="lid-ribbon" /><span className="lid-bow bow-left" /><span className="lid-bow bow-right" /></div><div className="gift-body"><span className="body-ribbon" /><span className="body-front-glow" /></div></div>
    <span className="sparkle sparkle-one">✦</span><span className="sparkle sparkle-two">✧</span><span className="sparkle sparkle-three">✦</span>
  </div>;
}
function SectionTitle({ eyebrow, title, action, onAction }) {
  return <div className="section-title"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{action && <button className="text-action" onClick={onAction}>{action}<ArrowRight size={15}/></button>}</div>;
}

function HomePage({ user, stats, checkedIn, checkinDay, onNavigate, onCheckIn, checkingIn, onWithdraw }) {
  const nextDay = checkinDay;
  return <div className="page-content home-page">
    <div className="welcome-row"><div><div className="eyebrow">YOUR BOX EARN DASHBOARD</div><h1>Good morning<span className="green-dot">.</span></h1><p className="muted">Your next reward is closer than you think.</p></div><button className="icon-button" aria-label="Notifications"><Bell size={19}/><i /></button></div>
    <section className="balance-card"><div className="balance-card-top"><span className="balance-caption"><Wallet size={14}/> TOTAL BALANCE</span><span className="secure-label"><ShieldCheck size={13}/> SECURE WALLET</span></div><div className="balance-amount">{Number(user?.balanceUsdt || 0).toFixed(2)} <span>USDT</span></div><div className="balance-bottom"><span className="muted small">Your available earnings</span><button className="withdraw-button" onClick={onWithdraw}><ArrowDownToLine size={15}/> Withdraw</button></div><div className="balance-orb" /></section>
    <div className="quick-stats">
      <div className="quick-stat" onClick={() => onNavigate("boxes")} role="button" tabIndex={0}><span className="stat-icon emerald"><Gift size={17}/></span><div><small>AVAILABLE BOXES</small><strong>{user?.boxes ?? 0} <em>boxes</em></strong></div><ChevronRight size={16}/></div>
      <div className="quick-stat" onClick={() => onNavigate("invite")} role="button" tabIndex={0}><span className="stat-icon cyan"><Users size={17}/></span><div><small>REFERRALS</small><strong>{stats?.total ?? 0} <em>friends</em></strong></div><ChevronRight size={16}/></div>
    </div>
    <section className="checkin-card"><div className="checkin-head"><div className="checkin-icon"><CalendarCheck2 size={18}/></div><div><span className="eyebrow">DAILY REWARD</span><h3>Daily check-in</h3></div><span className="streak-pill">DAY {nextDay} OF 3</span></div>
      <div className="checkin-days">{[1,2,3].map((day,i)=><div className={"day-reward " + (i===nextDay-1?"today ":"") + (checkedIn && i===nextDay-1?"claimed":"")} key={day}><span>DAY {day}</span><strong>{day}</strong><small>BOX{day>1?"ES":""}</small>{checkedIn && i===nextDay-1 && <i><Check size={11}/></i>}</div>)}</div>
      <button className={"primary-button checkin-button " + (checkedIn?"button-done":"")} onClick={onCheckIn} disabled={checkedIn || checkingIn}>{checkedIn?<><CheckCircle2 size={17}/> Checked in today</>:checkingIn?"Claiming reward…":<>Claim today's box <ArrowRight size={16}/></>}</button>
      <p className="fine-print">Collect 1, 2 and 3 boxes in rotation. Your check-in is recorded securely.</p>
    </section>
    <section className="mystery-section"><SectionTitle eyebrow="A LITTLE MYSTERY. A REAL REWARD." title="Your mystery boxes" action="View all" onAction={() => onNavigate("boxes")}/>
      <div className="mystery-card"><div className="mystery-copy"><span className="limited-tag"><Sparkles size={12}/> THE BOX EXPERIENCE</span><h3>Something good<br/>is inside.</h3><p>Open a box and discover your USDT reward.</p><button className="dark-button" onClick={() => onNavigate("boxes")}>Explore boxes <ArrowUpRight size={15}/></button></div><BoxArtwork/><div className="mystery-count"><Ticket size={13}/> <b>{user?.boxes ?? 0}</b> BOXES READY</div></div>
    </section>
    <section className="earn-section"><SectionTitle eyebrow="KEEP YOUR MOMENTUM" title="Ways to earn" action="All tasks" onAction={() => onNavigate("tasks")}/>
      <div className="earn-row" onClick={() => onNavigate("tasks")} role="button" tabIndex={0}><span className="earn-icon"><Target size={19}/></span><div><b>Complete tasks</b><small>Approved activities earn boxes.</small></div><ArrowRight size={17}/></div>
      <div className="earn-row" onClick={() => onNavigate("tasks")} role="button" tabIndex={0}><span className="earn-icon cyan-bg"><PlayCircle size={19}/></span><div><b>Watch rewarded ads</b><small>Verified Monetag rewards are being connected.</small></div><ArrowRight size={17}/></div>
    </section>
    <div className="referral-strip" onClick={() => onNavigate("invite")} role="button" tabIndex={0}><span className="referral-glyph"><Users size={20}/></span><div><b>Good things are better shared</b><small>Invite a friend and earn a mystery box.</small></div><ArrowRight size={17}/></div>
    <div className="activity-footer"><span><History size={14}/> Recent activity</span><span className="muted">Your rewards are stored securely.</span></div>
  </div>;
}

function TasksPage({ tasks, onSubmit, submitting, onWatchAd, watchingAd, adStats }) {
  return <div className="page-content subpage"><div className="page-intro"><span className="eyebrow">YOUR EARNING HUB</span><h1>Tasks<span className="green-dot">.</span></h1><p className="muted">Complete verified activities and collect more mystery boxes.</p></div>
    <div className="task-summary"><div><small>TASKS AVAILABLE</small><b>{String(tasks.length).padStart(2,"0")}</b></div><div><small>REWARD SYSTEM</small><b>LIVE</b></div><div><small>VERIFICATION</small><b>ADMIN</b></div></div>
    <SectionTitle eyebrow="EARN BOXES" title="Available tasks"/>
    {tasks.length ? <div className="task-list">{tasks.map(t=><article className="task-card" key={t.id}><div className="task-card-top"><span className="task-icon"><Target size={19}/></span><span className="task-tag">VERIFIED TASK</span></div><h3>{t.title}</h3><p>{t.description}</p><div className="task-card-bottom"><span className="reward-chip"><Gift size={13}/>{t.reward_boxes} boxes</span><button className="outline-button" disabled={submitting===t.id} onClick={()=>onSubmit(t.id)}>{submitting===t.id?"Submitting…":"Submit task"}</button></div></article>)}</div> : <div className="empty-state"><Target size={22}/><b>New tasks are being prepared</b><span>Verified tasks will appear here when their rules and reward settings are configured.</span></div>}
    <div className="notice-card"><ShieldCheck size={18}/><p>Task rewards are credited only after server-side approval. Repeated submissions cannot generate extra boxes.</p></div>
    <article className="task-card"><div className="task-card-top"><span className="task-icon"><PlayCircle size={19}/></span><span className="task-tag">MONETAG</span></div><h3>Rewarded advertisements</h3><p>Target: 200 verified ad views for 50 boxes. Ad rewards remain disabled until the official Monetag postback is configured and verified.</p><div className="task-card-bottom"><span className="reward-chip"><Gift size={13}/>{adStats?.progressToNextReward ?? 0} / 200 verified ads</span><button className="outline-button" disabled={!hasMonetagZone || watchingAd} onClick={onWatchAd}>{!hasMonetagZone ? "Zone ID needed" : watchingAd ? "Loading ad…" : "Watch ad"}</button></div><p className="fine-print">50 boxes are credited after every 200 unique, paid impressions confirmed by Monetag.</p></article>
  </div>;
}

function BoxesPage({ user, onOpen, opening, reward }) {
  return <div className="page-content subpage"><div className="page-intro"><span className="eyebrow">THE REWARD REVEAL</span><h1>Mystery boxes<span className="green-dot">.</span></h1><p className="muted">Every box holds a little surprise.</p></div>
    <div className="boxes-hero"><span className="limited-tag"><Sparkles size={12}/> YOUR BOX COLLECTION</span><BoxArtwork open={Boolean(reward)}/><div className="boxes-count"><b>{user?.boxes ?? 0}</b><span>BOXES AVAILABLE</span></div><h2>{reward?"Congratulations!":"Ready for a surprise?"}</h2><p>{reward?"Your reward has been added to your account balance.":"Open a box to reveal a random USDT reward between $0.05 and $0.09."}</p>{reward&&<div className="reward-chip"><Sparkles size={13}/> You won {reward} USDT</div>}<button className="primary-button" onClick={onOpen} disabled={opening || !(user?.boxes>0)}>{opening?"Opening…":user?.boxes>0?"Open a mystery box":"No boxes available"}<ArrowRight size={16}/></button><small className="fine-print">Every opening is recorded in your account ledger.</small></div>
    <div className="reward-range"><span>REWARD RANGE</span><b>$0.05 – $0.09 <small>USDT</small></b></div>
    <SectionTitle eyebrow="YOUR HISTORY" title="Recent box activity"/><div className="empty-state"><History size={22}/><b>Box history</b><span>Your completed openings are recorded in your account ledger.</span></div>
  </div>;
}

function InvitePage({ user, stats, referrals }) {
  const [copied,setCopied]=useState(false);
  const link=user?.referralLink || "";
  return <div className="page-content subpage"><div className="page-intro"><span className="eyebrow">GROW TOGETHER</span><h1>Invite & earn<span className="green-dot">.</span></h1><p className="muted">Share BOX EARN with friends and earn more boxes.</p></div>
    <div className="invite-hero"><div className="invite-orbit"><Users size={29}/></div><span className="eyebrow">YOUR REFERRAL REWARD</span><h2>1 mystery box</h2><p>For every friend who joins with your link and completes 2 approved tasks.</p><div className="invite-steps"><span><i>1</i> Invite a friend</span><span><i>2</i> They complete 2 tasks</span><span><i>3</i> You get 1 box</span></div></div>
    <div className="referral-link-card"><span className="eyebrow">YOUR INVITE LINK</span><div className="link-value"><Link2 size={16}/><span>{link || "Open inside Telegram to generate your link."}</span></div><button className="primary-button" disabled={!link} onClick={async()=>{try{await navigator.clipboard.writeText(link);setCopied(true);}catch{setCopied(false);}}}>{copied?<><Check size={16}/> Copied</>:<><Copy size={16}/> Copy invite link</>}</button></div>
    <div className="task-summary"><div><small>TOTAL INVITES</small><b>{stats?.total ?? 0}</b></div><div><small>QUALIFIED</small><b>{stats?.qualified ?? 0}</b></div><div><small>BOXES EARNED</small><b>{stats?.boxesEarned ?? 0}</b></div></div>
    <SectionTitle eyebrow="YOUR NETWORK" title="Referral activity"/>{referrals.length?<div className="task-list">{referrals.map(r=><article className="task-card" key={r.telegram_id}><h3>{r.username?"@"+r.username:r.first_name}</h3><p>Joined {new Date(r.created_at).toLocaleDateString()} · {r.status}</p><span className="reward-chip">{r.status==="qualified"?"1 box rewarded":"2 approved tasks to qualify"}</span></article>)}</div>:<div className="empty-state"><Users size={22}/><b>Your network starts here</b><span>Friends who join with your link will appear here.</span></div>}
  </div>;
}

function ProfilePage({ user, onWithdraw }) {
  return <div className="page-content subpage"><div className="page-intro"><span className="eyebrow">YOUR ACCOUNT</span><h1>Profile<span className="green-dot">.</span></h1><p className="muted">Manage your wallet and account preferences.</p></div>
    <div className="profile-card"><div className="avatar"><UserRound size={25}/></div><div><b>{user?.firstName||"BOX EARN member"}</b><span>{user?.username?"@"+user.username:"Telegram account"}</span></div><span className="member-pill">MEMBER</span></div>
    <div className="wallet-panel"><div className="wallet-panel-head"><span><Wallet size={16}/> WALLET BALANCE</span><span className="secure-label"><LockKeyhole size={12}/> SECURE</span></div><b>{Number(user?.balanceUsdt||0).toFixed(2)} <small>USDT</small></b><p>Minimum withdrawal: $0.10 USDT · BEP20</p><button className="primary-button" onClick={onWithdraw}><ArrowDownToLine size={16}/> Withdraw funds</button></div>
    <SectionTitle eyebrow="ACCOUNT" title="Account settings"/>
    <div className="settings-list"><button><span><History size={18}/> Transaction history</span><ChevronRight size={17}/></button><button><Wallet size={18}/><span>Withdrawal history</span><ChevronRight size={17}/></button><button><Settings size={18}/><span>Preferences</span><ChevronRight size={17}/></button><button><CircleHelp size={18}/><span>Help & support</span><ChevronRight size={17}/></button><button><LogOut size={18}/><span>Sign out</span><ChevronRight size={17}/></button></div>
    <div className="notice-card"><ShieldCheck size={18}/><p>Your balance and rewards are protected. Withdrawals are reviewed before processing.</p></div>
  </div>;
}

export default function App() {
  const [active,setActive]=useState("home");
  const [user,setUser]=useState(null);
  const [stats,setStats]=useState(null);
  const [referrals,setReferrals]=useState([]);
  const [tasks,setTasks]=useState([]);
  const [adStats,setAdStats]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [checkingIn,setCheckingIn]=useState(false);
  const [submitting,setSubmitting]=useState("");
  const [opening,setOpening]=useState(false);
  const [watchingAd,setWatchingAd]=useState(false);
  const [lastReward,setLastReward]=useState("");
  const [withdrawOpen,setWithdrawOpen]=useState(false);
  const [amount,setAmount]=useState("0.10");
  const [wallet,setWallet]=useState("");
  const [withdrawing,setWithdrawing]=useState(false);
  const current=useMemo(()=>navItems.find(n=>n.id===active),[active]);

  async function refreshData() {
    const results=await Promise.all([apiRequest("/api/me"),apiRequest("/api/referrals"),apiRequest("/api/tasks"),apiRequest("/api/ads/stats")]);
    setUser(results[0].user); setStats(results[1].stats); setReferrals(results[1].referrals||[]); setTasks(results[2].tasks||[]); setAdStats(results[3].stats);
  }
  useEffect(()=>{
    let live=true;
    (async()=>{
      try {
        const auth=await authenticate();
        if(!live)return;
        setUser(auth.user);
        await refreshData();
      } catch(e) { if(live)setError(e.message||"Unable to connect."); }
      finally { if(live)setLoading(false); }
    })();
    return ()=>{live=false;};
  },[]);

  const dateParts=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:"Africa/Lagos",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()).map(p=>[p.type,p.value]));
  const today=dateParts.year+"-"+dateParts.month+"-"+dateParts.day;
  const yesterdayDate=new Date(today+"T12:00:00Z"); yesterdayDate.setUTCDate(yesterdayDate.getUTCDate()-1);
  const yesterday=yesterdayDate.toISOString().slice(0,10);
  const checkedIn=user?.lastCheckinDate===today;
  const checkinCycleNext=user?.lastCheckinDate===yesterday?((user.checkinCycle+1)%3):0;
  const checkinDay=checkedIn?(user?.checkinCycle??0)+1:checkinCycleNext+1;
  async function perform(action,success) {
    setNotice("");
    try { const result=await action(); await refreshData(); if(success)setNotice(success); return result; }
    catch(e) { setNotice(e.message||"Something went wrong."); return null; }
  }
  async function checkIn() {
    if(checkedIn||checkingIn)return;
    setCheckingIn(true);
    const result=await perform(()=>apiRequest("/api/checkin",{method:"POST",body:"{}"}));
    if(result)setNotice("You received "+result.boxesAwarded+" "+(result.boxesAwarded===1?"box":"boxes")+"!");
    setCheckingIn(false);
  }
  async function openBox() {
    if(opening||!(user?.boxes>0))return;
    setOpening(true);setLastReward("");
    const result=await perform(()=>apiRequest("/api/boxes/open",{method:"POST",body:"{}"}));
    if(result)setLastReward(result.rewardUsdt);
    setOpening(false);
  }
  async function watchAd() {
    if (watchingAd || !hasMonetagZone) return;
    setWatchingAd(true); setNotice("");
    try {
      const session=await apiRequest("/api/ads/session",{method:"POST",body:"{}"});
      await playRewardedAd(session.ymid);
      await refreshData();
      setNotice("Ad closed. Monetag will credit progress only after its server confirms a paid impression.");
    } catch(e) { setNotice(e.message || "The ad could not be verified. Please try again later."); }
    finally { setWatchingAd(false); }
  }
  async function submitTask(taskId) {
    setSubmitting(taskId);
    await perform(()=>apiRequest("/api/tasks/submit",{method:"POST",body:JSON.stringify({taskId})}),"Task submitted for review.");
    setSubmitting("");
  }
  async function submitWithdrawal(e) {
    e.preventDefault();if(withdrawing)return;
    setWithdrawing(true);
    const result=await perform(()=>apiRequest("/api/withdrawals",{method:"POST",body:JSON.stringify({amountUsdt:amount,walletAddress:wallet})}),"Withdrawal request submitted for admin review.");
    if(result){setWithdrawOpen(false);setWallet("");}
    setWithdrawing(false);
  }

  if(loading)return <div className="app-shell"><header className="topbar"><Brand/></header><div className="empty-state"><Sparkles size={22}/><b>Connecting securely…</b><span>Loading your BOX EARN account.</span></div></div>;
  if(error&&!user)return <div className="app-shell"><header className="topbar"><Brand/></header><div className="page-content subpage"><div className="empty-state"><ShieldCheck size={24}/><b>Telegram sign-in required</b><span>{error}</span><p>Open the BOX EARN Mini App from @boxearnrobot in Telegram.</p></div></div></div>;

  return <div className="app-shell">
    <header className="topbar"><Brand/><button className="top-avatar" onClick={()=>setActive("profile")} aria-label="Open profile"><UserRound size={17}/></button></header>
    <main key={active} className="main-view">
      {active==="home"&&<HomePage user={user} stats={stats} onNavigate={setActive} checkedIn={checkedIn} checkinDay={checkinDay} onCheckIn={checkIn} checkingIn={checkingIn} onWithdraw={()=>setWithdrawOpen(true)}/>}
      {active==="tasks"&&<TasksPage tasks={tasks} onSubmit={submitTask} submitting={submitting} onWatchAd={watchAd} watchingAd={watchingAd} adStats={adStats}/>}
      {active==="boxes"&&<BoxesPage user={user} onOpen={openBox} opening={opening} reward={lastReward}/>}
      {active==="invite"&&<InvitePage user={user} stats={stats} referrals={referrals}/>}
      {active==="profile"&&<ProfilePage user={user} onWithdraw={()=>setWithdrawOpen(true)}/>}
    </main>
    {notice&&<div className="toast-message" role="status">{notice}<button onClick={()=>setNotice("")} aria-label="Dismiss"><X size={14}/></button></div>}
    <nav className="bottom-nav" aria-label="Main navigation">{navItems.map(({id,label,Icon})=><button key={id} className={active===id?"active":""} onClick={()=>setActive(id)}><Icon size={20} strokeWidth={active===id?2.2:1.7}/><span>{label}</span></button>)}</nav>
    {withdrawOpen&&<div className="modal-backdrop" onClick={()=>setWithdrawOpen(false)}><form className="withdraw-modal" onSubmit={submitWithdrawal} onClick={e=>e.stopPropagation()}><button type="button" className="modal-close" onClick={()=>setWithdrawOpen(false)}>×</button><span className="modal-icon"><Wallet size={22}/></span><span className="eyebrow">USDT · BEP20</span><h2>Withdraw funds</h2><p>Requests are reviewed by the BOX EARN admin before payment.</p><div className="modal-balance"><span>AVAILABLE BALANCE</span><b>{Number(user?.balanceUsdt||0).toFixed(2)} USDT</b></div><label className="withdraw-label">Amount (USDT)<input type="number" min="0.10" step="0.000001" required value={amount} onChange={e=>setAmount(e.target.value)}/></label><label className="withdraw-label">BEP20 wallet address<input type="text" required placeholder="0x…" value={wallet} onChange={e=>setWallet(e.target.value)}/></label><button className="primary-button" type="submit" disabled={withdrawing}>{withdrawing?"Submitting…":"Submit withdrawal request"}<ArrowRight size={16}/></button></form></div>}
  </div>;
}
