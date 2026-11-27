import sqlite3
import json
import os
import time
from datetime import datetime
from challenges_data import CHALLENGES

DB_PATH = os.path.join(os.path.dirname(__file__), "spider_arena.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH, timeout=25.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA busy_timeout = 25000")
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Enable Write-Ahead Logging (WAL) for high concurrency (infinite concurrent readers)
    cursor.execute("PRAGMA journal_mode = WAL")
    cursor.execute("PRAGMA synchronous = NORMAL")
    cursor.execute("PRAGMA cache_size = -32000")
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        reg_number TEXT NOT NULL,
        password TEXT NOT NULL,
        avatar TEXT DEFAULT 'spiderman-classic',
        points INTEGER DEFAULT 0,
        completed_challenges TEXT DEFAULT '[]',
        time_spent_seconds INTEGER DEFAULT 0,
        role TEXT DEFAULT 'student',
        created_at TEXT NOT NULL
    )
    """)
    
    # Submissions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        challenge_id INTEGER NOT NULL,
        code TEXT NOT NULL,
        passed INTEGER NOT NULL,
        passed_count INTEGER NOT NULL,
        total_count INTEGER NOT NULL,
        test_results TEXT NOT NULL,
        runtime_ms REAL DEFAULT 0.0,
        hints_used INTEGER DEFAULT 0,
        timestamp TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)
    
    try:
        cursor.execute("ALTER TABLE submissions ADD COLUMN hints_used INTEGER DEFAULT 0")
    except sqlite3.OperationalError:
        pass
    
    # High concurrency indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_role_points ON users(role, points DESC, time_spent_seconds ASC)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_reg ON users(reg_number)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_submissions_challenge_id ON submissions(challenge_id)")
    
    # Challenges custom overrides/additions table (for admin editing)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS custom_challenges (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        points INTEGER NOT NULL,
        category TEXT NOT NULL,
        story TEXT NOT NULL,
        description TEXT NOT NULL,
        instructions TEXT NOT NULL,
        hints TEXT NOT NULL,
        starter_code TEXT NOT NULL,
        solution_code TEXT NOT NULL,
        test_cases TEXT NOT NULL,
        function_name TEXT NOT NULL
    )
    """)
    
    # System / Competition settings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS competition_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
    """)

    # Default: global_challenges_unlocked = '0' (locked until admin unlocks)
    cursor.execute("SELECT value FROM competition_config WHERE key = 'global_challenges_unlocked'")
    if not cursor.fetchone():
        cursor.execute("INSERT INTO competition_config (key, value) VALUES ('global_challenges_unlocked', '0')")

    # Seed / Update default challenges
    for ch in CHALLENGES:
        cursor.execute("""
        INSERT OR REPLACE INTO custom_challenges (
            id, title, difficulty, points, category, story, description,
            instructions, hints, starter_code, solution_code, test_cases, function_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            ch["id"], ch["title"], ch["difficulty"], ch["points"], ch["category"],
            ch["story"], ch["description"], ch["instructions"],
            json.dumps(ch["hints"]), ch["starter_code"], ch["solution_code"],
            json.dumps(ch["test_cases"]), ch["function_name"]
        ))
            
    # Seed mock students and admin
    seed_users = [
        {
            "name": "Miles Morales",
            "email": "miles.morales@spiderverse.edu",
            "reg_number": "RA2111003010255",
            "password": "spiderpass",
            "avatar": "miles",
            "points": 1800,
            "completed_challenges": json.dumps([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
            "time_spent_seconds": 2340, # ~39 mins
            "role": "student"
        },
        {
            "name": "Gwen Stacy",
            "email": "gwen.stacy@spiderverse.edu",
            "reg_number": "RA2111003010389",
            "password": "spiderpass",
            "avatar": "gwen",
            "points": 1500,
            "completed_challenges": json.dumps([1, 2, 3, 4, 5, 6, 7, 8, 9]),
            "time_spent_seconds": 3120,
            "role": "student"
        },
        {
            "name": "Miguel O'Hara",
            "email": "miguel.ohara@spiderverse.edu",
            "reg_number": "RA2111003010411",
            "password": "spiderpass",
            "avatar": "spider-2099",
            "points": 1200,
            "completed_challenges": json.dumps([1, 2, 3, 4, 5, 6, 7, 8]),
            "time_spent_seconds": 3890,
            "role": "student"
        },
        {
            "name": "Pavitr Prabhakar",
            "email": "pavitr.p@spiderverse.edu",
            "reg_number": "RA2111003010530",
            "password": "spiderpass",
            "avatar": "spider-india",
            "points": 800,
            "completed_challenges": json.dumps([1, 2, 3, 4, 5, 6]),
            "time_spent_seconds": 2800,
            "role": "student"
        },
        {
            "name": "Hobie Brown",
            "email": "hobie.punk@spiderverse.edu",
            "reg_number": "RA2111003010672",
            "password": "spiderpass",
            "avatar": "spider-punk",
            "points": 600,
            "completed_challenges": json.dumps([1, 2, 3, 4, 5]),
            "time_spent_seconds": 1950,
            "role": "student"
        },
        {
            "name": "Peni Parker",
            "email": "peni.spdr@spiderverse.edu",
            "reg_number": "RA2111003010788",
            "password": "spiderpass",
            "avatar": "peni",
            "points": 400,
            "completed_challenges": json.dumps([1, 2, 3, 4]),
            "time_spent_seconds": 1420,
            "role": "student"
        },
        {
            "name": "Peter Parker",
            "email": "peter.parker@spiderverse.edu",
            "reg_number": "RA2111003010142",
            "password": "spiderpass",
            "avatar": "classic",
            "points": 100,
            "completed_challenges": json.dumps([1]),
            "time_spent_seconds": 340,
            "role": "student"
        },
        {
            "name": "spiderman",
            "email": "spiderman@spiderverse.edu",
            "reg_number": "spiderman",
            "password": "pg123",
            "avatar": "symbiote",
            "points": 1800,
            "completed_challenges": json.dumps([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
            "time_spent_seconds": 1200,
            "role": "admin"
        }
    ]
    
    now_str = datetime.utcnow().isoformat()
    for u in seed_users:
        cursor.execute("SELECT id FROM users WHERE email = ?", (u["email"],))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO users (name, email, reg_number, password, avatar, points, completed_challenges, time_spent_seconds, role, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                u["name"], u["email"], u["reg_number"], u["password"],
                u["avatar"], u["points"], u["completed_challenges"],
                u["time_spent_seconds"], u["role"], now_str
            ))
            
    conn.commit()
    conn.close()

_cached_global_unlocked = None
_cached_start_timestamp = None
_cached_accumulated_elapsed = None

def get_competition_time_info():
    global _cached_global_unlocked, _cached_start_timestamp, _cached_accumulated_elapsed
    if _cached_global_unlocked is not None and _cached_start_timestamp is not None and _cached_accumulated_elapsed is not None:
        unlocked = _cached_global_unlocked
        start_ts = _cached_start_timestamp
        accumulated = _cached_accumulated_elapsed
    else:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT key, value FROM competition_config WHERE key IN ('global_challenges_unlocked', 'competition_start_time', 'competition_elapsed_seconds')")
        rows = {r["key"]: r["value"] for r in cursor.fetchall()}
        conn.close()
        unlocked = (rows.get("global_challenges_unlocked") == "1")
        _cached_global_unlocked = unlocked
        try:
            start_val = rows.get("competition_start_time")
            start_ts = float(start_val) if start_val and start_val != '0' else 0.0
        except Exception:
            start_ts = 0.0
        _cached_start_timestamp = start_ts
        try:
            acc_val = rows.get("competition_elapsed_seconds")
            accumulated = int(float(acc_val)) if acc_val else 0
        except Exception:
            accumulated = 0
        _cached_accumulated_elapsed = accumulated

    if unlocked and start_ts > 0:
        session_elapsed = max(0, int(time.time() - start_ts))
        elapsed = accumulated + session_elapsed
    else:
        # Frozen at accumulated time when locked
        elapsed = accumulated

    return unlocked, start_ts, elapsed

def get_global_unlocked_status() -> bool:
    unlocked, _, _ = get_competition_time_info()
    return unlocked

def set_global_unlocked_status(unlocked: bool) -> bool:
    global _cached_global_unlocked, _cached_start_timestamp, _cached_accumulated_elapsed
    prev_unlocked, prev_start_ts, prev_elapsed = get_competition_time_info()

    if unlocked == prev_unlocked:
        return unlocked

    conn = get_connection()
    cursor = conn.cursor()

    if unlocked:
        # Resume or start ticking from current accumulated elapsed!
        now = time.time()
        cursor.execute("""
            INSERT INTO competition_config (key, value) VALUES ('global_challenges_unlocked', '1')
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        """)
        cursor.execute("""
            INSERT INTO competition_config (key, value) VALUES ('competition_start_time', ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        """, (str(now),))
        conn.commit()
        conn.close()
        _cached_global_unlocked = True
        _cached_start_timestamp = now
    else:
        # Freeze at current elapsed moment!
        new_accumulated = prev_elapsed
        cursor.execute("""
            INSERT INTO competition_config (key, value) VALUES ('global_challenges_unlocked', '0')
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        """)
        cursor.execute("""
            INSERT INTO competition_config (key, value) VALUES ('competition_start_time', '0')
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        """)
        cursor.execute("""
            INSERT INTO competition_config (key, value) VALUES ('competition_elapsed_seconds', ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        """, (str(new_accumulated),))
        conn.commit()
        conn.close()
        _cached_global_unlocked = False
        _cached_start_timestamp = 0.0
        _cached_accumulated_elapsed = new_accumulated

    return unlocked

def reset_competition_timer():
    global _cached_global_unlocked, _cached_start_timestamp, _cached_accumulated_elapsed
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM competition_config WHERE key = 'global_challenges_unlocked'")
    row = cursor.fetchone()
    unlocked = (row["value"] == "1") if row else False

    start_val = str(time.time()) if unlocked else "0"
    start_ts = float(start_val)

    cursor.execute("""
        INSERT INTO competition_config (key, value) VALUES ('competition_elapsed_seconds', '0')
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
    """)
    cursor.execute("""
        INSERT INTO competition_config (key, value) VALUES ('competition_start_time', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
    """, (start_val,))

    conn.commit()
    conn.close()

    _cached_global_unlocked = unlocked
    _cached_start_timestamp = start_ts
    _cached_accumulated_elapsed = 0

    return unlocked, start_ts, 0

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)

