#!/bin/bash
# Full system test for F1 Poolers via adster.app
set -e
API="http://127.0.0.1:3080/api"
echo "=== F1 Poolers Full System Test ==="

# Test 1: Rounds
echo ""
echo "--- TEST 1: Rounds ---"
ROUNDS=$(curl -s $API/rounds)
RCOUNT=$(echo $ROUNDS | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
echo "Rounds: $RCOUNT"
[ "$RCOUNT" -ge 1 ] && echo "PASS: Rounds loaded" || echo "FAIL: No rounds"

# Test 2: Events
echo ""
echo "--- TEST 2: Events ---"
EVENTS=$(curl -s $API/events)
ECOUNT=$(echo $EVENTS | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
echo "Events: $ECOUNT"
[ "$ECOUNT" -ge 1 ] && echo "PASS: Events loaded" || echo "FAIL: No events"

# Test 3: Drivers
echo ""
echo "--- TEST 3: Drivers ---"
DRIVERS=$(curl -s $API/drivers)
DCOUNT=$(echo $DRIVERS | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
echo "Drivers: $DCOUNT"
[ "$DCOUNT" -ge 20 ] && echo "PASS: Drivers loaded" || echo "FAIL: Insufficient drivers"

# Test 4: Teams
echo ""
echo "--- TEST 4: Teams ---"
TEAMS=$(curl -s $API/teams)
TCOUNT=$(echo $TEAMS | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
echo "Teams: $TCOUNT"
[ "$TCOUNT" -ge 10 ] && echo "PASS: Teams loaded" || echo "FAIL: Insufficient teams"

# Test 5: Signup
echo ""
echo "--- TEST 5: User Signup ---"
SIGNUP=$(curl -s -X POST $API/auth/signup -H "Content-Type: application/json" \
  -d '{"username":"systest1","password":"pass123","age":30,"country":"UK"}')
USERID=$(echo $SIGNUP | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
if [ -n "$USERID" ] && [ "$USERID" != "" ]; then
  echo "PASS: User created: $USERID"
else
  echo "INFO: User may already exist, trying login..."
  LOGIN=$(curl -s -X POST $API/auth/login -H "Content-Type: application/json" \
    -d '{"username":"systest1","password":"pass123"}')
  USERID=$(echo $LOGIN | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
  echo "User ID: $USERID"
fi

# Test 6: Login
echo ""
echo "--- TEST 6: User Login ---"
LOGIN=$(curl -s -X POST $API/auth/login -H "Content-Type: application/json" \
  -d '{"username":"systest1","password":"pass123"}')
BALANCE=$(echo $LOGIN | python3 -c "import sys,json; print(json.load(sys.stdin).get('balance',0))")
echo "Login balance: $BALANCE"
[ "$BALANCE" -ge 0 ] && echo "PASS: Login works" || echo "FAIL: Login failed"

# Get first upcoming event
EVENTID=$(echo $EVENTS | python3 -c "import sys,json; evts=[e for e in json.load(sys.stdin) if e['status']=='Upcoming']; print(evts[0]['id'] if evts else '')")
echo "Using event: $EVENTID"

# Test 7: Place Bet
echo ""
echo "--- TEST 7: Place Bet ---"
if [ -n "$EVENTID" ] && [ -n "$USERID" ]; then
  BETRESULT=$(curl -s -X POST $API/bets -H "Content-Type: application/json" \
    -d "{\"userId\":\"$USERID\",\"eventId\":\"$EVENTID\",\"predictions\":[{\"id\":\"verstappen\"},{\"id\":\"norris\"},{\"id\":\"leclerc\"},{\"id\":\"hamilton\"},{\"id\":\"piastri\"}],\"teamPredictions\":[{\"id\":\"redbull\"},{\"id\":\"mclaren\"},{\"id\":\"ferrari\"},{\"id\":\"ferrari\"},{\"id\":\"mclaren\"}]}")
  NEWBALANCE=$(echo $BETRESULT | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('updatedUser',{}).get('balance','ERROR'))")
  NEWPOOL=$(echo $BETRESULT | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('updatedEvent',{}).get('poolPrize','ERROR'))")
  echo "New balance: $NEWBALANCE, Pool prize: $NEWPOOL"
  [ "$NEWBALANCE" != "ERROR" ] && echo "PASS: Bet placed" || echo "FAIL: Bet failed - $BETRESULT"
else
  echo "SKIP: No event or user"
fi

# Test 8: Verify Bet in DB
echo ""
echo "--- TEST 8: Verify Bet in DB ---"
BETS=$(curl -s "$API/bets?userId=$USERID")
BCOUNT=$(echo $BETS | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
echo "Bets for user: $BCOUNT"
[ "$BCOUNT" -ge 1 ] && echo "PASS: Bet persisted in DB" || echo "FAIL: Bet not in DB"

# Get the bet ID
BETID=$(echo $BETS | python3 -c "import sys,json; b=json.load(sys.stdin); print(b[0]['id'] if b else '')")
echo "Bet ID: $BETID"

# Test 9: Submit Results
echo ""
echo "--- TEST 9: Submit Results ---"
if [ -n "$EVENTID" ]; then
  RESRESULT=$(curl -s -X POST $API/results -H "Content-Type: application/json" \
    -d "{\"eventId\":\"$EVENTID\",\"positions\":[{\"id\":\"verstappen\"},{\"id\":\"norris\"},{\"id\":\"leclerc\"},{\"id\":\"hamilton\"},{\"id\":\"piastri\"}]}")
  WINNERS=$(echo $RESRESULT | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('winners',[])))")
  TOTALPOOL=$(echo $RESRESULT | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('totalPrizePool',0))")
  echo "Winners: $WINNERS, Total pool: $TOTALPOOL"
  [ "$WINNERS" -ge 1 ] && echo "PASS: Results graded, winners found" || echo "FAIL: No winners"
else
  echo "SKIP: No event"
fi

# Test 10: Verify Results in DB
echo ""
echo "--- TEST 10: Verify Results in DB ---"
RESULTS=$(curl -s $API/results)
RESCOUNT=$(echo $RESULTS | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
echo "Results: $RESCOUNT"
[ "$RESCOUNT" -ge 1 ] && echo "PASS: Results persisted in DB" || echo "FAIL: Results not in DB"

# Test 11: Check Prize Distribution
echo ""
echo "--- TEST 11: Check Prize Distribution ---"
USERAFTER=$(curl -s "$API/users/$USERID")
FINBALANCE=$(echo $USERAFTER | python3 -c "import sys,json; print(json.load(sys.stdin).get('balance',0))")
FINPOINTS=$(echo $USERAFTER | python3 -c "import sys,json; print(json.load(sys.stdin).get('points',0))")
echo "Final balance: $FINBALANCE, Points: $FINPOINTS"
[ "$FINPOINTS" -gt 0 ] && echo "PASS: Points awarded" || echo "FAIL: No points"
[ "$FINBALANCE" -ge "$BALANCE" ] && echo "PASS: Prize distributed (balance restored or increased)" || echo "INFO: Balance decreased (no jackpot or partial)"

# Test 12: Verify Bet Settled
echo ""
echo "--- TEST 12: Verify Bet Settled ---"
BETSAFTER=$(curl -s "$API/bets?userId=$USERID")
BETSTATUS=$(echo $BETSAFTER | python3 -c "import sys,json; b=json.load(sys.stdin); print(b[0]['status'] if b else 'NONE')")
echo "Bet status: $BETSTATUS"
[ "$BETSTATUS" = "Settled" ] && echo "PASS: Bet settled" || echo "FAIL: Bet not settled ($BETSTATUS)"

# Test 13: Verify Event Status
echo ""
echo "--- TEST 13: Verify Event Status ---"
EVENTSAFTER=$(curl -s $API/events)
EVSTATUS=$(echo $EVENTSAFTER | python3 -c "import sys,json; evts=json.load(sys.stdin); e=[x for x in evts if x['id']=='$EVENTID']; print(e[0]['status'] if e else 'NONE')")
echo "Event status: $EVSTATUS"
[ "$EVSTATUS" = "Finished" ] && echo "PASS: Event marked Finished" || echo "FAIL: Event not Finished ($EVSTATUS)"

# Test 14: DB integrity check
echo ""
echo "--- TEST 14: DB Integrity ---"
mysql -uf1pooler -pf1pooler f1pooler 2>/dev/null -e "
SELECT 'bets' as tbl, COUNT(*) as cnt FROM bets
UNION ALL SELECT 'bet_predictions', COUNT(*) FROM bet_predictions
UNION ALL SELECT 'bet_team_predictions', COUNT(*) FROM bet_team_predictions
UNION ALL SELECT 'results', COUNT(*) FROM results
UNION ALL SELECT 'result_positions', COUNT(*) FROM result_positions
UNION ALL SELECT 'result_winners', COUNT(*) FROM result_winners
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications;"

echo ""
echo "=== System Test Complete ==="
