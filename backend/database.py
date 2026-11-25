import sqlite3
import json
import os
from datetime import datetime
from challenges_data import CHALLENGES

DB_PATH = os.path.join(os.path.dirname(__file__), "spider_arena.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
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
        timestamp TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)
    
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

def get_global_unlocked_status() -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM competition_config WHERE key = 'global_challenges_unlocked'")
    row = cursor.fetchone()
    conn.close()
    if row:
        return row["value"] == "1"
    return False

def set_global_unlocked_status(unlocked: bool) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    val = "1" if unlocked else "0"
    cursor.execute("""
        INSERT INTO competition_config (key, value) VALUES ('global_challenges_unlocked', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
    """, (val,))
    conn.commit()
    conn.close()
    return unlocked

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)

