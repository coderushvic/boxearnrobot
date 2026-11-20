const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const MICRO = 1_000_000;
const MAX_INIT_AGE_SECONDS = 86_400;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...headers } });
}
function fail(message, status = 400, code = "bad_request") {
  return json({ ok: false, error: { code, message } }, status);
}
function randomHex(bytes = 12) {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return [...data].map((v) => v.toString(16).padStart(2, "0")).join("");
}
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
async function hmac(keyBytes, message) {
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message)));
}
function hex(bytes) {
  return [...bytes].map((v) => v.toString(16).padStart(2, "0")).join("");
}
async function validateTelegramInitData(raw, botToken) {
  if (!raw || !botToken) throw new Error("Telegram authentication is not configured.");
  const params = new URLSearchParams(raw);
  const hash = params.get("hash");
  const authDate = Number(params.get("auth_date"));
  if (!hash || !Number.isFinite(authDate)) throw new Error("Invalid Telegram launch data.");
  const now = Math.floor(Date.now() / 1000);
  if (authDate > now + 60 || now - authDate > MAX_INIT_AGE_SECONDS) throw new Error("Telegram launch data has expired. Reopen the app.");
  const dataCheck = [...params.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = await hmac(new TextEncoder().encode("WebAppData"), botToken);
  const expected = hex(await hmac(secretKey, dataCheck));
  if (!safeEqual(expected, hash.toLowerCase())) throw new Error("Telegram launch verification failed.");
  const userRaw = params.get("user");
  if (!userRaw) throw new Error("Telegram user information is missing.");
  const user = JSON.parse(userRaw);
  if (!user?.id) throw new Error("Telegram user ID is missing.");
  return { user, startParam: params.get("start_param") || "" };
}
function lagosDate() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
function yesterday(date) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
async function authenticate(request, env) {
  const header = request.headers.get("authorization") || "";
  const raw = header.startsWith("tma ") ? header.slice(4) : "";
  if (!raw) throw Object.assign(new Error("Open BOX EARN inside Telegram to continue."), { status: 401, code: "telegram_auth_required" });
  try {
    const verified = await validateTelegramInitData(raw, env.TELEGRAM_BOT_TOKEN);
    return verified;
  } catch (error) {
    throw Object.assign(error, { status: env.TELEGRAM_BOT_TOKEN ? 401 : 503, code: env.TELEGRAM_BOT_TOKEN ? "telegram_auth_failed" : "telegram_not_configured" });
  }
}
async function getUser(db, telegramId) {
  return db.prepare("SELECT telegram_id, username, first_name, last_name, photo_url, referral_code, balance_micro, boxes, checkin_cycle, last_checkin_date, created_at FROM users WHERE telegram_id = ?").bind(String(telegramId)).first();
}
function presentUser(user) {
  if (!user) return null;
  return {
    id: user.telegram_id, username: user.username, firstName: user.first_name, lastName: user.last_name,
    photoUrl: user.photo_url, referralCode: user.referral_code,
    referralLink: `https://t.me/boxearnrobot?start=ref_${user.referral_code}`,
    balanceUsdt: (user.balance_micro / MICRO).toFixed(6), balanceMicro: user.balance_micro,
    boxes: user.boxes, checkinCycle: user.checkin_cycle, lastCheckinDate: user.last_checkin_date
  };
}
async function authUser(request, env) {
  const verified = await authenticate(request, env);
  const user = await getUser(env.DB, verified.user.id);
  if (!user) throw Object.assign(new Error("Account not found. Please reopen the Mini App."), { status: 401, code: "account_not_found" });
  return { ...verified, account: user };
}
async function readJson(request) {
  try { return await request.json(); } catch { throw Object.assign(new Error("Request body must be valid JSON."), { status: 400 }); }
}
async function api(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (path === "/api/health" && request.method === "GET") {
    return json({ ok: true, service: "boxearnrobot", databaseConfigured: Boolean(env.DB), telegramConfigured: Boolean(env.TELEGRAM_BOT_TOKEN), version: "2" });
  }
  if (path === "/api/auth" && request.method === "POST") {
    if (!env.DB) return fail("Database is not configured.", 503, "database_not_configured");
    const body = await readJson(request);
    let verified;
    try { verified = await validateTelegramInitData(body.initData, env.TELEGRAM_BOT_TOKEN); }
    catch (error) { return fail(error.message, env.TELEGRAM_BOT_TOKEN ? 401 : 503, env.TELEGRAM_BOT_TOKEN ? "telegram_auth_failed" : "telegram_not_configured"); }
    const t = verified.user;
    const id = String(t.id);
    const referral = verified.startParam.startsWith("ref_") ? verified.startParam.slice(4) : "";
    const code = randomHex(8);
    const authInsertResults = await env.DB.batch([
      env.DB.prepare(`INSERT OR IGNORE INTO users (telegram_id, username, first_name, last_name, photo_url, referral_code, referred_by, boxes)
        VALUES (?, ?, ?, ?, ?, ?, (SELECT telegram_id FROM users WHERE referral_code = ? AND telegram_id <> ?), 2)`)
        .bind(id, t.username || null, t.first_name || "Telegram user", t.last_name || null, t.photo_url || null, code, referral || "__none__", id),
      env.DB.prepare(`INSERT OR IGNORE INTO ledger (id, telegram_id, event_type, boxes_delta, reference, metadata)
        SELECT ?, ?, 'welcome_bonus', 2, ?, '{"reason":"new_account"}' WHERE changes() = 1`)
        .bind(crypto.randomUUID(), id, `welcome:${id}`)
    ]);
    await env.DB.prepare(`INSERT OR IGNORE INTO referrals (invitee_id, inviter_id)
      SELECT telegram_id, referred_by FROM users WHERE telegram_id = ? AND referred_by IS NOT NULL`).bind(id).run();
    await env.DB.prepare("UPDATE users SET username = ?, first_name = ?, last_name = ?, photo_url = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE telegram_id = ?")
      .bind(t.username || null, t.first_name || "Telegram user", t.last_name || null, t.photo_url || null, id).run();
    const user = await getUser(env.DB, id);
    return json({ ok: true, user: presentUser(user), isNewUser: Boolean(authInsertResults[0]?.meta?.changes) });
  }
  if (!path.startsWith("/api/")) return null;
  if (!env.DB) return fail("Database is not configured.", 503, "database_not_configured");
  if (path === "/api/webhooks/monetag") return fail("Monetag postback verification is not configured yet; no ad rewards have been credited.", 503, "monetag_not_configured");

  const { account, user } = await authUser(request, env);
  const uid = String(user.id);

  if (path === "/api/me" && request.method === "GET") {
    const fresh = await getUser(env.DB, uid);
    return json({ ok: true, user: presentUser(fresh) });
  }
  if (path === "/api/tasks" && request.method === "GET") {
    const result = await env.DB.prepare("SELECT id, title, description, reward_boxes, task_type FROM tasks WHERE active = 1 ORDER BY created_at").all();
    return json({ ok: true, tasks: result.results || [] });
  }
  if (path === "/api/tasks/submit" && request.method === "POST") {
    const body = await readJson(request);
    if (!body.taskId || typeof body.taskId !== "string") return fail("A valid task ID is required.");
    const task = await env.DB.prepare("SELECT id FROM tasks WHERE id = ? AND active = 1").bind(body.taskId).first();
    if (!task) return fail("This task is not currently available.", 404, "task_not_found");
    const submissionId = crypto.randomUUID();
    try {
      await env.DB.prepare("INSERT INTO task_submissions (id, telegram_id, task_id, proof) VALUES (?, ?, ?, ?)")
        .bind(submissionId, uid, body.taskId, typeof body.proof === "string" ? body.proof.slice(0, 1000) : null).run();
    } catch {
      return fail("You have already submitted this task.", 409, "task_already_submitted");
    }
    return json({ ok: true, submissionId, status: "pending" }, 201);
  }
  if (path === "/api/checkin" && request.method === "POST") {
    const today = lagosDate();
    const current = await getUser(env.DB, uid);
    if (current.last_checkin_date === today) return fail("You have already checked in today.", 409, "already_checked_in");
    const nextCycle = current.last_checkin_date === yesterday(today) ? (current.checkin_cycle + 1) % 3 : 0;
    const reward = nextCycle + 1;
    const results = await env.DB.batch([
      env.DB.prepare("UPDATE users SET boxes = boxes + ?, checkin_cycle = ?, last_checkin_date = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE telegram_id = ? AND (last_checkin_date IS NULL OR last_checkin_date <> ?)")
        .bind(reward, nextCycle, today, uid, today),
      env.DB.prepare("INSERT INTO ledger (id, telegram_id, event_type, boxes_delta, reference, metadata) SELECT ?, ?, 'daily_checkin', ?, ?, ? WHERE changes() = 1")
        .bind(crypto.randomUUID(), uid, reward, `checkin:${uid}:${today}`, JSON.stringify({ day: reward, date: today }))
    ]);
    if (!results[0]?.meta?.changes) return fail("You have already checked in today.", 409, "already_checked_in");
    return json({ ok: true, boxesAwarded: reward, user: presentUser(await getUser(env.DB, uid)) });
  }
  if (path === "/api/boxes/open" && request.method === "POST") {
    const reward = 50_000 + crypto.getRandomValues(new Uint32Array(1))[0] % 40_001;
    const results = await env.DB.batch([
      env.DB.prepare("UPDATE users SET boxes = boxes - 1, balance_micro = balance_micro + ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE telegram_id = ? AND boxes > 0")
        .bind(reward, uid),
      env.DB.prepare("INSERT INTO ledger (id, telegram_id, event_type, amount_micro, boxes_delta, reference, metadata) SELECT ?, ?, 'box_opened', ?, -1, ?, ? WHERE changes() = 1")
        .bind(crypto.randomUUID(), uid, reward, crypto.randomUUID(), JSON.stringify({ rewardMicro: reward }))
    ]);
    if (!results[0]?.meta?.changes) return fail("You do not have any mystery boxes available.", 409, "no_boxes");
    return json({ ok: true, rewardUsdt: (reward / MICRO).toFixed(5), rewardMicro: reward, user: presentUser(await getUser(env.DB, uid)) });
  }
  if (path === "/api/referrals" && request.method === "GET") {
    const rows = await env.DB.prepare("SELECT u.telegram_id, u.username, u.first_name, r.status, r.created_at FROM referrals r JOIN users u ON u.telegram_id = r.invitee_id WHERE r.inviter_id = ? ORDER BY r.created_at DESC LIMIT 100").bind(uid).all();
    const stats = await env.DB.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN status='qualified' THEN 1 ELSE 0 END) AS qualified FROM referrals WHERE inviter_id = ?").bind(uid).first();
    return json({ ok: true, referrals: rows.results || [], stats: { total: stats?.total || 0, qualified: stats?.qualified || 0, boxesEarned: stats?.qualified || 0 } });
  }
  if (path === "/api/activity" && request.method === "GET") {
    const rows = await env.DB.prepare("SELECT event_type, amount_micro, boxes_delta, metadata, created_at FROM ledger WHERE telegram_id = ? ORDER BY created_at DESC LIMIT 50").bind(uid).all();
    return json({ ok: true, activity: rows.results || [] });
  }
  if (path === "/api/withdrawals" && request.method === "POST") {
    const body = await readJson(request);
    const amount = Number(body.amountUsdt);
    if (!Number.isFinite(amount) || !Number.isInteger(Math.round(amount * MICRO)) || amount < 0.1 || amount > 1000000) return fail("Minimum withdrawal is 0.10 USDT. Enter a valid amount.");
    const amountMicro = Math.round(amount * MICRO);
    const address = String(body.walletAddress || "").trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return fail("Enter a valid BEP20 wallet address.");
    const withdrawalId = crypto.randomUUID();
    const results = await env.DB.batch([
      env.DB.prepare("UPDATE users SET balance_micro = balance_micro - ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE telegram_id = ? AND balance_micro >= ?")
        .bind(amountMicro, uid, amountMicro),
      env.DB.prepare("INSERT INTO withdrawals (id, telegram_id, amount_micro, wallet_address) SELECT ?, ?, ?, ? WHERE changes() = 1")
        .bind(withdrawalId, uid, amountMicro, address),
      env.DB.prepare("INSERT INTO ledger (id, telegram_id, event_type, amount_micro, reference, metadata) SELECT ?, ?, 'withdrawal_requested', ?, ?, ? WHERE changes() = 1")
        .bind(crypto.randomUUID(), uid, -amountMicro, `withdrawal:${withdrawalId}`, JSON.stringify({ withdrawalId, network: "BEP20" }))
    ]);
    if (!results[0]?.meta?.changes) return fail("Your available balance is too low for this withdrawal.", 409, "insufficient_balance");
    return json({ ok: true, withdrawalId, status: "pending", user: presentUser(await getUser(env.DB, uid)) }, 201);
  }
  return fail("API route not found.", 404, "not_found");
}
async function adminApi(request, env, path) {
  if (!env.ADMIN_SECRET) return fail("Admin actions are not configured.", 503, "admin_not_configured");
  const provided = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!safeEqual(provided, env.ADMIN_SECRET)) return fail("Not authorized.", 401, "admin_unauthorized");
  if (path === "/api/admin/submissions" && request.method === "GET") {
    const rows = await env.DB.prepare("SELECT s.id, s.telegram_id, s.task_id, s.proof, s.created_at, t.title, t.reward_boxes FROM task_submissions s JOIN tasks t ON t.id=s.task_id WHERE s.status='pending' ORDER BY s.created_at LIMIT 100").all();
    return json({ ok: true, submissions: rows.results || [] });
  }
  if (path === "/api/admin/withdrawals" && request.method === "GET") {
    const rows = await env.DB.prepare("SELECT id, telegram_id, amount_micro, wallet_address, network, created_at FROM withdrawals WHERE status='pending' ORDER BY created_at LIMIT 100").all();
    return json({ ok: true, withdrawals: rows.results || [] });
  }
  if (path === "/api/admin/tasks/approve" && request.method === "POST") {
    const body = await readJson(request);
    const submission = await env.DB.prepare("SELECT s.id,s.telegram_id,s.task_id,t.reward_boxes FROM task_submissions s JOIN tasks t ON t.id=s.task_id WHERE s.id=? AND s.status='pending'").bind(body.submissionId || "").first();
    if (!submission) return fail("Pending submission not found.", 404, "submission_not_found");
    const results = await env.DB.batch([
      env.DB.prepare("UPDATE task_submissions SET status='approved', reviewed_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=? AND status='pending'").bind(submission.id),
      env.DB.prepare("UPDATE users SET boxes=boxes+? WHERE telegram_id=? AND changes()=1").bind(submission.reward_boxes, submission.telegram_id),
      env.DB.prepare("INSERT INTO ledger (id,telegram_id,event_type,boxes_delta,reference,metadata) SELECT ?,?,'task_approved',?,?,? WHERE changes()=1")
        .bind(crypto.randomUUID(), submission.telegram_id, submission.reward_boxes, `task:${submission.id}`, JSON.stringify({ taskId: submission.task_id }))
    ]);
    if (!results[0]?.meta?.changes) return fail("This submission was already reviewed.", 409, "already_reviewed");
    const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM task_submissions WHERE telegram_id=? AND status='approved'").bind(submission.telegram_id).first();
    if ((count?.total || 0) >= 2) {
      await env.DB.batch([
        env.DB.prepare("UPDATE referrals SET status='qualified', rewarded_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE invitee_id=? AND status='pending'").bind(submission.telegram_id),
        env.DB.prepare("UPDATE users SET boxes=boxes+1 WHERE telegram_id=(SELECT inviter_id FROM referrals WHERE invitee_id=?) AND changes()=1").bind(submission.telegram_id),
        env.DB.prepare("INSERT INTO ledger (id,telegram_id,event_type,boxes_delta,reference,metadata) SELECT ?, inviter_id, 'referral_reward', 1, ?, ? FROM referrals WHERE invitee_id=? AND status='qualified' AND rewarded_at IS NOT NULL AND changes()=1")
          .bind(crypto.randomUUID(), `referral:${submission.telegram_id}`, JSON.stringify({ inviteeId: submission.telegram_id }), submission.telegram_id)
      ]);
    }
    return json({ ok: true, approved: true, boxesAwarded: submission.reward_boxes });
  }
  if (path === "/api/admin/withdrawals/decision" && request.method === "POST") {
    const body = await readJson(request);
    if (!["approved", "rejected"].includes(body.decision)) return fail("Decision must be approved or rejected.");
    const withdrawal = await env.DB.prepare("SELECT id,telegram_id,amount_micro FROM withdrawals WHERE id=? AND status='pending'").bind(body.withdrawalId || "").first();
    if (!withdrawal) return fail("Pending withdrawal not found.", 404, "withdrawal_not_found");
    const statements = [env.DB.prepare("UPDATE withdrawals SET status=?, reviewed_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=? AND status='pending'").bind(body.decision, withdrawal.id)];
    if (body.decision === "rejected") {
      statements.push(env.DB.prepare("UPDATE users SET balance_micro=balance_micro+? WHERE telegram_id=? AND changes()=1").bind(withdrawal.amount_micro, withdrawal.telegram_id));
      statements.push(env.DB.prepare("INSERT INTO ledger (id,telegram_id,event_type,amount_micro,reference,metadata) SELECT ?,?,'withdrawal_refund',?,?,? WHERE changes()=1")
        .bind(crypto.randomUUID(), withdrawal.telegram_id, withdrawal.amount_micro, `withdrawal-refund:${withdrawal.id}`, JSON.stringify({ withdrawalId: withdrawal.id })));
    }
    const results = await env.DB.batch(statements);
    if (!results[0]?.meta?.changes) return fail("This withdrawal was already reviewed.", 409, "already_reviewed");
    return json({ ok: true, status: body.decision });
  }
  return fail("Admin route not found.", 404, "not_found");
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/admin/")) {
      if (!env.DB) return fail("Database is not configured.", 503, "database_not_configured");
      try { return await adminApi(request, env, url.pathname); }
      catch (error) { return fail(error.message || "Admin request failed.", error.status || 500, error.code || "admin_error"); }
    }
    if (url.pathname.startsWith("/api/")) {
      try {
        const response = await api(request, env);
        if (response) return response;
      } catch (error) {
        return fail(error.message || "Request failed.", error.status || 500, error.code || "server_error");
      }
    }
    return env.ASSETS.fetch(request);
  }
};
