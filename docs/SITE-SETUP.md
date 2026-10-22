# Site requirements: search engines, analytics and email

What the public site needs outside its own code, and where each piece lives.
Two DNS servers answer for `simorghai.com`:

| Who asks | Who answers | Change it with |
|---|---|---|
| the internet (Google, mail servers, visitors) | **ArvanCloud** | the Arvan panel |
| the office and the cluster | **PowerDNS** on .68 | `pdnsutil` on .68 |

A record that the world must see (Search Console, SPF, DKIM, DMARC) goes into
**ArvanCloud**. Put the same record in PowerDNS as well, so the office and the
admin panel's checks (which ask PowerDNS) see what the internet sees.

## 1. Google Search Console (Domain property)

One Domain property covers `simorghai.com`, `www.`, http and https.

1. <https://search.google.com/search-console> → *Add property* → **Domain** →
   `simorghai.com`. Google shows a TXT value `google-site-verification=…`.
2. ArvanCloud → DNS → add **TXT**, name `@`, that value (DNS-only).
3. The same in PowerDNS, on .68 (`add-record` keeps the TXT records already at `@`, such as SPF):

   ```bash
   V='google-site-verification=PASTE-HERE'
   pdnsutil list-zone simorghai.com > /root/simorghai.com.zone.$(date +%F).bak
   pdnsutil add-record simorghai.com @ TXT 3600 "\"$V\""
   pdnsutil increase-serial simorghai.com
   dig +short TXT simorghai.com @127.0.0.1
   ```

4. Back in Search Console → *Verify* (Arvan's answer can take a few minutes).
5. *Sitemaps* → `<site address>/sitemap.xml`, with the address from the admin
   panel's *Settings* (the one every canonical link uses, with or without
   `www.`). The RSS feed of the articles is `<site address>/insights/feed.xml`.

The admin dashboard checks for the TXT record itself; the meta-tag field in
*Settings* is then not needed.

**Bing:** <https://www.bing.com/webmasters> → *Import from Google Search
Console*. No second verification.

## 2. Analytics

Create a GA4 property (<https://analytics.google.com> → Admin → *Create
property* → Web stream for `https://simorghai.com`) and put its measurement id
(`G-…`) in the admin panel: *Settings* → Google Analytics. Then link GA4 to
Search Console (GA4 Admin → *Product links*), so search queries appear next
to visits.

## 3. Email from the site (mailcow)

The site sends notifications for the contact and demo forms, new comments
and replies to readers, as `noreply@simorghai.com`, through mailcow on .68
(submission port 587, allowed in `deploy/k8s/50-policies.yaml`).

1. mailcow (<https://mail.simorghai.com>) → *Email → Mailboxes → Add*:
   `noreply@simorghai.com`, a long random password, quota 100 MB.
2. Put that password straight into the site's Secret, on the k8s master:

   ```bash
   read -rsp "noreply@ password: " P; echo
   [ -n "$P" ] && kubectl -n simorgh-website patch secret simorgh-website-secrets --type merge \
     -p "$(jq -nc --arg p "$P" '{stringData:{SMTP_PASS:$p}}')" && echo "stored"
   unset P
   kubectl -n simorgh-website rollout restart deploy/simorgh-website
   ```

3. Admin panel → *Settings* → notification email: where team notices go
   (for example `info@simorghai.com`). Send the contact form once to test;
   the pod log shows `[requests] notification email failed` if it did not go.

SPF, DKIM and DMARC for the domain are mailcow's (already set in ArvanCloud
and PowerDNS); the admin panel's *Email → DNS* page checks them, and the
Search Console TXT, against what DNS answers.

## 4. Comments

Comments are on by default; a reader's first comment waits for approval in
*Comments* (admin panel), later ones appear at once, and anything with more
than one link waits. They live in `/data/comments.json` on the site's volume
and are backed up with it.
