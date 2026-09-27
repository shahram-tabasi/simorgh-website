# Running simorghai.com on the Kubernetes cluster

```
Internet ─► ArvanCloud ─► nginx on 192.168.1.68 ──https──┐
                                                          ▼
LAN PC ──(PowerDNS: simorghai.com = 192.168.1.220)──► 192.168.1.220   Istio Gateway "website"  (worker3)
                                                          │  mTLS (ambient)
                                                          ▼
                                                    simorgh-website pod  (worker3)
                                                          │
                                                          ▼
                                            /data = Ceph RBD volume (content, uploads, backups, requests)
```

| File | What it creates |
|---|---|
| `00-namespace.yaml` | namespace `simorgh-website`, in the ambient mesh |
| `10-config.yaml` | non-secret settings (site URL, mail host, …) |
| `20-storage.yaml` | the 10 Gi data volume — applied once, on its own |
| `30-website.yaml` | the Deployment (1 replica, pinned to worker3), its Service and ServiceAccount |
| `40-gateway.yaml` | IP 192.168.1.220 (LB-IPAM pool + L2 announcement from worker3), the Gateway, http→https and www→apex redirects, the route |
| `50-policies.yaml` | NetworkPolicies (default deny + exactly what is needed), mTLS STRICT, only-the-gateway-may-call-the-website |
| `../nginx/simorghai-k8s.conf` | the server block for nginx on .68 |

Commands run on **master1** unless the heading says otherwise.

## 0. Checks

```bash
ping -c2 -W1 192.168.1.220                       # must NOT answer
kubectl get svc -A | grep 192.168.1.220          # must print nothing
kubectl get ciliumloadbalancerippools -o custom-columns=NAME:.metadata.name,BLOCKS:.spec.blocks
                                                 # no existing pool may include .220
kubectl get storageclass ceph-rbd-simorgh        # the volume's class
```

## 1. Build and push the image (build host)

```bash
git clone -b claude/serene-cannon-h4ff93 https://github.com/shahram-tabasi/simorgh-website
cd simorgh-website
VERSION=1.0.0
buildah bud -t registry.simorghai.com/simorgh/simorgh-website:$VERSION .
buildah push registry.simorghai.com/simorgh/simorgh-website:$VERSION
```

`npm ci` inside the build needs the npm registry, like the design-suite builds.

## 2. Namespace and secrets

```bash
kubectl apply -f deploy/k8s/00-namespace.yaml

# Harbor pull secret, copied from the simorgh namespace
kubectl -n simorgh get secret harbor-registry -o yaml \
  | sed -e 's/namespace: simorgh$/namespace: simorgh-website/' \
        -e '/^\s*\(uid\|resourceVersion\|creationTimestamp\):/d' \
  | kubectl apply -f -

# The Let's Encrypt wildcard (simorghai.com + *.simorghai.com), straight from .68
scp simorghai:/etc/letsencrypt/live/simorghai.com/fullchain.pem /tmp/wc.crt
scp simorghai:/etc/letsencrypt/live/simorghai.com/privkey.pem   /tmp/wc.key
kubectl -n simorgh-website create secret tls wildcard-simorghai-tls \
  --cert=/tmp/wc.crt --key=/tmp/wc.key --dry-run=client -o yaml | kubectl apply -f -
rm -f /tmp/wc.crt /tmp/wc.key

# The website's own secrets. ADMIN_PASSWORD: 8+ characters, your choice.
kubectl -n simorgh-website create secret generic simorgh-website-secrets \
  --from-literal=ADMIN_PASSWORD='CHANGE-ME-strong-password' \
  --from-literal=ADMIN_SECRET="$(openssl rand -hex 32)" \
  --from-literal=SMTP_PASS='' \
  --from-literal=OPENAI_API_KEY='' \
  --from-literal=MAILCOW_API_KEY=''
```

To change one later: `kubectl -n simorgh-website edit secret simorgh-website-secrets`
(values are base64), then `kubectl -n simorgh-website rollout restart deploy/simorgh-website`.

## 3. Data volume, then everything else

```bash
kubectl apply -f deploy/k8s/20-storage.yaml
kubectl apply -k deploy/k8s
```

## 4. Check it

```bash
kubectl -n simorgh-website get pods -o wide                 # website + website-istio, both on worker3, Running
kubectl -n simorgh-website get gateway website              # PROGRAMMED True, ADDRESS 192.168.1.220
kubectl -n simorgh-website get svc website-istio            # EXTERNAL-IP 192.168.1.220
curl -sI --resolve simorghai.com:443:192.168.1.220 https://simorghai.com/            # 200
curl -sI --resolve www.simorghai.com:443:192.168.1.220 https://www.simorghai.com/    # 301 -> https://simorghai.com/
curl -sI http://192.168.1.220/ -H 'Host: simorghai.com'                               # 301 -> https
```

## 5. Bring the old content across (only if the site ran somewhere before)

The old server keeps everything in `/opt/simorgh-website/storage/` (content.json,
uploads/, backups/, requests.json). The website image has no `tar`, so the copy
goes through a helper pod while the website is stopped:

```bash
kubectl -n simorgh-website scale deploy/simorgh-website --replicas=0
kubectl -n simorgh-website run storage-copy --restart=Never \
  --image=registry.simorghai.com/docker-proxy/library/busybox:1.36 \
  --overrides='{"spec":{"nodeName":"worker3","imagePullSecrets":[{"name":"harbor-registry"}],
    "containers":[{"name":"c","image":"registry.simorghai.com/docker-proxy/library/busybox:1.36",
      "command":["sleep","3600"],"volumeMounts":[{"name":"d","mountPath":"/data"}]}],
    "volumes":[{"name":"d","persistentVolumeClaim":{"claimName":"simorgh-website-data"}}]}}'
kubectl -n simorgh-website wait --for=condition=Ready pod/storage-copy

# from wherever the old storage folder is:
tar -C /opt/simorgh-website/storage -cf - . | kubectl -n simorgh-website exec -i storage-copy -- tar -C /data -xf -
kubectl -n simorgh-website exec storage-copy -- chown -R 65532:65532 /data

kubectl -n simorgh-website delete pod storage-copy
kubectl -n simorgh-website scale deploy/simorgh-website --replicas=1
```

Then in **/admin → Settings**, make sure *Site URL* is `https://simorghai.com`
(the old content may still say `https://www.simorghai.com`).

## 6. PowerDNS on .68 (LAN name resolution)

```bash
pdnsutil replace-rrset simorghai.com @   A     300 192.168.1.220
pdnsutil replace-rrset simorghai.com www CNAME 300 simorghai.com.
pdnsutil increase-serial simorghai.com
rec_control wipe-cache 'simorghai.com$'
dig +short @192.168.1.68 simorghai.com www.simorghai.com
```

## 7. nginx on .68 (internet path)

```bash
# Find every other server block that claims the apex or www — there must be none.
nginx -T 2>/dev/null | grep -nE 'server_name[^;]*[[:space:]](www\.)?simorghai\.com[[:space:];]'
```

The catch-all block (`server_name simorghai.electrokavir.com 192.168.1.68 simorghai.com *.simorghai.com _;`)
lists `simorghai.com`: delete just that word from it (keep `*.simorghai.com`).
Remove or disable any old `simorghai.com` / `www` block the same way. Then:

```bash
cp simorghai-k8s.conf /etc/nginx/conf.d/simorghai-website.conf   # from deploy/nginx/
# CA bundle path: Debian/Ubuntu as written; on Rocky/RHEL change
#   proxy_ssl_trusted_certificate to /etc/pki/tls/certs/ca-bundle.crt
nginx -t && systemctl reload nginx
curl -sI https://simorghai.com/ --resolve simorghai.com:443:127.0.0.1               # 200, served via .220
curl -s  -o /dev/null -w '%{http_code}\n' https://simorghai.com/admin --resolve simorghai.com:443:127.0.0.1   # 404 (LAN-only)
```

The admin panel is closed on the internet path by design; from the office it
works at `https://simorghai.com/admin` (straight to .220). To open it to the
internet too, delete the `location ~ ^/(admin|api/admin)` block.

## 8. ArvanCloud (panel → domain simorghai.com)

**DNS records**

| Type | Name | Value | Cloud (proxy) |
|---|---|---|---|
| A | `@` | `95.38.203.173` (the public IP in front of .68, as for `design`/`simorgh`) | **on** |
| CNAME | `www` | `simorghai.com` | **on** |

**SSL/TLS**

- HTTPS: **on**. Certificate: either Arvan's free certificate, or *upload your own* —
  paste `/etc/letsencrypt/live/simorghai.com/fullchain.pem` and `privkey.pem` from .68
  (then re-upload after each renewal).
- Connection to origin (پروتکل ارتباط با سرور مبدا): **HTTPS**, port 443 —
  nginx on .68 only serves this site over TLS.
- HTTP → HTTPS redirect: **on**. HSTS: optional, only once everything works.

**Caching**

- Cache mode: *respect the origin's headers* (استفاده از هدر سرور مبدا).
  Pages are rendered per request and sent `no-store`; `/_next/static/*` is sent
  `immutable` and will be cached.
- Page rule / cache exception: **no cache** for `/admin*` and `/api/*`.
- After a deploy, if a page looks stale: *Purge cache* for the domain.

## 9. Certificate renewal (every ~90 days)

The gateway holds its own copy of the wildcard. Add this to the certbot deploy
hook on .68 (or run it from master1 after each renewal):

```bash
ssh simorghai 'cat /etc/letsencrypt/live/simorghai.com/fullchain.pem' > /tmp/wc.crt
ssh simorghai 'cat /etc/letsencrypt/live/simorghai.com/privkey.pem'   > /tmp/wc.key
kubectl -n simorgh-website create secret tls wildcard-simorghai-tls \
  --cert=/tmp/wc.crt --key=/tmp/wc.key --dry-run=client -o yaml | kubectl apply -f -
rm -f /tmp/wc.crt /tmp/wc.key
```

Istio picks the new secret up by itself; nothing restarts.

## 10. Upgrading the website

```bash
VERSION=1.0.1        # always a new tag
buildah bud -t registry.simorghai.com/simorgh/simorgh-website:$VERSION . && \
buildah push registry.simorghai.com/simorgh/simorgh-website:$VERSION
sed -i "s/newTag: .*/newTag: \"$VERSION\"/" deploy/k8s/kustomization.yaml
kubectl apply -k deploy/k8s
kubectl -n simorgh-website rollout status deploy/simorgh-website
```

With one replica and `Recreate`, an upgrade is a few seconds of downtime.

## Troubleshooting

| Symptom | Look at |
|---|---|
| Gateway `PROGRAMMED False` / no address | `kubectl -n simorgh-website describe gateway website`; the pool (step 0) |
| .220 does not answer ping/ARP | `kubectl get ciliuml2announcementpolicy simorgh-website-l2`; `kubectl -n kube-system get lease \| grep website` |
| gateway pod Pending | the `website-gateway-options` ConfigMap pins it to worker3 — is worker3 Ready? |
| 503 `upstream connect error` from the gateway | the website pod: `kubectl -n simorgh-website logs deploy/simorgh-website` |
| `RBAC: access denied` | the AuthorizationPolicy: the gateway's service account must be `website-istio` (`kubectl -n simorgh-website get sa`) |
| website pod `CreateContainerConfigError` | the `simorgh-website-secrets` Secret is missing (step 2) |
| readiness fails, `storage: not writable` | the volume's ownership: `fsGroup` 65532 in `30-website.yaml` |
| admin edits don't show on the internet but do on the LAN | Arvan cache — purge, and check the `/admin*`, `/api/*` exceptions |
