import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine, ArrowRight, ArrowUpRight, Bell, CalendarCheck2, Check,
  CheckCircle2, ChevronRight, CircleHelp, Copy, Gift, History, Home,
  Link2, LockKeyhole, LogOut, PlayCircle, Settings, ShieldCheck, Sparkles,
  Target, Ticket, UserRound, Users, Wallet, X, Facebook, Send, Youtube, Instagram
} from "lucide-react";
import { apiRequest, authenticate } from "./api.js";
import confetti from "canvas-confetti";
import { hasMonetagZone, playRewardedAd } from "./monetag.js";

const navItems = [
  { id: "home", label: "Home", Icon: Home },
  { id: "tasks", label: "Tasks", Icon: Target },
  { id: "boxes", label: "Boxes", Icon: Gift },
  { id: "invite", label: "Invite", Icon: Users },
  { id: "profile", label: "Profile", Icon: UserRound }
];

function Brand() {
  return <div className="brand" aria-label="BOX EARN"><img src="/assets/boxearn/boxearn-logo.webp" alt="BOX EARN" /></div>;
}
function BoxArtwork({ revealing = false, onRevealComplete, inactive = false, boxCount }) {
  return <div className={"box-stage original-box-artwork custom-gift-art" + (revealing ? " revealing" : "") + (inactive ? " inactive" : "")} role="img" aria-label={revealing ? "BOX EARN mystery gift opening" : "Original BOX EARN emerald and gold mystery gift"} onAnimationEnd={revealing ? onRevealComplete : undefined}>
    <span className="box-art-glow" aria-hidden="true" />
    <span className="custom-gift-shadow" aria-hidden="true" />
    <div className="custom-gift" aria-hidden="true">
      <span className="custom-gift-side" />
      <span className="custom-gift-body"><i className="custom-gift-ribbon" /><i className="custom-gift-emblem"><Gift size={23}/></i>{boxCount > 0 && <span className="home-box-count" aria-label={boxCount + " boxes available"}>{boxCount}</span>}</span>
      <span className="custom-gift-lid"><i className="custom-lid-ribbon" /></span>
      <span className="custom-bow"><i /><i /><b /></span>
      <span className="custom-gift-spark custom-spark-a">✦</span><span className="custom-gift-spark custom-spark-b">✧</span>
    </div>
  </div>;
}
function SectionTitle({ eyebrow, title, action, onAction }) {
  return <div className="section-title"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{action && <button className="text-action" onClick={onAction}>{action}<ArrowRight size={15}/></button>}</div>;
}

function HomePage({ user, stats, activity = [], checkedIn, checkinDay, onNavigate, onCheckIn, checkingIn, onWithdraw }) {
  const nextDay = checkinDay;
  return <div className="page-content home-page">
    <div className="welcome-row"><div><div className="eyebrow">YOUR BOX EARN DASHBOARD</div><h1>Good morning<span className="green-dot">.</span></h1><p className="muted">Your next reward is closer than you think.</p></div><button className="icon-button" aria-label="Notifications"><Bell size={19}/><i /></button></div>
    <section className="balance-card"><div className="balance-card-top"><span className="balance-caption"><Wallet size={14}/> TOTAL BALANCE</span><span className="secure-label"><ShieldCheck size={13}/> SECURE WALLET</span></div><div className="balance-amount">{Number(user?.balanceUsdt || 0).toFixed(2)} <span>USDT</span></div><div className="balance-bottom"><span className="muted small">Your available earnings</span><button className="withdraw-button" onClick={onWithdraw}><ArrowDownToLine size={15}/> Withdraw</button></div><div className="balance-orb" /></section>
    <div className="quick-stats referral-only">
      <div className="quick-stat" onClick={() => onNavigate("invite")} role="button" tabIndex={0}><span className="stat-icon cyan"><Users size={17}/></span><div><small>YOUR REFERRALS</small><strong>{stats?.total ?? 0} <em>friends</em></strong></div><ChevronRight size={16}/></div>
    </div>
    <section className="checkin-card"><div className="checkin-head"><div className="checkin-icon"><CalendarCheck2 size={18}/></div><div><span className="eyebrow">DAILY REWARD</span><h3>Daily check-in</h3></div><span className="streak-pill">DAY {nextDay} OF 7</span></div>
      <div className="checkin-days">{[1,2,3,4,5,6,7].map((day,i)=><div className={"day-reward " + (i===nextDay-1?"today ":"") + (checkedIn && day===nextDay?"claimed":"") + (day<nextDay || (checkedIn && day===nextDay)?" completed":"")} key={day}><span>DAY {day}</span><strong>+{day}</strong><small>{day===1?"BOX":"BOXES"}</small>{(day<nextDay || (checkedIn && day===nextDay)) && <i><Check size={11}/></i>}</div>)}</div>
      <button className={"primary-button checkin-button " + (checkedIn?"button-done":"")} onClick={onCheckIn} disabled={checkedIn || checkingIn}>{checkedIn?<><CheckCircle2 size={17}/> Checked in today</>:checkingIn?"Claiming reward…":<>Claim +{nextDay} {nextDay===1?"box":"boxes"} <ArrowRight size={16}/></>}</button>
      <p className="fine-print">Build your streak to earn up to 7 boxes.</p>
    </section>
    <section className="mystery-section"><SectionTitle eyebrow="A LITTLE MYSTERY. A REAL REWARD." title="Your mystery boxes" action="View all" onAction={() => onNavigate("boxes")}/>
      <div className="mystery-card"><div className="mystery-copy"><span className="limited-tag"><Sparkles size={12}/> THE BOX EXPERIENCE</span><h3>Something good<br/>is inside.</h3><p>Open a box and discover your USDT reward.</p><button className="dark-button" onClick={() => onNavigate("boxes")}>Explore boxes <ArrowUpRight size={15}/></button></div><BoxArtwork boxCount={user?.boxes ?? 0}/></div>
    </section>
    <section className="earn-section"><SectionTitle eyebrow="KEEP YOUR MOMENTUM" title="Ways to earn" action="All tasks" onAction={() => onNavigate("tasks")}/>
      <div className="earn-row" onClick={() => onNavigate("tasks")} role="button" tabIndex={0}><span className="earn-icon"><Target size={19}/></span><div><b>Complete tasks</b><small>Approved activities earn boxes.</small></div><ArrowRight size={17}/></div>
      <div className="earn-row" onClick={() => onNavigate("tasks")} role="button" tabIndex={0}><span className="earn-icon cyan-bg"><PlayCircle size={19}/></span><div><b>Watch rewarded ads</b><small>Earn a mystery box with every completed ad.</small></div><ArrowRight size={17}/></div>
    </section>
    <div className="referral-strip" onClick={() => onNavigate("invite")} role="button" tabIndex={0}><span className="referral-glyph"><Users size={20}/></span><div><b>Good things are better shared</b><small>Invite a friend and earn a mystery box.</small></div><ArrowRight size={17}/></div>
    <section className="home-activity">
      <SectionTitle eyebrow="YOUR REWARD HISTORY" title="Recent activity"/>
      {activity.length ? <div className="activity-list">{activity.slice(0,4).map((item,index)=>{
        const labels={welcome_bonus:"Welcome bonus",daily_checkin:"Daily check-in",box_opened:"Mystery box opened",task_approved:"Task reward",referral_reward:"Referral reward",withdrawal_requested:"Withdrawal requested",withdrawal_refund:"Withdrawal refund",monetag_reward:"Ad reward"};
        const boxDelta=Number(item.boxes_delta||0);
        const amount=Number(item.amount_micro||0)/1000000;
        return <div className="activity-item" key={item.reference||item.created_at||index}>
          <span className={"activity-item-icon "+(item.event_type==="box_opened"?"gold":"")}><History size={15}/></span>
          <span className="activity-item-copy"><b>{labels[item.event_type]||"Account activity"}</b><small>{new Date(item.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</small></span>
          <span className="activity-item-value">{amount>0?"+"+amount.toFixed(2)+" USDT":boxDelta!==0?(boxDelta>0?"+":"")+boxDelta+" "+(Math.abs(boxDelta)===1?"box":"boxes"):"—"}</span>
        </div>;
      })}</div> : <div className="activity-empty"><History size={16}/><span>Your rewards and account activity will appear here.</span></div>}
    </section>
  </div>;
}

function TasksPage({ tasks, hiddenTaskIds = [], onSubmit, submitting, onWatchAd, watchingAd, adCooldown }) {
  const visibleTasks = tasks.filter(task => !hiddenTaskIds.includes(task.id));
  const communityItems = [
    { label: "Follow us on Facebook", detail: "Follow the BOX EARN Facebook community for updates.", Icon: Facebook, platform:"facebook" },
    { label: "Join our Telegram", detail: "Join the official BOX EARN Telegram community.", Icon: Send, platform:"telegram" },
    { label: "Follow us on YouTube", detail: "Follow the BOX EARN YouTube channel for updates.", Icon: Youtube, platform:"youtube" },
    { label: "Follow us on Instagram", detail: "Follow BOX EARN on Instagram for updates.", Icon: Instagram, platform:"instagram" }
  ].map(item => ({
    ...item,
    task: visibleTasks.find(task => String(task.id).toLowerCase().includes(item.platform) || String(task.task_type).toLowerCase() === item.platform)
  }));
  const communityTaskIds = communityItems.map(item => item.task?.id).filter(Boolean);
  const generalTasks = visibleTasks.filter(task => !communityTaskIds.includes(task.id));
  const completionButton = (task, actionLabel) => <button type="button" className="action-task-button withdraw-button task-cta" disabled={submitting===task.id} onClick={()=>onSubmit(task.id)}>{submitting===task.id?"Sending…":actionLabel}</button>;
  return <div className="page-content subpage tasks-page">
    <div className="page-intro"><span className="eyebrow">YOUR EARNING HUB</span><h1>Tasks<span className="green-dot">.</span></h1><p className="muted">Small actions. More chances to earn.</p></div>
    <SectionTitle eyebrow="QUICK WAYS TO EARN" title="More ways to earn"/>
    <div className="action-task-list">
      <article className="action-task ad-action-task">
        <span className="action-task-icon"><PlayCircle size={19}/></span>
        <div className="action-task-copy"><div className="action-task-title"><b>Watch ads</b></div><p>Watch a short ad and earn a mystery box.</p>{adCooldown>0 && <small className="ad-cooldown-label">Next ad available in {Math.floor(adCooldown/60)}:{String(adCooldown%60).padStart(2,"0")}</small>}<span className="task-box-reward"><Gift size={14}/> 1 box per ad</span></div>
        <button className="action-task-button withdraw-button task-cta" disabled={watchingAd} onClick={onWatchAd}>{watchingAd?"Loading…":adCooldown>0?"Wait":"Watch Ads"}</button>
      </article>
      {communityItems.map(({label,detail,Icon,platform,task})=>task&&<article className={"action-task community-action community-"+platform} key={task.id}>
        <span className={"action-task-icon community-icon "+platform+"-icon"}><Icon size={19}/></span>
        <div className="action-task-copy"><div className="action-task-title"><b>{label}</b></div><p>{detail}</p><span className="task-box-reward"><Gift size={14}/> {Number(task.reward_boxes)||1} {Number(task.reward_boxes)===1?"box":"boxes"}</span></div>
        {completionButton(task, platform==="telegram"?"Join":"Follow")}
      </article>)}
      {generalTasks.map(task=><article className="action-task" key={task.id}>
        <span className="action-task-icon"><Target size={19}/></span><div className="action-task-copy"><div className="action-task-title"><b>{task.title}</b></div><p>{task.description}</p><span className="task-box-reward"><Gift size={14}/> {task.reward_boxes} {Number(task.reward_boxes)===1?"box":"boxes"}</span></div>{completionButton(task)}
      </article>)}
    </div>
    <div className="notice-card"><ShieldCheck size={18}/><p>Complete a task, then tap its active button to submit it for review. Approved tasks receive their displayed box reward.</p></div>
  </div>;
}
function BoxesPage({ user, onOpen, opening, revealing, reward, onRevealComplete, rewardModalOpen, onDismissReward, soundOn, onToggleSound }) {
  const count = user?.boxes ?? 0;
  const busy = opening || revealing;
  return <div className="page-content subpage boxes-page">
    <div className="boxes-heading"><span className="eyebrow">A GIFT, JUST FOR YOU</span><h1>The Mystery Box<span className="green-dot">.</span></h1><p className="muted">A little anticipation. A lovely surprise.</p></div>
    <section className={"boxes-hero premium-box-hero" + (busy ? " is-opening" : "") + (count ? " has-boxes" : " is-empty")}>
      <div className="gift-halo" aria-hidden="true"></div>
      <div className="box-counter"><span className="counter-label">YOUR GIFTS</span><strong>{count.toString().padStart(2,"0")}</strong><span className="counter-caption">{count===1?"BOX WAITING FOR YOU":"BOXES WAITING FOR YOU"}</span></div>
      <button className="sound-toggle" type="button" onClick={onToggleSound} aria-label={soundOn?"Mute reward sound":"Enable reward sound"}><span>{soundOn?"SOUND ON":"SOUND OFF"}</span><i>{soundOn?"♪":"×"}</i></button>
      <div className="premium-box-stage">
        <BoxArtwork revealing={revealing} onRevealComplete={onRevealComplete} inactive={!count && !revealing}/>
      </div>
      <div className="box-invitation">{count>0 ? <><h2>Your present is waiting.</h2><p>Take a breath. Make a wish. See what's inside.</p></> : <><h2>Your gift shelf is resting.</h2><p>Earn more boxes and come back for your next surprise.</p></>}</div>
      <button className={"primary-button premium-open-button" + (!count?" is-disabled":"")} onClick={onOpen} disabled={busy || count===0}>{opening?"Preparing your gift…":revealing?"Unwrapping your surprise…":count>0?"Unwrap your gift":"No boxes available"}{count>0&&!busy&&<Sparkles size={16}/>}</button>
      <span className="box-footnote">{count>0?"Each box reveals a real USDT reward.":"Your next surprise is only a few tasks away."}</span>
    </section>
    {rewardModalOpen && <div className="reward-backdrop" role="dialog" aria-modal="true" aria-label="Your mystery box reward">
      <div className="reward-popup">
        <div className="reward-popup-glow"></div><span className="reward-kicker"><Sparkles size={13}/> A LITTLE SOMETHING FOR YOU</span>
        <div className="reward-gift-mark"><Gift size={30}/></div><h2>You found a reward!</h2><p>Your mystery gift contained</p>
        <strong className="reward-amount">+{reward} <small>USDT</small></strong>
        <span className="reward-added"><CheckCircle2 size={14}/> Added to your balance</span>
        <button className="primary-button" onClick={onDismissReward}>That made my day <Sparkles size={15}/></button>
      </div>
    </div>}
  </div>;
}

function InvitePage({ user, stats, referrals }) {
  const [copied,setCopied]=useState(false);
  const link=user?.referralLink || "";
  return <div className="page-content subpage invite-page">
    <div className="page-intro"><span className="eyebrow">GROW TOGETHER</span><h1>Invite & earn<span className="green-dot">.</span></h1><p className="muted">Share BOX EARN. Earn a box when a friend qualifies.</p></div>
    <div className="referral-link-card invite-link-first"><div className="invite-link-heading"><span className="eyebrow">YOUR PERSONAL INVITE LINK</span><span className="invite-link-badge"><Link2 size={12}/> READY TO SHARE</span></div><div className="link-value"><Link2 size={16}/><span>{link || "Open inside Telegram to generate your link."}</span></div><button className="primary-button" disabled={!link} onClick={async()=>{try{await navigator.clipboard.writeText(link);setCopied(true);}catch{setCopied(false);}}}>{copied?<><Check size={16}/> Copied</>:<><Copy size={16}/> Copy invite link</>}</button></div>
    <div className="invite-hero invite-compact"><div className="invite-orbit"><Users size={23}/></div><div className="invite-reward-copy"><span className="eyebrow">YOUR REFERRAL REWARD</span><h2>1 mystery box</h2><p>Earn one box when a friend joins with your link and completes 2 approved tasks.</p></div><div className="invite-steps"><span><i>1</i> Invite</span><span><i>2</i> 2 approved tasks</span><span><i>3</i> Get 1 box</span></div></div>
    <div className="task-summary"><div><small>TOTAL INVITES</small><b>{stats?.total ?? 0}</b></div><div><small>QUALIFIED</small><b>{stats?.qualified ?? 0}</b></div><div><small>BOXES EARNED</small><b>{stats?.boxesEarned ?? 0}</b></div></div>
    <SectionTitle eyebrow="YOUR NETWORK" title="Referral activity"/>{referrals.length?<div className="task-list">{referrals.map(r=><article className="task-card" key={r.telegram_id}><h3>{r.username?"@"+r.username:r.first_name}</h3><p>Joined {new Date(r.created_at).toLocaleDateString()} · {r.status}</p><span className="reward-chip">{r.status==="qualified"?"1 box rewarded":"2 approved tasks to qualify"}</span></article>)}</div>:<div className="empty-state"><Users size={22}/><b>Your network starts here</b><span>Friends who join with your link will appear here.</span></div>}
  </div>;
}

function ProfilePage({ user, onWithdraw }) {
  return <div className="page-content subpage profile-page"><div className="page-intro"><span className="eyebrow">YOUR ACCOUNT</span><h1>Profile<span className="green-dot">.</span></h1><p className="muted">Manage your wallet and account preferences.</p></div>
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
  const [hiddenTaskIds,setHiddenTaskIds]=useState([]);
  const [adStats,setAdStats]=useState(null);
  const [adCooldown,setAdCooldown]=useState(0);
  const [activity,setActivity]=useState([]);
  const [activityStats,setActivityStats]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [checkingIn,setCheckingIn]=useState(false);
  const [submitting,setSubmitting]=useState("");
  const [opening,setOpening]=useState(false);
  const [watchingAd,setWatchingAd]=useState(false);
  const [lastReward,setLastReward]=useState("");
  const [revealing,setRevealing]=useState(false);
  const [pendingReward,setPendingReward]=useState("");
  const [rewardModalOpen,setRewardModalOpen]=useState(false);
  const [soundOn,setSoundOn]=useState(true);
  const rewardAudio=useRef(null);
  const [withdrawOpen,setWithdrawOpen]=useState(false);
  const [amount,setAmount]=useState("0.10");
  const [wallet,setWallet]=useState("");
  const [withdrawing,setWithdrawing]=useState(false);
  const current=useMemo(()=>navItems.find(n=>n.id===active),[active]);

  async function refreshData() {
    const results=await Promise.all([apiRequest("/api/me"),apiRequest("/api/referrals"),apiRequest("/api/tasks"),apiRequest("/api/ads/stats"),apiRequest("/api/activity")]);
    setUser(results[0].user); setStats(results[1].stats); setReferrals(results[1].referrals||[]); setTasks(results[2].tasks||[]); setAdStats(results[3].stats); setAdCooldown(results[3].stats?.cooldownRemainingSeconds||0); setActivity(results[4].activity||[]); setActivityStats(results[4].stats||null);
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

  useEffect(()=>{
    if(adCooldown<=0)return undefined;
    const timer=window.setInterval(()=>setAdCooldown(value=>Math.max(0,value-1)),1000);
    return ()=>window.clearInterval(timer);
  },[adCooldown>0]);

  const dateParts=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:"Africa/Lagos",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()).map(p=>[p.type,p.value]));
  const today=dateParts.year+"-"+dateParts.month+"-"+dateParts.day;
  const yesterdayDate=new Date(today+"T12:00:00Z"); yesterdayDate.setUTCDate(yesterdayDate.getUTCDate()-1);
  const yesterday=yesterdayDate.toISOString().slice(0,10);
  const checkedIn=user?.lastCheckinDate===today;
  const previousCheckinDay=user?.lastCheckinDate===yesterday?(user?.checkinDay||0):0;
  const checkinDay=checkedIn?(user?.checkinDay||1):(previousCheckinDay>=7?1:previousCheckinDay+1);
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
  function playRewardChime() {
    if (!soundOn || !rewardAudio.current) return;
    const ctx=rewardAudio.current;
    const now=ctx.currentTime;
    [659.25,783.99,987.77,1318.51].forEach((frequency,index)=>{
      const oscillator=ctx.createOscillator();
      const gain=ctx.createGain();
      oscillator.type="sine"; oscillator.frequency.value=frequency;
      gain.gain.setValueAtTime(0.0001,now+index*0.105);
      gain.gain.exponentialRampToValueAtTime(0.12,now+index*0.105+0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001,now+index*0.105+0.34);
      oscillator.connect(gain); gain.connect(ctx.destination);
      oscillator.start(now+index*0.105); oscillator.stop(now+index*0.105+0.36);
    });
  }
  function finishReveal() {
    if (!pendingReward) return;
    setLastReward(pendingReward);
    setPendingReward("");
    setRevealing(false);
    setRewardModalOpen(true);
    playRewardChime();
  }
  useEffect(() => {
    if (!rewardModalOpen) return undefined;
    const colors = ["#12b875", "#e6bd68", "#f4e7c5", "#68dce4", "#a88be8", "#ffffff"];
    const timers = [];
    const burst = (origin,count,spread,velocity) => confetti({particleCount:count,spread,startVelocity:velocity,gravity:.82,ticks:260,decay:.91,scalar:1.08,origin,colors,shapes:["square","circle"],zIndex:10000});
    burst({x:.5,y:.56},170,115,58);
    timers.push(window.setTimeout(()=>burst({x:.18,y:.62},75,85,52),180));
    timers.push(window.setTimeout(()=>burst({x:.82,y:.62},75,85,52),280));
    timers.push(window.setTimeout(()=>confetti({particleCount:45,spread:360,startVelocity:34,gravity:1.05,ticks:220,scalar:1.25,origin:{x:.5,y:.42},colors,shapes:["star","circle"],zIndex:10000}),620));
    let frameId;
    const end=Date.now()+2100;
    const sideCannons=()=>{burst({x:0,y:.68},4,48,34);burst({x:1,y:.68},4,48,34);if(Date.now()<end)frameId=requestAnimationFrame(sideCannons);};
    frameId=requestAnimationFrame(sideCannons);
    return ()=>{timers.forEach(window.clearTimeout);cancelAnimationFrame(frameId);confetti.reset();};
  }, [rewardModalOpen]);
  useEffect(() => {
    if (!revealing || !pendingReward) return undefined;
    // Fallback for devices that fail to dispatch animationend (e.g. a tab resumes late).
    const fallback = window.setTimeout(finishReveal, 5000);
    return () => window.clearTimeout(fallback);
  }, [revealing, pendingReward]);
  async function openBox() {
    if(opening||revealing||!(user?.boxes>0))return;
    setOpening(true);setLastReward("");setPendingReward("");setRewardModalOpen(false);
    try { const AudioCtx=window.AudioContext||window.webkitAudioContext; if(AudioCtx){ if(!rewardAudio.current) rewardAudio.current=new AudioCtx(); if(rewardAudio.current.state==="suspended") rewardAudio.current.resume(); } } catch {}
    try {
      // The API commits the box deduction, reward and ledger entry before any reveal begins.
      const result=await apiRequest("/api/boxes/open",{method:"POST",body:"{}"});
      if (!result?.ok || !result?.rewardUsdt) throw new Error("The server did not confirm this box opening.");
      await refreshData().catch(()=>{});
      setPendingReward(result.rewardUsdt);
      setRevealing(true);
    } catch(e) {
      setNotice(e.message||"The box could not be opened. Please try again.");
    } finally { setOpening(false); }
  }
  async function watchAd() {
    if (watchingAd) return;
    if (!hasMonetagZone) { setNotice("Rewarded ads are being configured. Please try again soon."); return; }
    if (adCooldown>0) { setNotice("Your next ad is available in "+Math.floor(adCooldown/60)+":"+String(adCooldown%60).padStart(2,"0")+"."); return; }
    setWatchingAd(true); setNotice("");
    const viewsBefore=adStats?.verifiedViews||0;
    try {
      const session=await apiRequest("/api/ads/session",{method:"POST",body:"{}"});
      setAdCooldown(120);
      await playRewardedAd(session.ymid);
      let verified=false;
      for(let attempt=0;attempt<12;attempt++){
        await new Promise(resolve=>window.setTimeout(resolve,1000));
        const result=await apiRequest("/api/ads/stats");
        if((result.stats?.verifiedViews||0)>viewsBefore){verified=true;break;}
      }
      await refreshData();
      setNotice(verified?"Your mystery box has been added!":"Your ad is awaiting confirmation. Your box will appear automatically once the view is verified.");
    } catch(e) {
      if(e?.status===429 || e?.code==="ad_cooldown") {
        const seconds=e.retryAfterSeconds||120;
        setAdCooldown(seconds);
        setNotice("Please wait "+Math.ceil(seconds/60)+" minute(s) before watching another ad.");
      } else setNotice(e.message || "The ad could not be started. Please try again later.");
    } finally { setWatchingAd(false); }
  }
  async function submitTask(taskId) {
    setSubmitting(taskId);
    const result=await perform(()=>apiRequest("/api/tasks/submit",{method:"POST",body:JSON.stringify({taskId})}),"Task submitted for review.");
    if(result?.ok) setHiddenTaskIds(ids=>ids.includes(taskId)?ids:[...ids,taskId]);
    setSubmitting("");
    return result;
  }
  async function submitWithdrawal(e) {
    e.preventDefault();if(withdrawing)return;
    setWithdrawing(true);
    const result=await perform(()=>apiRequest("/api/withdrawals",{method:"POST",body:JSON.stringify({amountUsdt:amount,walletAddress:wallet})}),"Withdrawal request submitted successfully.");
    if(result){setWithdrawOpen(false);setWallet("");}
    setWithdrawing(false);
  }

  if(loading)return <div className="app-shell"><header className="topbar"><Brand/></header><div className="empty-state"><Sparkles size={22}/><b>Connecting securely…</b><span>Loading your BOX EARN account.</span></div></div>;
  if(error&&!user)return <div className="app-shell"><header className="topbar"><Brand/></header><div className="page-content subpage"><div className="empty-state"><ShieldCheck size={24}/><b>Telegram sign-in required</b><span>{error}</span><p>Open the BOX EARN Mini App from @boxearnrobot in Telegram.</p></div></div></div>;

  return <div className="app-shell">
    <header className="topbar"><Brand/></header>
    <main key={active} className="main-view">
      {active==="home"&&<HomePage user={user} stats={stats} activity={activity} onNavigate={setActive} checkedIn={checkedIn} checkinDay={checkinDay} onCheckIn={checkIn} checkingIn={checkingIn} onWithdraw={()=>setWithdrawOpen(true)}/>}
      {active==="tasks"&&<TasksPage tasks={tasks} hiddenTaskIds={hiddenTaskIds} onSubmit={submitTask} submitting={submitting} onWatchAd={watchAd} watchingAd={watchingAd} adCooldown={adCooldown}/>}
      {active==="boxes"&&<BoxesPage user={user} onOpen={openBox} opening={opening} revealing={revealing} reward={lastReward} onRevealComplete={finishReveal} rewardModalOpen={rewardModalOpen} onDismissReward={()=>setRewardModalOpen(false)} soundOn={soundOn} onToggleSound={()=>setSoundOn(v=>!v)}/>}
      {active==="invite"&&<InvitePage user={user} stats={stats} referrals={referrals}/>}
      {active==="profile"&&<ProfilePage user={user} onWithdraw={()=>setWithdrawOpen(true)}/>}
    </main>
    {notice&&<div className="toast-message" role="status">{notice}<button onClick={()=>setNotice("")} aria-label="Dismiss"><X size={14}/></button></div>}
    <nav className="bottom-nav" aria-label="Main navigation">{navItems.map(({id,label,Icon})=><button key={id} className={active===id?"active":""} onClick={()=>setActive(id)}><Icon size={20} strokeWidth={active===id?2.2:1.7}/><span>{label}</span></button>)}</nav>
    {withdrawOpen&&<div className="modal-backdrop" onClick={()=>setWithdrawOpen(false)}><form className="withdraw-modal" onSubmit={submitWithdrawal} onClick={e=>e.stopPropagation()}><button type="button" className="modal-close" onClick={()=>setWithdrawOpen(false)}>×</button><span className="modal-icon"><Wallet size={22}/></span><span className="eyebrow">USDT · BEP20</span><h2>Withdraw funds</h2><p>Your request will be checked before payment is processed.</p><div className="modal-balance"><span>AVAILABLE BALANCE</span><b>{Number(user?.balanceUsdt||0).toFixed(2)} USDT</b></div><label className="withdraw-label">Amount (USDT)<input type="number" min="0.10" step="0.000001" required value={amount} onChange={e=>setAmount(e.target.value)}/></label><label className="withdraw-label">BEP20 wallet address<input type="text" required placeholder="0x…" value={wallet} onChange={e=>setWallet(e.target.value)}/></label><button className="primary-button" type="submit" disabled={withdrawing}>{withdrawing?"Submitting…":"Submit withdrawal request"}<ArrowRight size={16}/></button></form></div>}
  </div>;
}
