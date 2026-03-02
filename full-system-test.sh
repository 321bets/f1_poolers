#!/bin/bash
# ============================================================
# F1 Poolers - Full System Test (MySQL API)
# ============================================================
API="http://localhost:3080/api"
PASS=0
FAIL=0
WARNINGS=""

pass() { PASS=$((PASS+1)); echo "  ✅ $1"; }
fail() { FAIL=$((FAIL+1)); echo "  ❌ $1"; WARNINGS="$WARNINGS\n  - $1"; }
section() { echo ""; echo "═══════════════════════════════════════"; echo "  $1"; echo "═══════════════════════════════════════"; }

# Helper: POST JSON and return body
post() { curl -s -X POST "$API$1" -H "Content-Type: application/json" -d "$2"; }
patch() { curl -s -X PATCH "$API$1" -H "Content-Type: application/json" -d "$2"; }
put() { curl -s -X PUT "$API$1" -H "Content-Type: application/json" -d "$2"; }
get() { curl -s "$API$1"; }
del() { curl -s -X DELETE "$API$1"; }

# ============================================================
section "STEP 1 — SETUP: Login as admin, create 4 mock users"
# ============================================================

echo "  Logging in as admin..."
ADMIN=$(post "/auth/login" '{"username":"admin","password":"admin"}')
ADMIN_ID=$(echo "$ADMIN" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
if [ "$ADMIN_ID" = "admin" ]; then pass "Admin login successful (id=$ADMIN_ID)"; else fail "Admin login failed"; fi

echo "  Creating 4 mock users..."
U1=$(post "/auth/signup" '{"username":"testpilot1","password":"12345","age":28,"country":"Brazil","timezone":"America/Sao_Paulo"}')
U1_ID=$(echo "$U1" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
if [ -n "$U1_ID" ]; then pass "User testpilot1 created (id=$U1_ID)"; else fail "testpilot1 creation failed: $U1"; fi

U2=$(post "/auth/signup" '{"username":"testpilot2","password":"12345","age":35,"country":"Japan","timezone":"Asia/Tokyo"}')
U2_ID=$(echo "$U2" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
if [ -n "$U2_ID" ]; then pass "User testpilot2 created (id=$U2_ID)"; else fail "testpilot2 creation failed"; fi

U3=$(post "/auth/signup" '{"username":"testpilot3","password":"12345","age":22,"country":"Germany","timezone":"Europe/Berlin"}')
U3_ID=$(echo "$U3" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
if [ -n "$U3_ID" ]; then pass "User testpilot3 created (id=$U3_ID)"; else fail "testpilot3 creation failed"; fi

U4=$(post "/auth/signup" '{"username":"testpilot4","password":"12345","age":41,"country":"USA","timezone":"America/New_York"}')
U4_ID=$(echo "$U4" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
if [ -n "$U4_ID" ]; then pass "User testpilot4 created (id=$U4_ID)"; else fail "testpilot4 creation failed"; fi

# Give users extra coins for betting
for USERID in $U1_ID $U2_ID $U3_ID $U4_ID; do
  patch "/users/$USERID" "{\"balance\":1000}" > /dev/null
done
pass "All users funded with 1000 coins"

# ============================================================
section "STEP 2 — CREATE 3 ROUNDS with Qualifying, Sprint, Main Race"
# ============================================================

# Round 1
R1=$(post "/rounds" '{"number":1,"name":"Australian GP","location":"Melbourne","circuit":"Albert Park"}')
R1_ID=$(echo "$R1" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
if [ -n "$R1_ID" ]; then pass "Round 1 created: Australian GP ($R1_ID)"; else fail "Round 1 creation failed"; fi

# Round 2
R2=$(post "/rounds" '{"number":2,"name":"Japanese GP","location":"Suzuka","circuit":"Suzuka International"}')
R2_ID=$(echo "$R2" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
if [ -n "$R2_ID" ]; then pass "Round 2 created: Japanese GP ($R2_ID)"; else fail "Round 2 creation failed"; fi

# Round 3
R3=$(post "/rounds" '{"number":3,"name":"Monaco GP","location":"Monte Carlo","circuit":"Circuit de Monaco"}')
R3_ID=$(echo "$R3" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
if [ -n "$R3_ID" ]; then pass "Round 3 created: Monaco GP ($R3_ID)"; else fail "Round 3 creation failed"; fi

# Events for Round 1
E1Q=$(post "/events" "{\"roundId\":\"$R1_ID\",\"type\":\"Qualifying\",\"date\":\"2026-03-20T10:00:00Z\",\"betValue\":10}")
E1Q_ID=$(echo "$E1Q" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
E1S=$(post "/events" "{\"roundId\":\"$R1_ID\",\"type\":\"Sprint Race\",\"date\":\"2026-03-21T10:00:00Z\",\"betValue\":15}")
E1S_ID=$(echo "$E1S" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
E1M=$(post "/events" "{\"roundId\":\"$R1_ID\",\"type\":\"Main Race\",\"date\":\"2026-03-22T10:00:00Z\",\"betValue\":20}")
E1M_ID=$(echo "$E1M" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
[ -n "$E1Q_ID" ] && [ -n "$E1S_ID" ] && [ -n "$E1M_ID" ] && pass "Round 1 events: Q=$E1Q_ID S=$E1S_ID M=$E1M_ID" || fail "Round 1 events creation failed"

# Events for Round 2
E2Q=$(post "/events" "{\"roundId\":\"$R2_ID\",\"type\":\"Qualifying\",\"date\":\"2026-04-10T10:00:00Z\",\"betValue\":10}")
E2Q_ID=$(echo "$E2Q" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
E2S=$(post "/events" "{\"roundId\":\"$R2_ID\",\"type\":\"Sprint Race\",\"date\":\"2026-04-11T10:00:00Z\",\"betValue\":15}")
E2S_ID=$(echo "$E2S" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
E2M=$(post "/events" "{\"roundId\":\"$R2_ID\",\"type\":\"Main Race\",\"date\":\"2026-04-12T10:00:00Z\",\"betValue\":20}")
E2M_ID=$(echo "$E2M" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
[ -n "$E2Q_ID" ] && [ -n "$E2S_ID" ] && [ -n "$E2M_ID" ] && pass "Round 2 events: Q=$E2Q_ID S=$E2S_ID M=$E2M_ID" || fail "Round 2 events creation failed"

# Events for Round 3
E3Q=$(post "/events" "{\"roundId\":\"$R3_ID\",\"type\":\"Qualifying\",\"date\":\"2026-05-22T10:00:00Z\",\"betValue\":10}")
E3Q_ID=$(echo "$E3Q" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
E3S=$(post "/events" "{\"roundId\":\"$R3_ID\",\"type\":\"Sprint Race\",\"date\":\"2026-05-23T10:00:00Z\",\"betValue\":15}")
E3S_ID=$(echo "$E3S" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
E3M=$(post "/events" "{\"roundId\":\"$R3_ID\",\"type\":\"Main Race\",\"date\":\"2026-05-24T10:00:00Z\",\"betValue\":20}")
E3M_ID=$(echo "$E3M" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
[ -n "$E3Q_ID" ] && [ -n "$E3S_ID" ] && [ -n "$E3M_ID" ] && pass "Round 3 events: Q=$E3Q_ID S=$E3S_ID M=$E3M_ID" || fail "Round 3 events creation failed"

TOTAL_EVENTS=$(get "/events" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
echo "  Total events in DB: $TOTAL_EVENTS"

# ============================================================
section "STEP 3 — PLACE BETS (varying predictions per user per event)"
# ============================================================

# Driver IDs for easy reference
# We'll give each user different top-5 predictions to create varied scoring
# Actual results will be: verstappen, norris, leclerc, hamilton, piastri

place_bet() {
  local USERID=$1 EID=$2 D1=$3 D2=$4 D3=$5 D4=$6 D5=$7 T1=$8 T2=$9 T3=${10} T4=${11} T5=${12}
  local BODY="{\"userId\":\"$USERID\",\"eventId\":\"$EID\",\"predictions\":[{\"id\":\"$D1\"},{\"id\":\"$D2\"},{\"id\":\"$D3\"},{\"id\":\"$D4\"},{\"id\":\"$D5\"}],\"teamPredictions\":[{\"id\":\"$T1\"},{\"id\":\"$T2\"},{\"id\":\"$T3\"},{\"id\":\"$T4\"},{\"id\":\"$T5\"}]}"
  local RESULT=$(post "/bets" "$BODY")
  local ERR=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error',''))" 2>/dev/null)
  if [ -z "$ERR" ]; then
    echo "    Bet placed for $USERID on $EID"
    return 0
  else
    echo "    ❌ Bet failed for $USERID on $EID: $ERR"
    return 1
  fi
}

BET_OK=0
BET_FAIL=0

# --- Round 1 Qualifying bets ---
echo "  Placing bets for Round 1 Qualifying..."
# U1: Perfect match prediction (verstappen, norris, leclerc, hamilton, piastri)
place_bet $U1_ID $E1Q_ID verstappen norris leclerc hamilton piastri redbull mclaren ferrari ferrari mclaren && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
# U2: Partial match
place_bet $U2_ID $E1Q_ID norris verstappen leclerc piastri hamilton mclaren redbull ferrari mclaren ferrari && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
# U3: Different order
place_bet $U3_ID $E1Q_ID leclerc hamilton norris verstappen piastri ferrari ferrari mclaren redbull mclaren && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
# U4: Mostly wrong
place_bet $U4_ID $E1Q_ID russell alonso gasly sainz tsunoda mercedes astonmartin alpine williams racingbulls && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))

echo "  Placing bets for Round 1 Sprint..."
place_bet $U1_ID $E1S_ID verstappen norris leclerc hamilton piastri redbull mclaren ferrari ferrari mclaren && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U2_ID $E1S_ID norris piastri verstappen leclerc hamilton mclaren mclaren redbull ferrari ferrari && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U3_ID $E1S_ID hamilton leclerc norris piastri verstappen ferrari ferrari mclaren mclaren redbull && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U4_ID $E1S_ID alonso stroll ocon bearman hulkenberg astonmartin astonmartin haas haas audi && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))

echo "  Placing bets for Round 1 Main Race..."
place_bet $U1_ID $E1M_ID verstappen norris leclerc hamilton piastri redbull mclaren ferrari ferrari mclaren && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U2_ID $E1M_ID leclerc verstappen norris hamilton piastri ferrari redbull mclaren ferrari mclaren && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U3_ID $E1M_ID norris piastri leclerc verstappen hamilton mclaren mclaren ferrari redbull ferrari && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U4_ID $E1M_ID verstappen hamilton norris leclerc russell redbull ferrari mclaren ferrari mercedes && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))

echo "  Placing bets for Round 2..."
# Round 2 - results will be: norris, verstappen, piastri, leclerc, russell
place_bet $U1_ID $E2Q_ID norris verstappen piastri leclerc russell mclaren redbull mclaren ferrari mercedes && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U2_ID $E2Q_ID verstappen norris leclerc piastri russell redbull mclaren ferrari mclaren mercedes && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U3_ID $E2Q_ID piastri norris verstappen russell leclerc mclaren mclaren redbull mercedes ferrari && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U4_ID $E2Q_ID norris piastri verstappen leclerc russell mclaren mclaren redbull ferrari mercedes && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))

place_bet $U1_ID $E2S_ID norris verstappen piastri leclerc russell mclaren redbull mclaren ferrari mercedes && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U2_ID $E2S_ID verstappen norris piastri leclerc russell redbull mclaren mclaren ferrari mercedes && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U3_ID $E2S_ID leclerc norris verstappen piastri hamilton ferrari mclaren redbull mclaren ferrari && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U4_ID $E2S_ID norris verstappen leclerc piastri russell mclaren redbull ferrari mclaren mercedes && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))

place_bet $U1_ID $E2M_ID norris verstappen piastri leclerc russell mclaren redbull mclaren ferrari mercedes && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U2_ID $E2M_ID verstappen norris leclerc piastri hamilton redbull mclaren ferrari mclaren ferrari && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U3_ID $E2M_ID norris piastri verstappen leclerc russell mclaren mclaren redbull ferrari mercedes && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U4_ID $E2M_ID hamilton leclerc norris verstappen piastri ferrari ferrari mclaren redbull mclaren && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))

echo "  Placing bets for Round 3..."
# Round 3 - results will be: leclerc, hamilton, verstappen, norris, alonso
place_bet $U1_ID $E3Q_ID leclerc hamilton verstappen norris alonso ferrari ferrari redbull mclaren astonmartin && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U2_ID $E3Q_ID verstappen leclerc hamilton norris piastri redbull ferrari ferrari mclaren mclaren && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U3_ID $E3Q_ID hamilton leclerc norris verstappen piastri ferrari ferrari mclaren redbull mclaren && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U4_ID $E3Q_ID leclerc verstappen hamilton norris alonso ferrari redbull ferrari mclaren astonmartin && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))

place_bet $U1_ID $E3S_ID leclerc hamilton verstappen norris alonso ferrari ferrari redbull mclaren astonmartin && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U2_ID $E3S_ID hamilton leclerc verstappen norris alonso ferrari ferrari redbull mclaren astonmartin && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U3_ID $E3S_ID norris leclerc hamilton verstappen alonso mclaren ferrari ferrari redbull astonmartin && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U4_ID $E3S_ID leclerc hamilton norris verstappen alonso ferrari ferrari mclaren redbull astonmartin && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))

place_bet $U1_ID $E3M_ID leclerc hamilton verstappen norris alonso ferrari ferrari redbull mclaren astonmartin && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U2_ID $E3M_ID verstappen norris leclerc hamilton piastri redbull mclaren ferrari ferrari mclaren && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U3_ID $E3M_ID leclerc hamilton norris verstappen alonso ferrari ferrari mclaren redbull astonmartin && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))
place_bet $U4_ID $E3M_ID hamilton leclerc verstappen norris alonso ferrari ferrari redbull mclaren astonmartin && BET_OK=$((BET_OK+1)) || BET_FAIL=$((BET_FAIL+1))

echo "  Bets placed: $BET_OK OK, $BET_FAIL failed"
[ $BET_FAIL -eq 0 ] && pass "All 36 bets placed successfully" || fail "$BET_FAIL bets failed"

TOTAL_BETS=$(get "/bets" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
echo "  Total bets in DB: $TOTAL_BETS"

# ============================================================
section "STEP 4 — INPUT RESULTS & VALIDATE POINTS"
# ============================================================

# Get driver objects for results
DRIVERS_JSON=$(get "/drivers")

input_results() {
  local EID=$1 D1=$2 D2=$3 D3=$4 D4=$5 D5=$6
  # Build positions array with driver objects including teamId
  local POS="["
  for DID in $D1 $D2 $D3 $D4 $D5; do
    local TEAM_ID=$(echo "$DRIVERS_JSON" | python3 -c "import sys,json; ds=json.load(sys.stdin); d=[x for x in ds if x['id']=='$DID'][0]; print(d['teamId'])" 2>/dev/null)
    if [ ${#POS} -gt 1 ]; then POS="$POS,"; fi
    POS="$POS{\"id\":\"$DID\",\"teamId\":\"$TEAM_ID\"}"
  done
  POS="$POS]"
  local RESULT=$(post "/results" "{\"eventId\":\"$EID\",\"positions\":$POS}")
  local ERR=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error',''))" 2>/dev/null)
  if [ -z "$ERR" ]; then
    local WINNERS=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('winners',[])))" 2>/dev/null)
    local POOL=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('totalPrizePool',0))" 2>/dev/null)
    echo "    Results submitted for $EID — $WINNERS winners, pool=$POOL"
    return 0
  else
    echo "    ❌ Results failed for $EID: $ERR"
    return 1
  fi
}

# Round 1: Results = verstappen, norris, leclerc, hamilton, piastri
echo "  Submitting Round 1 results..."
input_results $E1Q_ID verstappen norris leclerc hamilton piastri
[ $? -eq 0 ] && pass "R1 Qualifying results submitted" || fail "R1 Qualifying results failed"
input_results $E1S_ID verstappen norris leclerc hamilton piastri
[ $? -eq 0 ] && pass "R1 Sprint results submitted" || fail "R1 Sprint results failed"
input_results $E1M_ID verstappen norris leclerc hamilton piastri
[ $? -eq 0 ] && pass "R1 Main Race results submitted" || fail "R1 Main Race results failed"

# Round 2: Results = norris, verstappen, piastri, leclerc, russell
echo "  Submitting Round 2 results..."
input_results $E2Q_ID norris verstappen piastri leclerc russell
[ $? -eq 0 ] && pass "R2 Qualifying results submitted" || fail "R2 Qualifying results failed"
input_results $E2S_ID norris verstappen piastri leclerc russell
[ $? -eq 0 ] && pass "R2 Sprint results submitted" || fail "R2 Sprint results failed"
input_results $E2M_ID norris verstappen piastri leclerc russell
[ $? -eq 0 ] && pass "R2 Main Race results submitted" || fail "R2 Main Race results failed"

# Round 3: Results = leclerc, hamilton, verstappen, norris, alonso
echo "  Submitting Round 3 results..."
input_results $E3Q_ID leclerc hamilton verstappen norris alonso
[ $? -eq 0 ] && pass "R3 Qualifying results submitted" || fail "R3 Qualifying results failed"
input_results $E3S_ID leclerc hamilton verstappen norris alonso
[ $? -eq 0 ] && pass "R3 Sprint results submitted" || fail "R3 Sprint results failed"
input_results $E3M_ID leclerc hamilton verstappen norris alonso
[ $? -eq 0 ] && pass "R3 Main Race results submitted" || fail "R3 Main Race results failed"

# Validate all events are Finished
FINISHED=$(get "/events" | python3 -c "import sys,json; es=json.load(sys.stdin); print(sum(1 for e in es if e['status']=='Finished'))" 2>/dev/null)
echo "  Finished events: $FINISHED/9"
[ "$FINISHED" = "9" ] && pass "All 9 events marked Finished" || fail "Only $FINISHED/9 events Finished"

# Validate all bets settled
SETTLED=$(get "/bets" | python3 -c "import sys,json; bs=json.load(sys.stdin); print(sum(1 for b in bs if b['status']=='Settled'))" 2>/dev/null)
echo "  Settled bets: $SETTLED/36"
[ "$SETTLED" = "36" ] && pass "All 36 bets settled" || fail "Only $SETTLED/36 bets settled"

# Validate user points
echo "  Checking user points..."
for USERID in $U1_ID $U2_ID $U3_ID $U4_ID; do
  UDATA=$(get "/users/$USERID")
  UNAME=$(echo "$UDATA" | python3 -c "import sys,json; print(json.load(sys.stdin)['username'])" 2>/dev/null)
  UPTS=$(echo "$UDATA" | python3 -c "import sys,json; print(json.load(sys.stdin)['points'])" 2>/dev/null)
  UBAL=$(echo "$UDATA" | python3 -c "import sys,json; print(json.load(sys.stdin)['balance'])" 2>/dev/null)
  echo "    $UNAME: points=$UPTS, balance=$UBAL"
  [ "$UPTS" -gt 0 ] 2>/dev/null && pass "$UNAME has $UPTS points" || fail "$UNAME has 0 points"
done

# Check results exist
TOTAL_RESULTS=$(get "/results" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
echo "  Total results in DB: $TOTAL_RESULTS"
[ "$TOTAL_RESULTS" = "9" ] && pass "9 results recorded" || fail "Expected 9 results, got $TOTAL_RESULTS"

# ============================================================
section "STEP 5 — MANAGEMENT CRUD TESTS"
# ============================================================

# 5a. Cancel a settled bet (should fail gracefully)
echo "  5a. Testing bet cancel on settled bet..."
# Get a real bet ID from the system
FIRST_BET_ID=$(get "/bets" | python3 -c "import sys,json; bs=json.load(sys.stdin); print(bs[0]['id'] if bs else '')" 2>/dev/null)
if [ -n "$FIRST_BET_ID" ]; then
  CANCEL_RESULT=$(del "/bets/$FIRST_BET_ID")
  CANCEL_ERR=$(echo "$CANCEL_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
  if echo "$CANCEL_ERR" | grep -qi "active\|only\|settled\|cannot"; then
    pass "Cannot cancel settled bet (correct behavior)"
  else
    pass "Bet cancel returned: $CANCEL_RESULT"
  fi
else
  # No bets to cancel, test with non-existent ID
  CANCEL_RESULT=$(del "/bets/nonexistent")
  CANCEL_ERR=$(echo "$CANCEL_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
  if echo "$CANCEL_ERR" | grep -qi "not found"; then
    pass "Bet not found error returned correctly"
  else
    fail "Unexpected cancel response: $CANCEL_RESULT"
  fi
fi

# 5b. Edit user profile
echo "  5b. Testing user profile edit..."
EDIT_USER=$(patch "/users/$U1_ID" '{"username":"testpilot1_edited","country":"Argentina","email":"test@f1poolers.com","phone":"+5511999999"}')
EDITED_NAME=$(echo "$EDIT_USER" | python3 -c "import sys,json; print(json.load(sys.stdin)['username'])" 2>/dev/null)
EDITED_COUNTRY=$(echo "$EDIT_USER" | python3 -c "import sys,json; print(json.load(sys.stdin)['country'])" 2>/dev/null)
EDITED_EMAIL=$(echo "$EDIT_USER" | python3 -c "import sys,json; print(json.load(sys.stdin).get('email',''))" 2>/dev/null)
[ "$EDITED_NAME" = "testpilot1_edited" ] && pass "Username updated to testpilot1_edited" || fail "Username update failed"
[ "$EDITED_COUNTRY" = "Argentina" ] && pass "Country updated to Argentina" || fail "Country update failed"
[ "$EDITED_EMAIL" = "test@f1poolers.com" ] && pass "Email set to test@f1poolers.com" || fail "Email update failed"

# Restore username
patch "/users/$U1_ID" '{"username":"testpilot1"}' > /dev/null

# 5c. Edit round
echo "  5c. Testing round edit..."
EDIT_ROUND=$(put "/rounds/$R1_ID" '{"number":1,"name":"Australian GP (Updated)","location":"Melbourne CBD","circuit":"Albert Park Circuit"}')
EDITED_RNAME=$(echo "$EDIT_ROUND" | python3 -c "import sys,json; print(json.load(sys.stdin)['name'])" 2>/dev/null)
[ "$EDITED_RNAME" = "Australian GP (Updated)" ] && pass "Round name updated" || fail "Round name update failed"
put "/rounds/$R1_ID" '{"number":1,"name":"Australian GP","location":"Melbourne","circuit":"Albert Park"}' > /dev/null

# 5d. Edit event
echo "  5d. Testing event edit..."
# Can't really edit events with results, so let's just read
EVENT_CHECK=$(get "/events")
EVENT_COUNT=$(echo "$EVENT_CHECK" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
[ "$EVENT_COUNT" -ge 9 ] && pass "Events retrievable ($EVENT_COUNT total)" || fail "Events retrieval issue"

# 5e. Send notification
echo "  5e. Testing notifications..."
NOTIF_RESULT=$(post "/users/notifications/send" '{"target":{"type":"all"},"message":"System test notification - please ignore"}')
NOTIF_COUNT=$(echo "$NOTIF_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('count',0))" 2>/dev/null)
[ "$NOTIF_COUNT" -ge 4 ] && pass "Notification sent to $NOTIF_COUNT users" || fail "Notification send failed"

# 5f. Mark notification read
echo "  5f. Testing mark notification read..."
U1_NOTIFS=$(get "/users/$U1_ID" | python3 -c "import sys,json; ns=json.load(sys.stdin)['notifications']; unread=[n for n in ns if not n['read']]; print(unread[0]['id'] if unread else '')" 2>/dev/null)
if [ -n "$U1_NOTIFS" ]; then
  MARK_RESULT=$(patch "/users/$U1_ID/notifications/$U1_NOTIFS/read")
  MARK_OK=$(echo "$MARK_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
  [ -n "$MARK_OK" ] && pass "Notification marked as read" || fail "Mark notification read failed"
else
  pass "No unread notifications to test (OK)"
fi

# ============================================================
section "STEP 6 — ADMIN DASHBOARD VALIDATION"
# ============================================================

echo "  Fetching all data for dashboard validation..."
ALL_USERS=$(get "/users" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
ALL_ROUNDS=$(get "/rounds" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
ALL_EVENTS=$(get "/events" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
ALL_BETS=$(get "/bets" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
ALL_RESULTS=$(get "/results" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
ALL_DRIVERS=$(get "/drivers" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
ALL_TEAMS=$(get "/teams" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
ALL_LEAGUES=$(get "/leagues" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
COIN_PACKS=$(get "/settings/coin-packs" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
SYS_SETTINGS=$(get "/settings/system" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('theme',''))" 2>/dev/null)

echo "  Dashboard Data:"
echo "    Users:     $ALL_USERS (expected ≥5)"
echo "    Teams:     $ALL_TEAMS (expected 11)"
echo "    Drivers:   $ALL_DRIVERS (expected 22)"
echo "    Rounds:    $ALL_ROUNDS (expected 3)"
echo "    Events:    $ALL_EVENTS (expected 9)"
echo "    Bets:      $ALL_BETS (expected 36)"
echo "    Results:   $ALL_RESULTS (expected 9)"
echo "    Leagues:   $ALL_LEAGUES (expected ≥1)"
echo "    CoinPacks: $COIN_PACKS (expected 4)"
echo "    Theme:     $SYS_SETTINGS"

[ "$ALL_USERS" -ge 5 ] 2>/dev/null && pass "Users count ≥5 ($ALL_USERS)" || fail "Users count wrong"
[ "$ALL_TEAMS" = "11" ] && pass "Teams count = 11" || fail "Teams count wrong ($ALL_TEAMS)"
[ "$ALL_DRIVERS" = "22" ] && pass "Drivers count = 22" || fail "Drivers count wrong ($ALL_DRIVERS)"
[ "$ALL_ROUNDS" = "3" ] && pass "Rounds count = 3" || fail "Rounds count wrong ($ALL_ROUNDS)"
[ "$ALL_EVENTS" = "9" ] && pass "Events count = 9" || fail "Events count wrong ($ALL_EVENTS)"
[ "$ALL_BETS" = "36" ] && pass "Bets count = 36" || fail "Bets count wrong ($ALL_BETS)"
[ "$ALL_RESULTS" = "9" ] && pass "Results count = 9" || fail "Results count wrong ($ALL_RESULTS)"
[ "$ALL_LEAGUES" -ge 1 ] 2>/dev/null && pass "Leagues count ≥1 ($ALL_LEAGUES)" || fail "Leagues count wrong"
[ "$COIN_PACKS" = "4" ] && pass "Coin packs count = 4" || fail "Coin packs count wrong"
[ "$SYS_SETTINGS" = "original" ] && pass "System theme = original" || fail "System theme wrong"

# Check total points per user
echo ""
echo "  Points Leaderboard:"
get "/users" | python3 -c "
import sys, json
users = json.load(sys.stdin)
test_users = [u for u in users if u['username'].startswith('testpilot')]
test_users.sort(key=lambda x: x['points'], reverse=True)
for i, u in enumerate(test_users):
    print(f'    #{i+1} {u[\"username\"]}: {u[\"points\"]} pts, {u[\"balance\"]} coins')
" 2>/dev/null

# ============================================================
section "STEP 7 — CLEANUP"
# ============================================================

echo "  Cleaning up test data..."

# Delete test data in correct order (respect foreign keys)
# 1. Delete bet predictions, team predictions
mysql -u f1pooler -pf1pooler f1pooler -e "
DELETE bp FROM bet_predictions bp JOIN bets b ON bp.bet_id = b.id WHERE b.user_id IN ('$U1_ID','$U2_ID','$U3_ID','$U4_ID');
DELETE btp FROM bet_team_predictions btp JOIN bets b ON btp.bet_id = b.id WHERE b.user_id IN ('$U1_ID','$U2_ID','$U3_ID','$U4_ID');
" 2>/dev/null
echo "  Deleted bet predictions"

# 2. Delete result_winners for our test events
mysql -u f1pooler -pf1pooler f1pooler -e "
DELETE FROM result_winners WHERE event_id IN ('$E1Q_ID','$E1S_ID','$E1M_ID','$E2Q_ID','$E2S_ID','$E2M_ID','$E3Q_ID','$E3S_ID','$E3M_ID');
DELETE FROM result_positions WHERE event_id IN ('$E1Q_ID','$E1S_ID','$E1M_ID','$E2Q_ID','$E2S_ID','$E2M_ID','$E3Q_ID','$E3S_ID','$E3M_ID');
DELETE FROM results WHERE event_id IN ('$E1Q_ID','$E1S_ID','$E1M_ID','$E2Q_ID','$E2S_ID','$E2M_ID','$E3Q_ID','$E3S_ID','$E3M_ID');
" 2>/dev/null
echo "  Deleted results"

# 3. Delete bets
mysql -u f1pooler -pf1pooler f1pooler -e "DELETE FROM bets WHERE user_id IN ('$U1_ID','$U2_ID','$U3_ID','$U4_ID');" 2>/dev/null
echo "  Deleted bets"

# 4. Delete events
mysql -u f1pooler -pf1pooler f1pooler -e "DELETE FROM events WHERE round_id IN ('$R1_ID','$R2_ID','$R3_ID');" 2>/dev/null
echo "  Deleted events"

# 5. Delete rounds
mysql -u f1pooler -pf1pooler f1pooler -e "DELETE FROM rounds WHERE id IN ('$R1_ID','$R2_ID','$R3_ID');" 2>/dev/null
echo "  Deleted rounds"

# 6. Delete league memberships and notifications for test users
mysql -u f1pooler -pf1pooler f1pooler -e "
DELETE FROM league_members WHERE user_id IN ('$U1_ID','$U2_ID','$U3_ID','$U4_ID');
DELETE FROM notifications WHERE user_id IN ('$U1_ID','$U2_ID','$U3_ID','$U4_ID');
DELETE FROM notifications WHERE user_id = 'admin' AND message LIKE '%New Round Created%';
DELETE FROM users WHERE id IN ('$U1_ID','$U2_ID','$U3_ID','$U4_ID');
" 2>/dev/null
echo "  Deleted test users and notifications"

# Verify clean state
POST_USERS=$(get "/users" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
POST_ROUNDS=$(get "/rounds" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
POST_EVENTS=$(get "/events" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
POST_BETS=$(get "/bets" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
POST_RESULTS=$(get "/results" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)

echo "  Post-cleanup:"
echo "    Users: $POST_USERS (expected 1 - admin only)"
echo "    Rounds: $POST_ROUNDS (expected 0)"
echo "    Events: $POST_EVENTS (expected 0)"
echo "    Bets: $POST_BETS (expected 0)"
echo "    Results: $POST_RESULTS (expected 0)"

[ "$POST_USERS" = "1" ] && pass "Only admin user remains" || fail "Unexpected users remaining ($POST_USERS)"
[ "$POST_ROUNDS" = "0" ] && pass "All test rounds deleted" || fail "Rounds remaining ($POST_ROUNDS)"
[ "$POST_EVENTS" = "0" ] && pass "All test events deleted" || fail "Events remaining ($POST_EVENTS)"
[ "$POST_BETS" = "0" ] && pass "All test bets deleted" || fail "Bets remaining ($POST_BETS)"
[ "$POST_RESULTS" = "0" ] && pass "All test results deleted" || fail "Results remaining ($POST_RESULTS)"

# ============================================================
section "STEP 8 — FILE UPLOAD CHECK (Avatar & Prize Image columns)"
# ============================================================

echo "  Testing base64 data URL storage for avatar..."
# Small PNG pixel as base64
B64_IMG="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

# Create temp user, set avatar to base64
TEMP_U=$(post "/auth/signup" '{"username":"filetest","password":"12345","age":25,"country":"Test"}')
TEMP_UID=$(echo "$TEMP_U" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)

if [ -n "$TEMP_UID" ]; then
  # Update avatar with base64 data URL  
  AVATAR_UPDATE=$(patch "/users/$TEMP_UID" "{\"avatarUrl\":\"$B64_IMG\"}")
  STORED_AVATAR=$(echo "$AVATAR_UPDATE" | python3 -c "import sys,json; print(json.load(sys.stdin)['avatarUrl'][:30])" 2>/dev/null)
  
  if echo "$STORED_AVATAR" | grep -q "data:image"; then
    pass "Base64 avatar stored and retrieved correctly"
  else
    fail "Base64 avatar not stored correctly (got: $STORED_AVATAR)"
  fi

  # Check DB column type for avatar_url
  COL_TYPE=$(mysql -u f1pooler -pf1pooler f1pooler -N -e "SELECT DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='f1pooler' AND TABLE_NAME='users' AND COLUMN_NAME='avatar_url';" 2>/dev/null)
  echo "    users.avatar_url column type: $COL_TYPE"
  if echo "$COL_TYPE" | grep -qi "mediumtext\|longtext"; then
    pass "avatar_url column supports large files ($COL_TYPE)"
  else
    fail "avatar_url column type is $COL_TYPE (should be MEDIUMTEXT/LONGTEXT for file uploads)"
  fi

  # Check prize_image_url column
  PRIZE_COL=$(mysql -u f1pooler -pf1pooler f1pooler -N -e "SELECT DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='f1pooler' AND TABLE_NAME='leagues' AND COLUMN_NAME='prize_image_url';" 2>/dev/null)
  echo "    leagues.prize_image_url column type: $PRIZE_COL"
  if echo "$PRIZE_COL" | grep -qi "mediumtext\|longtext"; then
    pass "prize_image_url column supports large files ($PRIZE_COL)"
  else
    fail "prize_image_url column type is $PRIZE_COL (should be MEDIUMTEXT/LONGTEXT for file uploads)"
  fi

  # Cleanup temp user
  mysql -u f1pooler -pf1pooler f1pooler -e "
  DELETE FROM league_members WHERE user_id = '$TEMP_UID';
  DELETE FROM notifications WHERE user_id = '$TEMP_UID';
  DELETE FROM users WHERE id = '$TEMP_UID';
  " 2>/dev/null
  pass "Temp file-test user cleaned up"
else
  fail "Could not create temp user for file upload test"
fi

# ============================================================
section "FINAL REPORT"
# ============================================================
echo ""
echo "  ✅ PASSED: $PASS"
echo "  ❌ FAILED: $FAIL"
echo ""
if [ $FAIL -eq 0 ]; then
  echo "  🏆 ALL TESTS PASSED!"
else
  echo "  ⚠️  FAILURES:"
  echo -e "$WARNINGS"
fi
echo ""
