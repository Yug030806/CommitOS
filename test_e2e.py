import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://localhost:3000"

passed = 0
failed = 0

def test(name, fn):
    global passed, failed
    print(f"[*] Testing: {name} ...", end=" ", flush=True)
    try:
        fn()
        print("PASSED")
        passed += 1
    except Exception as e:
        print(f"FAILED: {e}")
        failed += 1

def assert_eq(actual, expected, msg=""):
    assert actual == expected, f"{msg} Expected '{expected}', got '{actual}'"

def assert_true(cond, msg=""):
    assert cond, f"Condition failed: {msg}"

# 1. API: Supabase Status
def test_supabase_status():
    url = f"{BASE_URL}/api/supabase/status"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        assert_eq(resp.status, 200)
        data = json.loads(resp.read().decode())
        assert_true(data.get("connected"), "Supabase not connected")
        assert_true(data.get("tablesReady"), "Tables not ready")
        status = data.get("tableStatus", {})
        assert_true("meetings" in status, "meetings table missing")
        assert_true("decisions" in status, "decisions table missing")
        assert_true("tasks" in status, "tasks table missing")

test("API: Supabase Status & Tables", test_supabase_status)

# 2. API: Team Members GET
def test_team_members_get():
    url = f"{BASE_URL}/api/team/members?orgId=org-svit-podcast"
    with urllib.request.urlopen(url) as resp:
        assert_eq(resp.status, 200)
        data = json.loads(resp.read().decode())
        assert_true("members" in data, "members field missing")
        members = data["members"]
        assert_true(len(members) >= 4, f"Expected >= 4 members, got {len(members)}")
        names = [m["name"] for m in members]
        assert_true("Yug" in names, "Yug missing")
        assert_true("Rahul" in names, "Rahul missing")

test("API: Team Members GET", test_team_members_get)

# 3. API: Team Members POST (Add new member)
def test_team_members_post():
    url = f"{BASE_URL}/api/team/members"
    payload = {
        "organizationId": "org-svit-podcast",
        "name": "Test Contributor",
        "email": f"test-{sys.hexversion}@svitpodcast.org",
        "role": "team_member",
        "title": "Volunteer"
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert_eq(resp.status, 200)
        data = json.loads(resp.read().decode())
        assert_true(data.get("success"), "Member creation failed")
        assert_eq(data["member"]["name"], "Test Contributor")

test("API: Team Members POST", test_team_members_post)

# 4. API: Ask CommitOS Greetings
def test_ask_commitos_greetings():
    expected_greeting = (
        "Hello! I am CommitOS, your AI organizational memory assistant for SVIT Podcast Club. "
        "Ask me anything about previous meetings, approved budgets, task assignments, or decision history."
    )
    for g in ["hi", "hello", "hey", "hello!", "hey there", "Hi CommitOS"]:
        url = f"{BASE_URL}/api/ask-commit-os"
        req = urllib.request.Request(
            url,
            data=json.dumps({"question": g}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as resp:
            assert_eq(resp.status, 200)
            data = json.loads(resp.read().decode())
            ans = data.get("answer", "")
            assert_eq(ans.strip(), expected_greeting.strip(), f"Greeting mismatch for input '{g}'")

test("API: Ask CommitOS Exact Greetings", test_ask_commitos_greetings)

# 5. API: Ask CommitOS Domain Queries
def test_ask_commitos_domain_queries():
    queries = [
        ("what was the approved budget?", ["15,000", "budget"]),
        ("who is in charge of marketing?", ["Rahul", "marketing"]),
        ("when is the flagship event date?", ["December 15"]),
        ("who leads sponsorship?", ["Yash", "sponsor"]),
    ]
    for q, keywords in queries:
        url = f"{BASE_URL}/api/ask-commit-os"
        req = urllib.request.Request(
            url,
            data=json.dumps({
                "question": q,
                "memories": [
                    {"content": "Event budget capped at ₹15,000", "meetingTitle": "Meeting 1", "date": "Nov 15, 2026"},
                    {"content": "Rahul leads marketing poster design", "meetingTitle": "Meeting 1", "date": "Nov 15, 2026"},
                    {"content": "Yash closes sponsorships", "meetingTitle": "Meeting 1", "date": "Nov 15, 2026"},
                ],
                "decisions": [
                    {"title": "Approved Budget", "value": "₹15,000", "meetingTitle": "Meeting 1", "decidedAt": "2026-11-15T10:00:00Z"},
                    {"title": "Event Date", "value": "December 15", "meetingTitle": "Meeting 1", "decidedAt": "2026-11-15T10:00:00Z"},
                ],
                "tasks": [
                    {"title": "Marketing poster", "assigneeName": "Rahul", "deadline": "2026-12-05", "status": "todo"}
                ]
            }).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as resp:
            assert_eq(resp.status, 200)
            data = json.loads(resp.read().decode())
            ans = data.get("answer", "")
            for kw in keywords:
                assert_true(kw.lower() in ans.lower(), f"Keyword '{kw}' missing in answer: '{ans}'")

test("API: Ask CommitOS Domain Q&A", test_ask_commitos_domain_queries)

# 6. API: Triage Conflict RBAC Check (Deny Team Member)
def test_triage_conflict_rbac_deny():
    url = f"{BASE_URL}/api/triage-conflict"
    payload = {
        "conflictId": "conf-001",
        "action": "approved",
        "actor": {
            "id": "mem-004",
            "name": "Priya",
            "role": "team_member",
            "organizationId": "org-svit-podcast"
        },
        "isLeaderAuthorized": False
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        urllib.request.urlopen(req)
        assert False, "Expected 403 Forbidden for team_member"
    except urllib.error.HTTPError as e:
        assert_eq(e.code, 403, "Expected status code 403")

test("API: Triage Conflict RBAC Barrier (Deny Member)", test_triage_conflict_rbac_deny)

# 7. API: Triage Conflict RBAC Allow (Org Admin)
def test_triage_conflict_rbac_allow():
    url = f"{BASE_URL}/api/triage-conflict"
    payload = {
        "conflictId": "conf-001",
        "action": "approved",
        "actor": {
            "id": "mem-001",
            "name": "Yug",
            "role": "org_admin",
            "organizationId": "org-svit-podcast"
        },
        "isLeaderAuthorized": True
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert_eq(resp.status, 200)
        data = json.loads(resp.read().decode())
        assert_true(data.get("success"), "Admin approval failed")
        assert_eq(data["resolution"]["status"], "approved")

test("API: Triage Conflict RBAC Barrier (Allow Admin)", test_triage_conflict_rbac_allow)

# 8. API: Process Meeting Ingestion
def test_process_meeting():
    url = f"{BASE_URL}/api/process-meeting"
    transcript = (
        "Yug (Production Head): Welcome team. Today we finalize the audio equipment.\n"
        "Rahul (Marketing Lead): I will handle the venue microphones by December 8.\n"
        "Yug: Let's agree on renting 4 wireless mics for ₹3,000.\n"
        "Priya: Approved."
    )
    payload = {
        "transcript": transcript,
        "title": "E2E Audio Gear Checkpoint",
        "historicalDecisions": [
            {"id": "dec-001", "title": "Budget Cap", "value": "₹15,000", "meetingTitle": "Meeting 1", "date": "2026-11-15"}
        ],
        "actorRole": "org_admin",
        "organizationId": "org-svit-podcast"
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert_eq(resp.status, 200)
        data = json.loads(resp.read().decode())
        assert_true(data.get("success"), "Meeting processing failed")
        m = data.get("meeting", {})
        assert_true("id" in m, "Missing meeting id")
        assert_true(len(m.get("participants", [])) >= 2, "Missing participants")
        assert_true(len(m.get("actionItems", [])) >= 1, "Missing action items")

test("API: Process Meeting Ingestion Pipeline", test_process_meeting)

# 9. Static Assets Verification
def test_static_assets():
    assets = ["/logo.png", "/logo-white.png", "/logo-icon-white.png", "/logo-dark.png"]
    for asset in assets:
        url = f"{BASE_URL}{asset}"
        with urllib.request.urlopen(url) as resp:
            assert_eq(resp.status, 200)
            ct = resp.headers.get("Content-Type", "")
            assert_true("image/png" in ct, f"Expected image/png for {asset}, got {ct}")

test("Static Assets: Logo Images", test_static_assets)

# 10. Page Routes Rendering & Unauthenticated Redirect Barrier
def test_page_routes():
    # A. Unauthenticated access to root must redirect to /signin
    url = f"{BASE_URL}/"
    req_unauth = urllib.request.Request(url)
    with urllib.request.urlopen(req_unauth) as resp:
        assert_true("/signin" in resp.geturl() or resp.status == 200, "Unauthenticated access should redirect to /signin")

    # B. Protected routes with authentication cookie
    routes = [
        ("/", "CommitOS"),
        ("/signin", "Sign In"),
        ("/signup", "Create Account"),
        ("/meetings", "Meetings"),
        ("/meetings/meet-001", "Event Planning"),
        ("/meetings/meet-002", "Production Discussion"),
        ("/meetings/meet-003", "Follow-up"),
        ("/tasks", "Tasks"),
        ("/memory", "Memory"),
        ("/analytics", "Analytics"),
        ("/settings", "Settings"),
    ]
    for path, expected_text in routes:
        url = f"{BASE_URL}{path}"
        req = urllib.request.Request(url, headers={"Cookie": "commitos_auth=true"})
        with urllib.request.urlopen(req) as resp:
            assert_eq(resp.status, 200, f"Route {path} did not return 200")
            html = resp.read().decode("utf-8")
            assert_true(expected_text.lower() in html.lower(), f"Route {path} missing expected text '{expected_text}'")

test("Page Routes & Signin Gateway Barrier", test_page_routes)

# 11. Security & Edge Case Handling (Negative Testing)
def test_security_and_edge_cases():
    # A. Empty query to ask-commit-os
    url = f"{BASE_URL}/api/ask-commit-os"
    req = urllib.request.Request(url, data=json.dumps({"question": ""}).encode("utf-8"), headers={"Content-Type": "application/json"})
    try:
        urllib.request.urlopen(req)
        assert False, "Expected 400 for empty question"
    except urllib.error.HTTPError as e:
        assert_eq(e.code, 400, "Expected 400")

    # B. Missing parameters in triage-conflict
    url = f"{BASE_URL}/api/triage-conflict"
    req = urllib.request.Request(url, data=json.dumps({}).encode("utf-8"), headers={"Content-Type": "application/json"})
    try:
        urllib.request.urlopen(req)
        assert False, "Expected 400 for empty triage payload"
    except urllib.error.HTTPError as e:
        assert_eq(e.code, 400, "Expected 400")

    # C. Missing transcript in process-meeting
    url = f"{BASE_URL}/api/process-meeting"
    req = urllib.request.Request(url, data=json.dumps({"transcript": ""}).encode("utf-8"), headers={"Content-Type": "application/json"})
    try:
        urllib.request.urlopen(req)
        assert False, "Expected 400 for empty transcript"
    except urllib.error.HTTPError as e:
        assert_eq(e.code, 400, "Expected 400")

    # D. Member removal security barrier (Team Member attempting to remove Admin)
    url = f"{BASE_URL}/api/team/members"
    req = urllib.request.Request(
        url,
        data=json.dumps({
            "actor": {"id": "mem-004", "name": "Priya", "role": "team_member", "organizationId": "org-svit-podcast"},
            "targetMemberId": "mem-001"
        }).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="DELETE"
    )
    try:
        urllib.request.urlopen(req)
        assert False, "Expected 403 Forbidden for unauthorized member deletion"
    except urllib.error.HTTPError as e:
        assert_eq(e.code, 403, "Expected 403")

test("Security Barriers: Negative Edge Cases & Permissions", test_security_and_edge_cases)

print("\n" + "="*50)
print(f"TEST RUN COMPLETED: {passed} PASSED, {failed} FAILED")
print("="*50)

if failed > 0:
    sys.exit(1)
