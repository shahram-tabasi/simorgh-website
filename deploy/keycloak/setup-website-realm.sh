#!/usr/bin/env bash
#
# Keycloak realm `website`: who may open https://simorghai.com/admin. Its own
# realm, so nothing is shared with realm simorgh (staff apps) or kara.
# Idempotent: what exists is updated in place. Nothing secret is printed.
#
#   deploy/keycloak/setup-website-realm.sh realm          # realm, role, client; secret into the website's Secret
#   deploy/keycloak/setup-website-realm.sh admin EMAIL    # an administrator (asks for a first password;
#                                                         # an authenticator app is set up at first sign-in)
#   deploy/keycloak/setup-website-realm.sh revoke EMAIL   # take website-admin away (the account stays)
#
# realm   brute-force lockout (5 wrong passwords: wait, growing to 15 min),
#         passwords of 12+ characters, no self-registration, Persian first,
#         the Simorgh login look; sessions as long as the site's (12 h).
#         Client simorgh-website: confidential, code flow + PKCE, back to
#         https://simorghai.com/api/admin/oidc/callback; realm roles in the
#         ID token as `roles`. Its secret goes to Secret
#         simorgh-website/simorgh-website-secrets (ADMIN_OIDC_CLIENT_SECRET).
#
# Locally, against a Keycloak on this machine (prints nothing secret, stores nothing):
#   KCADM=/path/kcadm.sh KC_SERVER=http://127.0.0.1:8080 KC_ADMIN_PASSWORD=… NO_K8S=1 \
#   SITE_URL=http://localhost:3000 THEME=keycloak.v2 setup-website-realm.sh realm
set -euo pipefail
REALM="${REALM:-website}"
SITE="${SITE_URL:-https://simorghai.com}"
CLIENT=simorgh-website
ROLE=website-admin
NS="${WEBSITE_NAMESPACE:-simorgh-website}"
KC_NS="${KEYCLOAK_NAMESPACE:-keycloak}"
CFG=/tmp/kcadm-website.config
THEME="${THEME:-simorgh}"

say() { printf '\n== %s\n' "$*"; }
secret_value() { kubectl -n "$1" get secret "$2" -o "jsonpath={.data.$3}" | base64 -d; }

if [ -n "${KCADM:-}" ]; then
  kc() { "$KCADM" "$@" --config "$CFG"; }
  login() { printf '%s\n' "${KC_ADMIN_PASSWORD:?}" | "$KCADM" config credentials --config "$CFG" \
      --server "${KC_SERVER:?}" --realm master --user "${KC_ADMIN_USER:-admin}" --password "$(cat)" >/dev/null; }
  logout() { rm -f "$CFG"; }
  set_password() { printf '%s\n' "$2" | "$KCADM" set-password --config "$CFG" -r "$REALM" --userid "$1" --new-password "$(cat)" >/dev/null; }
else
  POD="$(kubectl -n "$KC_NS" get pod -l app.kubernetes.io/name=keycloak -o jsonpath='{.items[0].metadata.name}')"
  kc() { kubectl -n "$KC_NS" exec -i "$POD" -- /opt/keycloak/bin/kcadm.sh "$@" --config "$CFG"; }
  login() {
    local user pass
    user="$(secret_value "$KC_NS" keycloak-admin username 2>/dev/null || true)"
    pass="$(secret_value "$KC_NS" keycloak-admin password 2>/dev/null || true)"
    [ -n "$user" ] || read -rp "Keycloak admin user: " user
    [ -n "$pass" ] || { read -rsp "Keycloak admin password: " pass; echo; }
    printf '%s\n' "$pass" | kubectl -n "$KC_NS" exec -i "$POD" -- sh -c \
      "/opt/keycloak/bin/kcadm.sh config credentials --config $CFG --server http://localhost:8080 --realm master --user '$user' --password \"\$(cat)\"" >/dev/null
  }
  logout() { kubectl -n "$KC_NS" exec "$POD" -- rm -f "$CFG"; }
  set_password() { printf '%s\n' "$2" | kubectl -n "$KC_NS" exec -i "$POD" -- sh -c \
      "/opt/keycloak/bin/kcadm.sh set-password --config $CFG -r $REALM --userid $1 --new-password \"\$(cat)\"" >/dev/null; }
fi

client_id() { kc get clients -r "$REALM" -q clientId="$CLIENT" --fields id --format csv --noquotes | head -1 | tr -d '\r'; }
user_id() { kc get users -r "$REALM" -q email="$1" -q exact=true --fields id --format csv --noquotes | head -1 | tr -d '\r'; }

realm() {
  say "realm $REALM"
  local settings='{"realm":"'"$REALM"'","enabled":true,"displayName":"SIMORGH Website","displayNameHtml":"SIMORGH — مدیریت سایت",
    "loginTheme":"'"$THEME"'","emailTheme":"'"$THEME"'","internationalizationEnabled":true,"supportedLocales":["fa","en"],"defaultLocale":"fa",
    "registrationAllowed":false,"resetPasswordAllowed":false,"rememberMe":false,"loginWithEmailAllowed":true,"duplicateEmailsAllowed":false,
    "bruteForceProtected":true,"failureFactor":5,"waitIncrementSeconds":60,"maxFailureWaitSeconds":900,"maxDeltaTimeSeconds":43200,"permanentLockout":false,
    "passwordPolicy":"length(12) and notUsername and notEmail and passwordHistory(3)",
    "otpPolicyType":"totp","otpPolicyAlgorithm":"HmacSHA1","otpPolicyDigits":6,"otpPolicyPeriod":30,
    "ssoSessionIdleTimeout":3600,"ssoSessionMaxLifespan":43200}'
  if kc get "realms/$REALM" --fields realm >/dev/null 2>&1; then
    printf '%s' "$settings" | kc update "realms/$REALM" -f - >/dev/null && echo "updated"
  else
    printf '%s' "$settings" | kc create realms -f - >/dev/null && echo "created"
  fi

  say "role $ROLE"
  kc get "roles/$ROLE" -r "$REALM" >/dev/null 2>&1 \
    || kc create roles -r "$REALM" -s name="$ROLE" -s 'description=May edit https://simorghai.com/admin' >/dev/null
  echo ok

  say "client $CLIENT"
  local json id
  json='{"clientId":"'"$CLIENT"'","name":"SIMORGH website admin","enabled":true,"protocol":"openid-connect",
    "publicClient":false,"clientAuthenticatorType":"client-secret","standardFlowEnabled":true,"implicitFlowEnabled":false,
    "directAccessGrantsEnabled":false,"serviceAccountsEnabled":false,"frontchannelLogout":true,
    "redirectUris":["'"$SITE"'/api/admin/oidc/callback"],"webOrigins":["'"$SITE"'"],
    "attributes":{"pkce.code.challenge.method":"S256","post.logout.redirect.uris":"'"$SITE"'/admin/login"}}'
  id="$(client_id)"
  if [ -z "$id" ]; then
    printf '%s' "$json" | kc create clients -r "$REALM" -f - >/dev/null
    id="$(client_id)"
    echo "created"
  else
    printf '%s' "$json" | kc update "clients/$id" -r "$REALM" -f - >/dev/null
    echo "updated"
  fi
  # Realm roles into the ID token as `roles` (the site checks website-admin there).
  if ! kc get "clients/$id/protocol-mappers/models" -r "$REALM" --fields name --format csv --noquotes | grep -qx realm-roles; then
    printf '%s' '{"name":"realm-roles","protocol":"openid-connect","protocolMapper":"oidc-usermodel-realm-role-mapper",
      "config":{"claim.name":"roles","jsonType.label":"String","multivalued":"true","id.token.claim":"true","access.token.claim":"true","userinfo.token.claim":"true"}}' \
      | kc create "clients/$id/protocol-mappers/models" -r "$REALM" -f - >/dev/null
    echo "mapper realm-roles added"
  fi

  [ -n "${NO_K8S:-}" ] && { echo "(NO_K8S: client secret not stored)"; return; }
  say "secret into $NS/simorgh-website-secrets"
  local s
  s="$(kc get "clients/$id/client-secret" -r "$REALM" --fields value --format csv --noquotes | tr -d '\r\n')"
  kubectl -n "$NS" patch secret simorgh-website-secrets --type merge \
    -p "{\"stringData\":{\"ADMIN_OIDC_CLIENT_SECRET\":\"$s\"}}" >/dev/null
  unset s
  if [ "$(secret_value "$NS" simorgh-website-secrets ADMIN_SECRET 2>/dev/null | wc -c)" -lt 32 ]; then
    kubectl -n "$NS" patch secret simorgh-website-secrets --type merge \
      -p "{\"stringData\":{\"ADMIN_SECRET\":\"$(python3 -c 'import secrets; print(secrets.token_hex(32))')\"}}" >/dev/null
    echo "ADMIN_SECRET made (the sessions' key)"
  fi
  echo "stored ADMIN_OIDC_CLIENT_SECRET"
}

admin() {
  local email="${1:?usage: $0 admin EMAIL}" id p1 p2
  say "administrator $email"
  id="$(user_id "$email")"
  if [ -z "$id" ]; then
    # Keycloak 26 asks for both names at sign-in when they are missing.
    local first last
    read -rp "First name: " first; read -rp "Last name: " last
    [ -n "$first" ] && [ -n "$last" ] || { echo "both names are needed"; exit 1; }
    kc create users -r "$REALM" -s username="$email" -s email="$email" -s emailVerified=true -s enabled=true \
      -s firstName="$first" -s lastName="$last" -s 'requiredActions=["CONFIGURE_TOTP"]' >/dev/null
    id="$(user_id "$email")"
    read -rsp "First password for $email (12+ characters): " p1; echo
    read -rsp "Again: " p2; echo
    [ -n "$p1" ] && [ "$p1" = "$p2" ] || { echo "passwords empty or different"; exit 1; }
    set_password "$id" "$p1"
    unset p1 p2
    echo "created; at first sign-in they set up an authenticator app (Google/Microsoft Authenticator)"
  else
    echo "exists"
  fi
  kc add-roles -r "$REALM" --uid "$id" --rolename "$ROLE" >/dev/null
  echo "has $ROLE"
}

revoke() {
  local email="${1:?usage: $0 revoke EMAIL}" id
  id="$(user_id "$email")"
  [ -n "$id" ] || { echo "no user $email"; exit 1; }
  kc remove-roles -r "$REALM" --uid "$id" --rolename "$ROLE" >/dev/null
  echo "$email no longer has $ROLE"
}

login
trap logout EXIT
case "${1:-}" in
  realm) realm ;;
  admin) shift; admin "$@" ;;
  revoke) shift; revoke "$@" ;;
  *) echo "usage: $0 realm | admin EMAIL | revoke EMAIL"; exit 2 ;;
esac
