import json
import sqlite3
import os
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from database import get_connection, init_db, get_global_unlocked_status, set_global_unlocked_status
from executor import execute_user_code, test_user_solution

app = FastAPI(title="SPIDER-CODE ARENA API", version="2.0.0")

# Enable high-throughput GZip compression for LAN bandwidth efficiency
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Enable CORS for cross-origin LAN clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure database is initialized on startup
@app.on_event("startup")
def startup_event():
    init_db()

# --- Schemas ---

class LoginRequest(BaseModel):
    name: Optional[str] = None
    reg_number: Optional[str] = None
    email: Optional[str] = None
    identifier: Optional[str] = None
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    reg_number: str
    password: str
    avatar: Optional[str] = "classic"

class ExecuteCodeRequest(BaseModel):
    code: str

class SubmitCodeRequest(BaseModel):
    user_id: int
    challenge_id: int
    code: str

class ChallengeUpdate(BaseModel):
    title: Optional[str] = None
    points: Optional[int] = None
    difficulty: Optional[str] = None
    instructions: Optional[str] = None
    starter_code: Optional[str] = None
    solution_code: Optional[str] = None

# --- Helper Functions ---

def mask_reg_number(reg: str) -> str:
    if len(reg) <= 6:
        return reg
    return reg[:4] + "••••" + reg[-4:]

def format_time(seconds: int) -> str:
    mins = seconds // 60
    secs = seconds % 60
    return f"{mins:02d}m {secs:02d}s"

# --- Authentication Endpoints ---

@app.post("/api/auth/login")
def login(req: LoginRequest):
    conn = get_connection()
    cursor = conn.cursor()
    
    password = req.password.strip()
    raw_ident = (req.identifier or req.email or "").strip()
    raw_reg = (req.reg_number or "").strip()
    raw_name = (req.name or "").strip()

    # --- ADMIN CASE-SENSITIVE AUTHENTICATION ---
    # Username: "spiderman" | Password: "pg123" (strictly case sensitive)
    possible_usernames = [raw_name, raw_reg, raw_ident]
    is_admin_attempt = any(u.lower() == "spiderman" for u in possible_usernames if u)
    
    if is_admin_attempt:
        exact_username_match = any(u == "spiderman" for u in possible_usernames)
        exact_password_match = password == "pg123"
        
        if exact_username_match and exact_password_match:
            cursor.execute("SELECT * FROM users WHERE name = 'spiderman' OR reg_number = 'spiderman'")
            admin_user = cursor.fetchone()
            if not admin_user:
                now_iso = datetime.utcnow().isoformat()
                cursor.execute("""
                    INSERT INTO users (name, email, reg_number, password, avatar, points, completed_challenges, time_spent_seconds, role, created_at)
                    VALUES ('spiderman', 'spiderman@spiderverse.edu', 'spiderman', 'pg123', 'symbiote', 1800, '[]', 0, 'admin', ?)
                """, (now_iso,))
                conn.commit()
                admin_id = cursor.lastrowid
            else:
                admin_id = admin_user["id"]
                cursor.execute("UPDATE users SET name = 'spiderman', reg_number = 'spiderman', password = 'pg123', role = 'admin' WHERE id = ?", (admin_id,))
                conn.commit()
                
            cursor.execute("SELECT * FROM users WHERE id = ?", (admin_id,))
            admin_user = cursor.fetchone()
            conn.close()
            
            return {
                "status": "success",
                "user": {
                    "id": admin_user["id"],
                    "name": "spiderman",
                    "email": admin_user["email"],
                    "reg_number": "spiderman",
                    "avatar": "symbiote",
                    "points": admin_user["points"] or 1800,
                    "completed_challenges": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    "time_spent_seconds": admin_user["time_spent_seconds"] or 1200,
                    "role": "admin"
                }
            }
        else:
            conn.close()
            raise HTTPException(status_code=401, detail="Invalid Admin credentials. Username and password are case sensitive.")

    user = None

    # Check 1: Match by reg_number
    if raw_reg:
        cursor.execute("SELECT * FROM users WHERE LOWER(reg_number) = ? AND password = ?", (raw_reg.lower(), password))
        user = cursor.fetchone()

    # Check 2: Match by email
    if not user and raw_ident:
        cursor.execute("SELECT * FROM users WHERE LOWER(email) = ? AND password = ?", (raw_ident.lower(), password))
        user = cursor.fetchone()

    # Check 3: Match by name
    if not user and raw_name:
        cursor.execute("SELECT * FROM users WHERE LOWER(name) = ? AND password = ?", (raw_name.lower(), password))
        user = cursor.fetchone()

    # Check 4: Check if raw_ident matches reg_number or name
    if not user and raw_ident:
        cursor.execute("SELECT * FROM users WHERE (LOWER(reg_number) = ? OR LOWER(name) = ?) AND password = ?", (raw_ident.lower(), raw_ident.lower(), password))
        user = cursor.fetchone()

    # Auto-registration for new students who provide name + reg_number
    if not user and (raw_name or raw_reg) and password:
        disp_name = (req.name or (raw_ident.split('@')[0].replace('.', ' ').title() if '@' in raw_ident else "Spider Cadet")).strip()
        disp_reg = (req.reg_number or ("RA" + str(abs(hash(disp_name)) % 10000000000))).strip()
        disp_email = (req.email or f"{disp_name.lower().replace(' ', '.')}@spiderverse.edu").strip()
        
        cursor.execute("SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(reg_number) = ?", (disp_email.lower(), disp_reg.lower()))
        existing = cursor.fetchone()
        if existing and existing["password"] == password:
            user = existing
        elif not existing:
            now_iso = datetime.utcnow().isoformat()
            cursor.execute("""
                INSERT INTO users (name, email, reg_number, password, avatar, points, completed_challenges, time_spent_seconds, role, created_at)
                VALUES (?, ?, ?, ?, 'classic', 0, '[]', 0, 'student', ?)
            """, (disp_name, disp_email, disp_reg, password, now_iso))
            conn.commit()
            new_id = cursor.lastrowid
            cursor.execute("SELECT * FROM users WHERE id = ?", (new_id,))
            user = cursor.fetchone()

    conn.close()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid Agent credentials or secret passcode.")
        
    completed_list = []
    if user["completed_challenges"]:
        try:
            completed_list = json.loads(user["completed_challenges"]) if isinstance(user["completed_challenges"], str) else user["completed_challenges"]
        except:
            completed_list = []

    return {
        "status": "success",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "reg_number": user["reg_number"],
            "avatar": user["avatar"],
            "points": user["points"],
            "completed_challenges": completed_list,
            "time_spent_seconds": user["time_spent_seconds"],
            "role": user["role"]
        }
    }

@app.post("/api/auth/register")
def register(req: RegisterRequest):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(?)", (req.email.strip(),))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="This email is already deployed to the Spider-Verse.")
        
    cursor.execute("SELECT id FROM users WHERE LOWER(reg_number) = LOWER(?)", (req.reg_number.strip(),))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Registration number is already assigned.")
        
    now = datetime.utcnow().isoformat()
    cursor.execute("""
        INSERT INTO users (name, email, reg_number, password, avatar, points, completed_challenges, time_spent_seconds, role, created_at)
        VALUES (?, ?, ?, ?, ?, 0, '[]', 0, 'student', ?)
    """, (req.name.strip(), req.email.strip(), req.reg_number.strip(), req.password.strip(), req.avatar, now))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    
    return {
        "status": "success",
        "user": {
            "id": new_id,
            "name": req.name.strip(),
            "email": req.email.strip(),
            "reg_number": req.reg_number.strip(),
            "avatar": req.avatar,
            "points": 0,
            "completed_challenges": [],
            "time_spent_seconds": 0,
            "role": "student"
        }
    }

@app.get("/api/auth/verify")
def verify_session(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, role FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return {"valid": False, "reason": "PLAYER_REMOVED", "message": "Player account has been removed by Admin."}
    return {"valid": True, "role": row["role"]}

# --- Competition Global Lock Endpoints ---

@app.get("/api/competition/status")
def get_competition_status():
    unlocked = get_global_unlocked_status()
    return {
        "unlocked": unlocked,
        "status": "UNLOCKED" if unlocked else "LOCKED",
        "message": "All 10 challenges are unlocked and live for competition." if unlocked else "All challenges are currently locked by the Overseer."
    }

@app.post("/api/admin/competition/unlock")
def admin_unlock_all():
    set_global_unlocked_status(True)
    return {
        "status": "success",
        "unlocked": True,
        "message": "All 10 challenges unlocked globally for all participants."
    }

@app.post("/api/admin/competition/lock")
def admin_lock_all():
    set_global_unlocked_status(False)
    return {
        "status": "success",
        "unlocked": False,
        "message": "All 10 challenges locked globally. Existing student scores and progress preserved."
    }

# --- Challenges Endpoints ---

@app.get("/api/challenges")
def list_challenges(user_id: Optional[int] = None):
    global_unlocked = get_global_unlocked_status()
    conn = get_connection()
    cursor = conn.cursor()
    
    completed_ids = []
    if user_id:
        cursor.execute("SELECT id, completed_challenges, role FROM users WHERE id = ?", (user_id,))
        user_row = cursor.fetchone()
        if not user_row:
            conn.close()
            raise HTTPException(status_code=401, detail="PLAYER_REMOVED")
        if user_row and user_row["completed_challenges"]:
            try:
                completed_ids = json.loads(user_row["completed_challenges"]) if isinstance(user_row["completed_challenges"], str) else user_row["completed_challenges"]
            except:
                completed_ids = []
            
    cursor.execute("""
        SELECT id, title, difficulty, points, category, story, description,
               instructions, hints, starter_code, function_name, test_cases
        FROM custom_challenges
        ORDER BY id ASC
    """)
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for r in rows:
        cid = r["id"]
        is_completed = cid in completed_ids
        # When global lock is active, ALL 10 challenges are locked for everybody.
        # When global unlocked is active, challenges are accessible, EXCEPT already completed quests which are locked after receiving the badge!
        is_unlocked = bool(global_unlocked) and not is_completed
        
        raw_hints = json.loads(r["hints"]) if r["hints"] else []
        raw_tests = json.loads(r["test_cases"]) if r["test_cases"] else []
        public_tests = []
        for t in raw_tests:
            if t.get("hidden", False):
                public_tests.append({"input": "SECRET_TEST_CASE", "expected": "HIDDEN", "hidden": True})
            else:
                public_tests.append(t)

        expected_output = public_tests[0]["expected"] if public_tests else "Verified Program Output"
        starter_code = r["starter_code"] or ""

        result.append({
            "id": cid,
            "title": r["title"],
            "difficulty": r["difficulty"],
            "points": r["points"],
            "category": r["category"],
            "story": r["story"],
            "description": r["description"],
            "instructions": r["instructions"],
            "hints": raw_hints,
            "starter_code": starter_code,
            "starterCode": starter_code,
            "function_name": r["function_name"],
            "functionName": r["function_name"],
            "test_cases": public_tests,
            "testCases": public_tests,
            "expectedOutput": expected_output,
            "expected_output": expected_output,
            "is_unlocked": is_unlocked,
            "isUnlocked": is_unlocked,
            "is_completed": is_completed,
            "isCompleted": is_completed
        })
        
    return {
        "challenges": result,
        "completed_count": len(completed_ids),
        "global_unlocked": global_unlocked
    }

@app.get("/api/challenges/{challenge_id}")
def get_challenge(challenge_id: int, user_id: Optional[int] = None):
    global_unlocked = get_global_unlocked_status()
    if not global_unlocked:
        raise HTTPException(status_code=403, detail="Arena is currently LOCKED by Overseer. All challenges are locked.")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM custom_challenges WHERE id = ?", (challenge_id,))
    row = cursor.fetchone()
    
    completed_ids = []
    if user_id:
        cursor.execute("SELECT completed_challenges FROM users WHERE id = ?", (user_id,))
        u = cursor.fetchone()
        if u and u["completed_challenges"]:
            try:
                completed_ids = json.loads(u["completed_challenges"]) if isinstance(u["completed_challenges"], str) else u["completed_challenges"]
            except:
                completed_ids = []
            
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Challenge node not found in Quantum Grid.")
        
    cid = row["id"]
    is_completed = cid in completed_ids
    # Challenge is locked if already completed and badge received
    is_unlocked = bool(global_unlocked) and not is_completed
    
    test_cases = json.loads(row["test_cases"]) if row["test_cases"] else []
    public_tests = []
    for t in test_cases:
        if t.get("hidden", False):
            public_tests.append({"input": "SECRET_TEST_CASE", "expected": "HIDDEN", "hidden": True})
        else:
            public_tests.append(t)

    expected_output = public_tests[0]["expected"] if public_tests else "Verified Program Output"
    starter_code = row["starter_code"] or ""
    raw_hints = json.loads(row["hints"]) if row["hints"] else []
            
    return {
        "id": cid,
        "title": row["title"],
        "difficulty": row["difficulty"],
        "points": row["points"],
        "category": row["category"],
        "story": row["story"],
        "description": row["description"],
        "instructions": row["instructions"],
        "hints": raw_hints,
        "starter_code": starter_code,
        "starterCode": starter_code,
        "function_name": row["function_name"],
        "functionName": row["function_name"],
        "test_cases": public_tests,
        "testCases": public_tests,
        "expectedOutput": expected_output,
        "expected_output": expected_output,
        "is_unlocked": is_unlocked,
        "isUnlocked": is_unlocked,
        "is_completed": is_completed,
        "isCompleted": is_completed
    }

# --- Code Execution & Submission ---

@app.post("/api/execute")
def execute_code(req: ExecuteCodeRequest):
    if not get_global_unlocked_status():
        raise HTTPException(status_code=403, detail="Arena is currently LOCKED by Overseer. Code execution is disabled.")
    res = execute_user_code(req.code)
    return res

@app.post("/api/submit")
def submit_solution(req: SubmitCodeRequest):
    if not get_global_unlocked_status():
        raise HTTPException(status_code=403, detail="Arena is currently LOCKED by Overseer. Submissions are disabled.")

    conn = get_connection()
    cursor = conn.cursor()
    
    # Fetch challenge
    cursor.execute("SELECT * FROM custom_challenges WHERE id = ?", (req.challenge_id,))
    ch = cursor.fetchone()
    if not ch:
        conn.close()
        raise HTTPException(status_code=404, detail="Challenge not found.")
        
    cursor.execute("SELECT * FROM users WHERE id = ?", (req.user_id,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="Student agent not recognized.")

    # Check if challenge is already completed and locked
    raw_completed = user["completed_challenges"]
    try:
        completed_ids = json.loads(raw_completed) if isinstance(raw_completed, str) else (raw_completed or [])
    except:
        completed_ids = []
    if req.challenge_id in completed_ids:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail=f"QUEST #{req.challenge_id} LOCKED: You have already completed this quest and earned its badge. Re-submission is disabled."
        )
        
    test_cases = json.loads(ch["test_cases"])
    function_name = ch["function_name"]
    points = ch["points"]
    
    # Run against test cases
    test_outcome = test_user_solution(req.code, test_cases, function_name)
    
    all_passed = test_outcome.get("all_passed", False)
    passed_count = test_outcome.get("passed_count", 0)
    total_count = test_outcome.get("total_count", len(test_cases))
    
    now_str = datetime.utcnow().isoformat()
    
    # Record submission
    cursor.execute("""
        INSERT INTO submissions (user_id, challenge_id, code, passed, passed_count, total_count, test_results, runtime_ms, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        req.user_id, req.challenge_id, req.code, 1 if all_passed else 0,
        passed_count, total_count, json.dumps(test_outcome.get("results", [])),
        test_outcome.get("runtime_ms", 0.0), now_str
    ))
    
    new_unlocked = None
    points_awarded = 0
    
    if all_passed:
        completed_list = json.loads(user["completed_challenges"])
        if req.challenge_id not in completed_list:
            completed_list.append(req.challenge_id)
            points_awarded = points
            new_total_points = user["points"] + points
            cursor.execute("""
                UPDATE users SET points = ?, completed_challenges = ? WHERE id = ?
            """, (new_total_points, json.dumps(completed_list), req.user_id))
            
            if req.challenge_id < 10:
                new_unlocked = req.challenge_id + 1
                
    conn.commit()
    conn.close()
    
    return {
        "all_passed": all_passed,
        "passed_count": passed_count,
        "total_count": total_count,
        "results": test_outcome.get("results", []),
        "general_error": test_outcome.get("general_error"),
        "stdout": test_outcome.get("stdout", ""),
        "points_awarded": points_awarded,
        "next_unlocked_challenge": new_unlocked,
        "is_all_cleared": (req.challenge_id == 10 and all_passed)
    }

# --- Leaderboard & Profile ---

@app.get("/api/leaderboard")
def get_leaderboard():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, name, reg_number, avatar, points, completed_challenges, time_spent_seconds
        FROM users
        WHERE role = 'student'
        ORDER BY points DESC, time_spent_seconds ASC, id ASC
    """)
    rows = cursor.fetchall()
    conn.close()
    
    leaderboard = []
    for rank, r in enumerate(rows, 1):
        completed = []
        if r["completed_challenges"]:
            try:
                completed = json.loads(r["completed_challenges"]) if isinstance(r["completed_challenges"], str) else r["completed_challenges"]
            except:
                completed = []
        leaderboard.append({
            "rank": rank,
            "id": r["id"],
            "name": r["name"],
            "reg_number": r["reg_number"],
            "masked_reg": mask_reg_number(r["reg_number"]),
            "avatar": r["avatar"],
            "points": r["points"],
            "completed_count": len(completed),
            "completion_time": format_time(r["time_spent_seconds"]),
            "time_seconds": r["time_spent_seconds"]
        })
        
    return {"leaderboard": leaderboard}

@app.get("/api/profile/{user_id}")
def get_profile(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    u = cursor.fetchone()
    if not u:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found.")
        
    completed = json.loads(u["completed_challenges"])
    
    # Calculate rank
    cursor.execute("""
        SELECT COUNT(*) + 1 as rank FROM users
        WHERE role = 'student' AND (points > ? OR (points = ? AND time_spent_seconds < ?))
    """, (u["points"], u["points"], u["time_spent_seconds"]))
    rank_row = cursor.fetchone()
    current_rank = rank_row["rank"] if rank_row else 1
    
    # Fetch recent submissions
    cursor.execute("""
        SELECT s.challenge_id, s.passed, s.passed_count, s.total_count, s.runtime_ms, s.timestamp, c.title, c.difficulty
        FROM submissions s
        JOIN custom_challenges c ON s.challenge_id = c.id
        WHERE s.user_id = ?
        ORDER BY s.id DESC
        LIMIT 10
    """, (user_id,))
    sub_rows = cursor.fetchall()
    conn.close()
    
    history = [
        {
            "challenge_id": s["challenge_id"],
            "title": s["title"],
            "difficulty": s["difficulty"],
            "passed": bool(s["passed"]),
            "score": f"{s['passed_count']}/{s['total_count']}",
            "runtime_ms": s["runtime_ms"],
            "timestamp": s["timestamp"]
        }
        for s in sub_rows
    ]
    
    # Calculate achievements
    achievements = [
        {
            "id": "first_web_slinger",
            "name": "First Web Slinger",
            "desc": "Repaired Challenge 01 (Oscorp Web-Sensors)",
            "unlocked": 1 in completed,
            "icon": "zap"
        },
        {
            "id": "bug_hunter",
            "name": "Bug Hunter",
            "desc": "Conquered at least 3 debugging missions",
            "unlocked": len(completed) >= 3,
            "icon": "shield"
        },
        {
            "id": "syntax_smasher",
            "name": "Syntax Smasher",
            "desc": "Cleared all 4 Beginner sector systems",
            "unlocked": all(i in completed for i in [1, 2, 3, 4]),
            "icon": "code"
        },
        {
            "id": "code_defender",
            "name": "Code Defender",
            "desc": "Completed all 4 Intermediate sector systems",
            "unlocked": all(i in completed for i in [5, 6, 7, 8]),
            "icon": "award"
        },
        {
            "id": "master_debugger",
            "name": "Master Debugger",
            "desc": "Conquered Hard Challenge 09 Nanite Queue",
            "unlocked": 9 in completed,
            "icon": "cpu"
        },
        {
            "id": "spiderverse_champion",
            "name": "Spider-Verse Champion",
            "desc": "Saved the entire Spider-Verse by completing all 10 challenges",
            "unlocked": len(completed) >= 10,
            "icon": "crown"
        }
    ]
    
    # Skill breakdown
    skill_stats = {
        "syntax": 100 if 1 in completed else 0,
        "data_types": 100 if 2 in completed else 0,
        "logic": 100 if 5 in completed else 0,
        "algorithms": 100 if 7 in completed else 0,
        "architecture": 100 if 10 in completed else 0
    }
    
    return {
        "user": {
            "id": u["id"],
            "name": u["name"],
            "email": u["email"],
            "reg_number": u["reg_number"],
            "masked_reg": mask_reg_number(u["reg_number"]),
            "avatar": u["avatar"],
            "points": u["points"],
            "completed_challenges": completed,
            "completed_count": len(completed),
            "rank": current_rank,
            "time_spent": format_time(u["time_spent_seconds"]),
            "time_spent_seconds": u["time_spent_seconds"]
        },
        "achievements": achievements,
        "history": history,
        "skill_stats": skill_stats
    }

# --- Admin Endpoints ---

@app.get("/api/admin/overview")
def admin_overview():
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Total Registered Students
    cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'student'")
    total_registered = cursor.fetchone()["count"]
    
    # 2. Currently Active Students (students with time spent or points)
    cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'student' AND (time_spent_seconds > 0 OR points > 0)")
    active_count = cursor.fetchone()["count"]
    currently_active = max(1, active_count)
    
    # 3. Students Who Started (points > 0 or completed_challenges != '[]')
    cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'student' AND (points > 0 OR (completed_challenges != '[]' AND completed_challenges IS NOT NULL))")
    students_started = cursor.fetchone()["count"]
    
    # Query all registered students
    cursor.execute("""
        SELECT u.id, u.name, u.email, u.reg_number, u.points, u.completed_challenges, u.time_spent_seconds, u.created_at
        FROM users u WHERE u.role = 'student'
        ORDER BY u.points DESC, u.time_spent_seconds ASC, u.id ASC
    """)
    students = []
    students_completed_all = 0
    for s in cursor.fetchall():
        completed = []
        if s["completed_challenges"]:
            try:
                completed = json.loads(s["completed_challenges"]) if isinstance(s["completed_challenges"], str) else s["completed_challenges"]
            except:
                completed = []
                
        if len(completed) >= 10:
            students_completed_all += 1
            account_status = "Completed (10/10)"
        elif len(completed) > 0 or s["points"] > 0:
            account_status = f"In Arena ({len(completed)}/10)"
        else:
            account_status = "Standby (Registered)"
            
        reg_date = s["created_at"] or "2026-11-20"
        try:
            if "T" in reg_date:
                dt = datetime.fromisoformat(reg_date)
                formatted_date = dt.strftime("%b %d, %Y • %I:%M %p")
            else:
                formatted_date = reg_date
        except:
            formatted_date = reg_date
            
        students.append({
            "id": s["id"],
            "name": s["name"],
            "email": s["email"],
            "reg_number": s["reg_number"],
            "registration_date": formatted_date,
            "created_at": formatted_date,
            "account_status": account_status,
            "status": account_status,
            "points": s["points"],
            "completed_count": len(completed),
            "completed_ids": completed,
            "time_spent": format_time(s["time_spent_seconds"]),
            "time_spent_seconds": s["time_spent_seconds"]
        })
        
    cursor.execute("SELECT COUNT(*) as count FROM submissions")
    sub_count = cursor.fetchone()["count"]
    
    cursor.execute("SELECT COUNT(*) as count FROM submissions WHERE passed = 1")
    passed_sub_count = cursor.fetchone()["count"]
    
    conn.close()
    
    global_unlocked = get_global_unlocked_status()
    
    return {
        "total_registered": total_registered,
        "total_participants": total_registered,
        "currently_active": currently_active,
        "students_started": students_started,
        "students_completed_all": students_completed_all,
        "global_unlocked": global_unlocked,
        "total_submissions": sub_count,
        "pass_rate": round((passed_sub_count / max(1, sub_count)) * 100, 1),
        "students": students
    }

@app.post("/api/admin/students/{user_id}/reset")
def reset_student_progress(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE users SET points = 0, completed_challenges = '[]', time_spent_seconds = 0
        WHERE id = ?
    """, (user_id,))
    cursor.execute("DELETE FROM submissions WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Student ID {user_id} progress wiped and reset."}

@app.delete("/api/admin/students/{user_id}")
@app.post("/api/admin/students/{user_id}/delete")
def remove_student(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM submissions WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM users WHERE id = ? AND role = 'student'", (user_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Player ID {user_id} has been permanently removed by Overseer."}

@app.post("/api/admin/students/reset-all")
def reset_all_students():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM submissions WHERE user_id IN (SELECT id FROM users WHERE role = 'student')")
    cursor.execute("DELETE FROM users WHERE role = 'student'")
    conn.commit()
    conn.close()
    return {"status": "success", "message": "All registered players have been removed from the arena."}

@app.put("/api/admin/challenges/{challenge_id}")
def update_challenge(challenge_id: int, upd: ChallengeUpdate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM custom_challenges WHERE id = ?", (challenge_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Challenge not found.")
        
    fields = []
    values = []
    for k, v in upd.dict(exclude_unset=True).items():
        fields.append(f"{k} = ?")
        values.append(v)
    if fields:
        values.append(challenge_id)
        cursor.execute(f"UPDATE custom_challenges SET {', '.join(fields)} WHERE id = ?", values)
        conn.commit()
    conn.close()
    return {"status": "success", "message": "Challenge updated successfully."}

# --- Production Static File Serving & SPA Fallback for LAN Clients ---
DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    badges_dir = os.path.join(DIST_DIR, "badges")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
    if os.path.exists(badges_dir):
        app.mount("/badges", StaticFiles(directory=badges_dir), name="badges")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        target = os.path.join(DIST_DIR, full_path)
        if full_path and os.path.exists(target) and os.path.isfile(target):
            return FileResponse(target)
        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend production build not found. Please run 'npm run build'.")


