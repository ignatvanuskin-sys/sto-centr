/**
 * Проверка API онлайн-записи «СТО Центр».
 * Запуск: node scripts/qa-bookings-api.mjs [baseUrl] [adminPassword]
 *
 * Все созданные записи помечаются demo:true — их можно удалить одной кнопкой
 * в панели заявок, реальные обращения не затрагиваются.
 */

const BASE = process.argv[2] ?? "http://localhost:3210";
const PASSWORD = process.argv[3] ?? "sto-centr";

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "OK  " : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body, cookies: res.headers.getSetCookie?.() ?? [] };
}

/* График сервиса: Пн–Пт 09:00–19:00, Сб 09:00–18:00, Вс закрыто.
   Находим ближайшую рабочую дату и заведомо выходную. */
function isoOffset(days) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function weekdayOf(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return (new Date(y, m - 1, d).getDay() + 6) % 7; // 0 = Пн … 6 = Вс
}
let workday = null;
let sunday = null;
for (let i = 1; i <= 14 && (!workday || !sunday); i += 1) {
  const iso = isoOffset(i);
  const wd = weekdayOf(iso);
  if (!workday && wd < 6) workday = iso;
  if (!sunday && wd === 6) sunday = iso;
}

const base = {
  name: "QA Проверка",
  phone: "+7 700 111 22 33",
  channel: "Телефон",
  vehicleModel: "Kia Rio",
  vehicleYear: "2016",
  service: "Компьютерная диагностика",
  date: workday,
  time: "10:00",
  comment: "Проверка API",
  demo: true,
};

/* 1. Валидная заявка */
const created = await api("/api/bookings", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(base),
});
check(
  "валидная заявка создаётся",
  created.status === 201 && created.body?.ok === true,
  `HTTP ${created.status}, код ${created.body?.booking?.code ?? "—"}`,
);
const code = created.body?.booking?.code;

check(
  "цена подставлена из прайса 2ГИС",
  created.body?.booking?.price === 2500,
  `price=${created.body?.booking?.price}`,
);

/* 2. Валидация */
const bad = await api("/api/bookings", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...base, phone: "123", service: "Что-то не из прайса", vehicleYear: "1800" }),
});
check(
  "некорректные поля отклоняются",
  bad.status === 400 && Boolean(bad.body?.fields?.phone && bad.body?.fields?.service && bad.body?.fields?.vehicleYear),
  `HTTP ${bad.status}, поля: ${Object.keys(bad.body?.fields ?? {}).join(", ")}`,
);

const sundayTry = await api("/api/bookings", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...base, date: sunday }),
});
check(
  "воскресенье недоступно для записи",
  sundayTry.status === 400 && Boolean(sundayTry.body?.fields?.date),
  `дата ${sunday}, HTTP ${sundayTry.status}`,
);

const pastTime = await api("/api/bookings", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...base, time: "23:00" }),
});
check(
  "время вне графика отклоняется",
  pastTime.status === 400 && Boolean(pastTime.body?.fields?.time),
  `23:00, HTTP ${pastTime.status}`,
);

const telegramMissing = await api("/api/bookings", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...base, channel: "Telegram", telegram: "" }),
});
check(
  "для Telegram требуется ник",
  telegramMissing.status === 400 && Boolean(telegramMissing.body?.fields?.telegram),
  `HTTP ${telegramMissing.status}`,
);

const badVin = await api("/api/bookings", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...base, vin: "123" }),
});
check(
  "короткий VIN отклоняется",
  badVin.status === 400 && Boolean(badVin.body?.fields?.vin),
  `HTTP ${badVin.status}`,
);

/* 3. Ловушка для ботов */
const bot = await api("/api/bookings", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...base, hp_nickname: "bot-signature", demo: false }),
});
check(
  "ловушка для ботов отвечает 200 и не создаёт заявку",
  bot.status === 200 && bot.body?.booking === null && bot.body?.silent === true,
  `HTTP ${bot.status}, silent=${bot.body?.silent}`,
);

/* 4. Доступ к списку */
const anon = await api("/api/bookings");
check("список без входа запрещён", anon.status === 401, `HTTP ${anon.status}`);

const badLogin = await api("/api/admin/session", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password: "неверный" }),
});
check("неверный пароль отклоняется", badLogin.status === 401, `HTTP ${badLogin.status}`);

const login = await api("/api/admin/session", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password: PASSWORD }),
});
const cookie = (login.cookies?.[0] ?? "").split(";")[0];
check("вход с верным паролем выдаёт cookie", login.status === 200 && cookie.length > 0, cookie.split("=")[0]);

const list = await api("/api/bookings", { headers: { Cookie: cookie } });
check(
  "список доступен после входа",
  list.status === 200 && Array.isArray(list.body?.bookings),
  `HTTP ${list.status}, записей: ${list.body?.bookings?.length ?? 0}, хранилище: ${list.body?.storage}`,
);

const mine = list.body?.bookings?.find((b) => b.code === code);
check("созданная заявка видна в панели", Boolean(mine), `код ${code}`);

if (mine) {
  const patched = await api(`/api/bookings/${mine.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ status: "CONFIRMED" }),
  });
  check("статус меняется", patched.status === 200 && patched.body?.booking?.status === "CONFIRMED", `HTTP ${patched.status}`);

  const removed = await api(`/api/bookings/${mine.id}`, { method: "DELETE", headers: { Cookie: cookie } });
  check("заявка удаляется", removed.status === 200, `HTTP ${removed.status}`);
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} проверок пройдено`);
if (failed.length) {
  console.log("Провалено:");
  for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
  process.exit(1);
}
