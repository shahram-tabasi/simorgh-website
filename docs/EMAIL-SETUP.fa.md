# راه‌اندازی سایت و ایمیل سازمانی روی سرور لینوکس (simorghai.com)

در پایان این راهنما:

- سایت روی `https://www.simorghai.com` پشت CDN آروان‌کلاد بالا است.
- ایمیل‌های `info@`، `sales@` و … روی `mail.simorghai.com` کار می‌کنند.
- وب‌میل با `https://www.simorghai.com/mail` باز می‌شود.
- از پنل ادمین (بخش «ایمیل سازمانی») صندوق می‌سازید، رمز عوض می‌کنید و رکوردهای DNS را می‌بینید.

```
                 ┌──────────── سرور لینوکس (IP ثابت) ────────────┐
اینترنت ── آروان CDN ─► nginx :80 ─► سایت Next.js  127.0.0.1:3000 │
          (www, @)      │                                        │
                        └─► mail.simorghai.com ─► mailcow :8080  │
اینترنت ── بدون CDN ──► SMTP 25/465/587 · IMAP 993 ─► mailcow    │
                 └────────────────────────────────────────────────┘
```

---

## ⚠️ وضعیت فعلی دامنه (بررسی‌شده)

DNS فعلی `simorghai.com` نشان می‌دهد ایمیل همین حالا روی یک هاست cPanel کار می‌کند:

- `MX` به `mail.simorghai.com` اشاره می‌کند.
- `mail.simorghai.com` روی `89.39.208.235` است (سرور `cp178.freedlcenter.com`).
- رکوردهای SPF، DKIM (با selector `default`) و DMARC هم برای همان هاست ثبت شده‌اند.

اگر روی آن هاست ایمیلی دارید:

1. **هنوز رکوردهای MX، `mail` و SPF را عوض نکنید.**
2. mailcow را روی سرور جدید نصب کنید (بخش ۱ تا ۳). برای گرفتن گواهی SSL در این مرحله، موقتاً یک نام دیگر مثل `mail2.simorghai.com` بسازید و استفاده کنید.
3. صندوق‌ها را در mailcow با همان نام‌ها بسازید.
4. در mailcow ← Configuration ← Sync jobs، ایمیل‌های قدیمی را از `89.39.208.235` (IMAP 993، نام کاربری و رمز هر صندوق در cPanel) منتقل کنید.
5. وقتی انتقال کامل شد، رکوردهای بخش ۵ را جایگزین کنید. رکورد DKIM قدیمی `default._domainkey` را هم بعد از جابه‌جایی حذف کنید.

---

## ۰. پیش‌نیازها و چند واقعیت مهم

| مورد | توضیح |
|---|---|
| سرور | Ubuntu 22.04/24.04 یا Debian 12، حداقل **۶ گیگ رم** (با ۴ گیگ هم می‌شود، به شرط خاموش کردن آنتی‌ویروس ClamAV) و ۲ هسته |
| IP ثابت | دارید ✔ |
| پورت ۲۵ | **بسیار مهم.** بسیاری از دیتاسنترهای ایران پورت ۲۵ خروجی را می‌بندند. بدون آن نمی‌توانید به Gmail و دیگران ایمیل بفرستید. آزمایش در بخش ۱ |
| Reverse DNS (PTR) | باید `IP → mail.simorghai.com` باشد. **فقط دیتاسنتر یا ارائه‌دهنده IP می‌تواند آن را تنظیم کند** (نه آروان). تیکت بزنید |
| رسیدن ایمیل به Gmail | با SPF، DKIM، DMARC و PTR درست، معمولاً ایمیل‌ها به Inbox می‌رسند. IPهای ایرانی گاهی سخت‌گیری بیشتری می‌بینند؛ در بخش ۸ تست کنید |

---

## ۱. آماده‌سازی سرور

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install git curl nginx ufw dnsutils
sudo hostnamectl set-hostname mail.simorghai.com

# آیا پورت ۲۵ خروجی باز است؟ باید «Connected» ببینید
timeout 5 bash -c '</dev/tcp/gmail-smtp-in.l.google.com/25' && echo "Connected" || echo "BLOCKED → از دیتاسنتر بخواهید باز کنند"

# فایروال
sudo ufw allow 22/tcp
sudo ufw allow 80,443/tcp          # سایت و وب‌میل
sudo ufw allow 25,465,587/tcp      # SMTP
sudo ufw allow 993,995,4190/tcp    # IMAP / POP3 / Sieve
sudo ufw enable
```

### نصب Docker (با میرور آروان، چون Docker Hub برای ایران مسدود است)

```bash
curl -fsSL https://get.docker.com | sudo sh     # اگر باز نشد: sudo apt -y install docker.io docker-compose-v2
sudo mkdir -p /etc/docker
echo '{ "registry-mirrors": ["https://docker.arvancloud.ir"] }' | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker
docker compose version
```

---

## ۲. نصب سرور ایمیل (mailcow)

```bash
cd /opt
sudo git clone https://github.com/mailcow/mailcow-dockerized
cd mailcow-dockerized
sudo ./generate_config.sh          # Hostname را mail.simorghai.com بدهید؛ منطقه زمانی Asia/Tehran
```

فایل `mailcow.conf` را باز کنید (`sudo nano mailcow.conf`). این مقادیر را تنظیم کنید تا وب mailcow پشت nginx اصلی سرور بنشیند و پورت‌های ۸۰ و ۴۴۳ برای سایت آزاد بمانند:

```ini
MAILCOW_HOSTNAME=mail.simorghai.com
HTTP_PORT=8080
HTTP_BIND=127.0.0.1
HTTPS_PORT=8443
HTTPS_BIND=127.0.0.1
HTTP_REDIRECT=n
ADDITIONAL_SAN=autodiscover.simorghai.com,autoconfig.simorghai.com
# اگر رم کمتر از ۶ گیگ است:
SKIP_CLAMD=y
```

```bash
sudo docker compose pull
sudo docker compose up -d
```

اگر `pull` خطای دسترسی داد، بعضی ایمیج‌ها از `ghcr.io` می‌آیند. در این حالت از یک میرور یا پروکسی دیگر استفاده کنید و دوباره `pull` بزنید.

---

## ۳. nginx اصلی سرور (سایت + وب‌میل)

فایل آماده در پروژه است: `deploy/nginx/simorghai.conf`

```bash
sudo cp /opt/simorgh-website/deploy/nginx/simorghai.conf /etc/nginx/sites-available/simorghai.conf
sudo ln -s /etc/nginx/sites-available/simorghai.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

mailcow گواهی SSL را خودش از Let's Encrypt می‌گیرد و nginx از همان گواهی استفاده می‌کند. این کار فقط بعد از ثبت رکوردهای DNS (بخش ۵) انجام می‌شود. اگر `nginx -t` خطای «گواهی پیدا نشد» داد، یعنی mailcow هنوز گواهی نگرفته است. چند دقیقه بعد از ثبت DNS این دستور را بزنید و دوباره `nginx -t` را امتحان کنید:

```bash
sudo docker compose -f /opt/mailcow-dockerized/docker-compose.yml restart acme-mailcow
```

(تا آن موقع می‌توانید بلوک `listen 443` مربوط به mail را موقتاً کامنت کنید.)

---

## ۴. سایت روی سرور

```bash
# Node.js 20 یا 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt -y install nodejs

sudo useradd -r -m -d /opt/simorgh-website simorgh 2>/dev/null
sudo git clone -b claude/eloquent-davinci-ejg182 https://github.com/shahram-tabasi/simorgh-website /opt/simorgh-website
sudo chown -R simorgh:simorgh /opt/simorgh-website
cd /opt/simorgh-website
sudo -u simorgh cp .env.example .env.local
sudo -u simorgh nano .env.local       # رمز ادمین، IP، کلید mailcow (بخش ۶)
sudo -u simorgh npm ci
sudo -u simorgh npm run build

sudo cp deploy/systemd/simorgh-site.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now simorgh-site
```

**به‌روزرسانی‌های بعدی سایت:**

```bash
cd /opt/simorgh-website && sudo -u simorgh git pull && sudo -u simorgh npm ci && sudo -u simorgh npm run build && sudo systemctl restart simorgh-site
```

محتوای پنل ادمین در `/opt/simorgh-website/storage` است. از آن نسخه پشتیبان بگیرید.

---

## ۵. رکوردهای DNS در آروان‌کلاد

این رکوردها با مقدار دقیقشان و دکمه کپی در **پنل ادمین ← ایمیل سازمانی ← رکوردهای DNS** هم هست. همان صفحه وضعیت هر رکورد را زنده بررسی می‌کند (سبز یعنی درست ثبت شده).

| نوع | نام | مقدار | پروکسی آروان |
|---|---|---|---|
| A | `@` | IP سرور | روشن (CDN) |
| A | `www` | IP سرور | روشن (CDN) |
| A | `mail` | IP سرور | **خاموش** |
| MX | `@` | `mail.simorghai.com` (اولویت 10) | — |
| TXT | `@` | `v=spf1 mx a:mail.simorghai.com ~all` | — |
| TXT | `dkim._domainkey` | از پنل ادمین کپی کنید (بعد از بخش ۶) | — |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:postmaster@simorghai.com` | — |
| CNAME | `autodiscover` | `mail.simorghai.com` | **خاموش** |
| CNAME | `autoconfig` | `mail.simorghai.com` | **خاموش** |
| SRV | `_autodiscover._tcp` | `0 1 443 mail.simorghai.com` | — |
| PTR | (IP سرور) | `mail.simorghai.com` | از دیتاسنتر بخواهید |

در تنظیمات CDN آروان برای `www`:

- گواهی SSL رایگان آروان را فعال کنید.
- «ارتباط با سرور اصلی» را روی **HTTP** بگذارید؛ nginx روی پورت ۸۰ گوش می‌دهد.
- «ریدایرکت HTTP به HTTPS» را روشن کنید.

---

## ۶. اتصال پنل ادمین به سرور ایمیل

1. **ورود به mailcow:** `https://mail.simorghai.com/admin`، کاربر `admin` و رمز `moohoo`. **رمز را همان لحظه عوض کنید.**
2. **ساخت کلید API:** در mailcow به System ← Configuration ← Access ← API بروید و در بخش **Read-Write** این کارها را بکنید:
   - در «Allow API access from these IPs» بنویسید `127.0.0.1, 172.22.1.1`.
   - گزینه Activate API را تیک بزنید و ذخیره کنید.
   - کلید را کپی کنید.
3. **تنظیم سایت:** در `/opt/simorgh-website/.env.local` این خط‌ها را بنویسید:

```ini
MAIL_DOMAIN=simorghai.com
MAIL_HOST=mail.simorghai.com
MAIL_SERVER_IP=<IP عمومی سرور>
MAILCOW_URL=http://127.0.0.1:8080
MAILCOW_API_KEY=<کلید API>
```

4. **اجرای دوباره سایت:** `sudo systemctl restart simorgh-site`
5. **راه‌اندازی دامنه:** در پنل ادمین ← ایمیل سازمانی، دکمه **«راه‌اندازی simorghai.com»** را بزنید. دامنه و کلید DKIM ساخته می‌شوند.
6. **ثبت DKIM:** مقدار DKIM را از تب «رکوردهای DNS» کپی کنید و در آروان ثبت کنید.
7. **ساخت ایمیل‌ها:** `info`، `sales`، `support`، `noreply` و … را بسازید.

---

## ۷. اعلان فرم‌های سایت با ایمیل

هر پیام «تماس با ما» یا «درخواست دمو» علاوه بر پنل، به ایمیل هم فرستاده می‌شود:

1. در پنل یک صندوق `noreply@simorghai.com` بسازید.
2. در `.env.local` این خط‌ها را بنویسید:

```ini
SMTP_HOST=mail.simorghai.com
SMTP_PORT=587
SMTP_USER=noreply@simorghai.com
SMTP_PASS=<رمز noreply>
```

3. در پنل ← تنظیمات و سئو ← «ایمیل دریافت اعلان فرم‌ها» را مشخص کنید (پیش‌فرض `sales@simorghai.com`).

---

## ۸. آزمایش

1. **ارسال:** از وب‌میل (`/mail`) به یک Gmail ایمیل بفرستید. در Gmail از منوی «Show original» باید `SPF: PASS`، `DKIM: PASS` و `DMARC: PASS` را ببینید.
2. **امتیاز کلی:** به https://www.mail-tester.com بروید و به آدرسی که می‌دهد ایمیل بفرستید. امتیاز ۹ به بالا یعنی همه‌چیز درست است.
3. **دریافت:** از Gmail به `info@simorghai.com` ایمیل بزنید.

## ۹. خواندن ایمیل‌ها

| کجا | چطور |
|---|---|
| **وب‌میل** | `https://www.simorghai.com/mail` (یا مستقیم `https://mail.simorghai.com/SOGo`) |
| **موبایل، Outlook و Thunderbird** | IMAP `mail.simorghai.com:993` (SSL) و SMTP `mail.simorghai.com:465` (SSL). نام کاربری آدرس کامل ایمیل است |
| **مدیریت** | پنل ادمین سایت ← ایمیل سازمانی. برای تنظیمات پیشرفته (اسپم، محدودیت‌ها) از `https://mail.simorghai.com/admin` استفاده کنید |

**پشتیبان‌گیری ایمیل‌ها:** `/opt/mailcow-dockerized/helper-scripts/backup_and_restore.sh backup all`
