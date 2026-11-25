"""
SPIDER-CODE: THE ULTIMATE DEBUGGING ARENA
Challenge Data Specifications & Test Cases
"""

CHALLENGES = [
    {
        "id": 1,
        "title": "The Broken Calculator",
        "difficulty": "Beginner",
        "points": 100,
        "category": "Syntax",
        "story": "The Oscorp Tower Web-Sensors are dropping connection packets due to syntax corruption in the telemetry logger. Patch the malformed Python statements before the network goes completely dark!",
        "description": "Fix the syntax errors in the `calculate_web_fluid_pressure` function. The code fails to compile due to missing colons, unbalanced parentheses, and an invalid keyword.",
        "instructions": (
            "1. Inspect the function `calculate_web_fluid_pressure(nozzle_diameter, fluid_density)`.\n"
            "2. Fix syntax errors: ensure colons are present on conditional/def statements, correct variable spelling, and balanced parentheses.\n"
            "3. The function must return `round(pressure, 2)` where `pressure = (fluid_density * 9.81) / (nozzle_diameter ** 2)` if nozzle_diameter > 0, else 0.0."
        ),
        "hints": [
            "Check for missing colons `:` after the function signature and the `if` statement.",
            "Make sure parentheses are properly paired in the mathematical calculation.",
            "Check if `elif` or `else` is used correctly."
        ],
        "starter_code": (
            "# Oscorp Web-Sensor Diagnostic Subroutine\n"
            "# BUG ALERT: Multiple syntax errors prevent compilation\n\n"
            "def calculate_web_fluid_pressure(nozzle_diameter, fluid_density)\n"
            "    if nozzle_diameter <= 0\n"
            "        return 0.0\n"
            "    esle:\n"
            "        pressure = (fluid_density * 9.81) / (nozzle_diameter ** 2\n"
            "        return round(pressure, 2)\n"
        ),
        "solution_code": (
            "def calculate_web_fluid_pressure(nozzle_diameter, fluid_density):\n"
            "    if nozzle_diameter <= 0:\n"
            "        return 0.0\n"
            "    else:\n"
            "        pressure = (fluid_density * 9.81) / (nozzle_diameter ** 2)\n"
            "        return round(pressure, 2)\n"
        ),
        "test_cases": [
            {"input": "(2.0, 1000.0)", "expected": "2452.5", "hidden": False},
            {"input": "(1.5, 850.0)", "expected": "3706.0", "hidden": False},
            {"input": "(0.0, 500.0)", "expected": "0.0", "hidden": False},
            {"input": "(0.8, 1200.0)", "expected": "18393.75", "hidden": True}
        ],
        "function_name": "calculate_web_fluid_pressure"
    },
    {
        "id": 2,
        "title": "Variable Identity Crisis",
        "difficulty": "Beginner",
        "points": 100,
        "category": "Data Types",
        "story": "Peter's Stark Suit HUD is malfunctioning! It receives incoming velocity and elevation telemetry as strings from the satellite, causing catastrophic TypeError crashes when computing trajectory metrics.",
        "description": "Fix the type conversion and variable scoping bugs in `calculate_suit_trajectory`. Telemetry inputs might arrive as strings, and the calculation must safely convert and format the final output.",
        "instructions": (
            "1. In `calculate_suit_trajectory(altitude_str, velocity_str, boost_str)`:\n"
            "2. Convert `altitude_str` and `velocity_str` from string to float.\n"
            "3. Convert `boost_str` from string/bool to boolean (e.g. 'true' or True).\n"
            "4. Calculate `impact_metric = (altitude * 0.4) + (velocity * 1.5) + (50.0 if boost else 0.0)`.\n"
            "5. Return the formatted string: 'TRAJECTORY: <impact_metric>' with impact_metric rounded to 1 decimal place."
        ),
        "hints": [
            "Strings cannot be directly multiplied with floating point weights without converting via `float()`.",
            "Check how boolean `boost_str` is handled; string 'True' or boolean True should both trigger the boost bonus.",
            "Use formatted f-string: `f'TRAJECTORY: {impact_metric:.1f}'`."
        ],
        "starter_code": (
            "# Stark Suit HUD Trajectory Engine\n"
            "# BUG ALERT: Incompatible type concatenation and incorrect scoping\n\n"
            "def calculate_suit_trajectory(altitude_str, velocity_str, boost_str):\n"
            "    # Telemetry comes in as raw strings\n"
            "    altitude = altitude_str\n"
            "    velocity = velocity_str\n"
            "    \n"
            "    # Bug: Adding string and float causes TypeError\n"
            "    boost = True if boost_str == 'True' or boost_str is True else False\n"
            "    impact_metric = (altitude * 0.4) + (velocity * 1.5) + (50.0 if boost else 0.0)\n"
            "    \n"
            "    # Bug: String + float concatenation\n"
            "    return 'TRAJECTORY: ' + impact_metric\n"
        ),
        "solution_code": (
            "def calculate_suit_trajectory(altitude_str, velocity_str, boost_str):\n"
            "    altitude = float(altitude_str)\n"
            "    velocity = float(velocity_str)\n"
            "    boost = True if str(boost_str).lower() == 'true' or boost_str is True else False\n"
            "    impact_metric = (altitude * 0.4) + (velocity * 1.5) + (50.0 if boost else 0.0)\n"
            "    return f'TRAJECTORY: {impact_metric:.1f}'\n"
        ),
        "test_cases": [
            {"input": "('100.0', '40.0', 'True')", "expected": "'TRAJECTORY: 150.0'", "hidden": False},
            {"input": "('250.5', '10.2', 'False')", "expected": "'TRAJECTORY: 115.5'", "hidden": False},
            {"input": "('0.0', '0.0', 'true')", "expected": "'TRAJECTORY: 50.0'", "hidden": False},
            {"input": "('500.0', '80.0', True)", "expected": "'TRAJECTORY: 370.0'", "hidden": True}
        ],
        "function_name": "calculate_suit_trajectory"
    },
    {
        "id": 3,
        "title": "The Infinite Web Loop",
        "difficulty": "Beginner",
        "points": 100,
        "category": "Loops & Conditionals",
        "story": "Miles Morales is monitoring bio-electric venom strike surges across Queens power substations. The monitoring loop hangs in an infinite loop and misclassifies danger zones!",
        "description": "Fix the loop condition and logic in `detect_danger_zones(readings, threshold)`. The function should iterate through readings, ignore negative anomalies, and return indices of substations exceeding the threshold.",
        "instructions": (
            "1. Iterate through the `readings` list.\n"
            "2. If a reading is negative (sensor glitch), skip it (do not count or include).\n"
            "3. If a reading strictly exceeds `threshold`, add its index (0-based) to the alert list.\n"
            "4. Return the list of dangerous substation indices."
        ),
        "hints": [
            "Be careful with while loop index increments to avoid infinite looping.",
            "Prefer a `for index, val in enumerate(readings):` loop for clean iteration.",
            "Only add index when `val > threshold`, and skip `val < 0`."
        ],
        "starter_code": (
            "# Queens Power Grid Venom Charge Monitor\n"
            "# BUG ALERT: Loop variable never increments properly and condition is reversed\n\n"
            "def detect_danger_zones(readings, threshold):\n"
            "    danger_indices = []\n"
            "    i = 0\n"
            "    while i < len(readings):\n"
            "        val = readings[i]\n"
            "        if val < 0:\n"
            "            # Bug: Forgot to increment i before skipping, causing infinite loop!\n"
            "            continue\n"
            "        if val <= threshold: # Bug: Should be strictly greater than threshold\n"
            "            danger_indices.append(i)\n"
            "        i += 1\n"
            "    return danger_indices\n"
        ),
        "solution_code": (
            "def detect_danger_zones(readings, threshold):\n"
            "    danger_indices = []\n"
            "    for i, val in enumerate(readings):\n"
            "        if val < 0:\n"
            "            continue\n"
            "        if val > threshold:\n"
            "            danger_indices.append(i)\n"
            "    return danger_indices\n"
        ),
        "test_cases": [
            {"input": "([45, 120, -5, 88, 150, 60], 100)", "expected": "[1, 4]", "hidden": False},
            {"input": "([10, 20, 30], 50)", "expected": "[]", "hidden": False},
            {"input": "([-10, -20, 95, 105], 90)", "expected": "[2, 3]", "hidden": False},
            {"input": "([200, -1, 300, 100, 500], 150)", "expected": "[0, 2, 4]", "hidden": True}
        ],
        "function_name": "detect_danger_zones"
    },
    {
        "id": 4,
        "title": "The Scrambled Message",
        "difficulty": "Beginner",
        "points": 100,
        "category": "Strings",
        "story": "Spider-Gwen has intercepted encrypted distress beacons from Earth-65. The beacon strings have garbled noise characters, mixed case, and reverse encoding. We must decode the true beacon callsign!",
        "description": "Implement the decoding pipeline in `decode_spider_beacon(raw_signal)`. The function must remove non-alphanumeric noise, convert to uppercase, and check if the core code is a palindrome security key.",
        "instructions": (
            "1. Remove all characters that are not alphanumeric (keep letters and digits only).\n"
            "2. Convert all letters to uppercase.\n"
            "3. If the resulting cleaned string is a palindrome (reads identical forwards and backwards) and has length >= 3, return `f'VERIFIED:{cleaned}'`.\n"
            "4. Otherwise, return `f'STANDARD:{cleaned[::-1]}'` (the reverse of the cleaned string)."
        ),
        "hints": [
            "Use `char.isalnum()` to filter valid characters.",
            "To reverse a string in Python, use slicing syntax `s[::-1]`.",
            "Compare `cleaned == cleaned[::-1]` and `len(cleaned) >= 3` for verification."
        ],
        "starter_code": (
            "# Earth-65 Inter-dimensional Beacon Decoder\n"
            "# BUG ALERT: Broken slicing, case sensitivity issues, and incorrect filtering\n\n"
            "def decode_spider_beacon(raw_signal):\n"
            "    # Bug: Replaces only specific punctuation instead of all non-alphanumerics\n"
            "    cleaned = raw_signal.replace('#', '').replace('$', '')\n"
            "    \n"
            "    # Bug: Forgets uppercase transformation\n"
            "    # Bug: Slice index off-by-one for palindrome test\n"
            "    is_palindrome = cleaned == cleaned[0:len(cleaned)]\n"
            "    \n"
            "    if is_palindrome and len(cleaned) >= 3:\n"
            "        return 'VERIFIED:' + cleaned\n"
            "    else:\n"
            "        # Bug: Doesn't reverse string properly\n"
            "        return 'STANDARD:' + cleaned\n"
        ),
        "solution_code": (
            "def decode_spider_beacon(raw_signal):\n"
            "    cleaned = ''.join(c.upper() for c in raw_signal if c.isalnum())\n"
            "    is_palindrome = cleaned == cleaned[::-1] and len(cleaned) >= 3\n"
            "    if is_palindrome:\n"
            "        return f'VERIFIED:{cleaned}'\n"
            "    else:\n"
            "        return f'STANDARD:{cleaned[::-1]}'\n"
        ),
        "test_cases": [
            {"input": "('R#a!d$a%r')", "expected": "'VERIFIED:RADAR'", "hidden": False},
            {"input": "('Spider-Man!')", "expected": "'STANDARD:NAMREDIPS'", "hidden": False},
            {"input": "('A1-b-1a')", "expected": "'VERIFIED:A1B1A'", "hidden": False},
            {"input": "('!k@a#y$a%k^')", "expected": "'VERIFIED:KAYAK'", "hidden": True}
        ],
        "function_name": "decode_spider_beacon"
    },
    {
        "id": 5,
        "title": "The Logic Trap",
        "difficulty": "Intermediate",
        "points": 200,
        "category": "Logic & Algorithms",
        "story": "Electro has destabilized the Manhattan power grid harmonic frequencies. Spider-Man needs to identify the 'Harmonic Primes' - prime harmonic frequencies within a power band - to short-circuit Electro's generator.",
        "description": "Fix the prime identification and prime range generator logic in `find_harmonic_primes(start, end)`. The existing code misidentifies 0, 1, and composite numbers as primes, and misses the boundary conditions.",
        "instructions": (
            "1. Given `start` and `end` integers (inclusive):\n"
            "2. Identify all prime numbers in the range `[max(2, start), end]`.\n"
            "3. Remember: 0 and 1 are NEVER prime numbers.\n"
            "4. 2 is prime. Any even number > 2 is not prime.\n"
            "5. Return a sorted list of all prime integers in that range. If start > end, return `[]`."
        ),
        "hints": [
            "Check the loop limit in prime checking: test divisors up to `int(n ** 0.5) + 1`.",
            "Make sure 1 and negatives are handled: primes must be integers strictly greater than 1.",
            "Make sure the range includes `end`: `range(start, end + 1)`."
        ],
        "starter_code": (
            "# Oscorp Grid Frequency Filter\n"
            "# BUG ALERT: Flawed primality testing logic and range omission\n\n"
            "def is_prime(n):\n"
            "    # Bug: Considers 1 and negative numbers as prime\n"
            "    if n <= 0:\n"
            "        return False\n"
            "    if n == 1:\n"
            "        return True  # ERROR: 1 is NOT prime!\n"
            "    for i in range(2, n): # Inefficient and logic error\n"
            "        if n % i == 0:\n"
            "            return False\n"
            "    return True\n\n"
            "def find_harmonic_primes(start, end):\n"
            "    primes = []\n"
            "    # Bug: range(start, end) excludes end!\n"
            "    for num in range(start, end):\n"
            "        if is_prime(num):\n"
            "            primes.append(num)\n"
            "    return primes\n"
        ),
        "solution_code": (
            "def is_prime(n):\n"
            "    if n < 2:\n"
            "        return False\n"
            "    if n == 2:\n"
            "        return True\n"
            "    if n % 2 == 0:\n"
            "        return False\n"
            "    for i in range(3, int(n**0.5) + 1, 2):\n"
            "        if n % i == 0:\n"
            "            return False\n"
            "    return True\n\n"
            "def find_harmonic_primes(start, end):\n"
            "    if start > end:\n"
            "        return []\n"
            "    primes = []\n"
            "    for num in range(start, end + 1):\n"
            "        if is_prime(num):\n"
            "            primes.append(num)\n"
            "    return primes\n"
        ),
        "test_cases": [
            {"input": "(1, 10)", "expected": "[2, 3, 5, 7]", "hidden": False},
            {"input": "(10, 20)", "expected": "[11, 13, 17, 19]", "hidden": False},
            {"input": "(24, 28)", "expected": "[]", "hidden": False},
            {"input": "(50, 70)", "expected": "[53, 59, 61, 67]", "hidden": True}
        ],
        "function_name": "find_harmonic_primes"
    },
    {
        "id": 6,
        "title": "The Lost Web Database",
        "difficulty": "Intermediate",
        "points": 200,
        "category": "Collections",
        "story": "The Daily Bugle database has been hacked by the Green Goblin! The villain incident inventory report is throwing KeyError exceptions and mutating dictionary keys during iteration.",
        "description": "Fix `aggregate_villain_threats(incidents)`. The function receives a list of incident dicts and must safely aggregate total threat levels per villain, filter villains whose threat exceeds a critical score, and sort them descending by threat.",
        "instructions": (
            "1. Each incident in `incidents` is a dict with keys: `'villain'` (str), `'threat'` (int), and optionally `'district'` (str).\n"
            "2. Aggregate total threat per villain (sum of all their incident threat scores).\n"
            "3. If a record is missing the `'threat'` key, default its threat value to 0 instead of crashing.\n"
            "4. Return a sorted list of tuples `(villain, total_threat)` ordered from highest threat to lowest. If threats are equal, sort alphabetically by villain name."
        ),
        "hints": [
            "Use `incident.get('threat', 0)` to avoid `KeyError` when threat key is missing.",
            "Use `collections.defaultdict(int)` or standard dictionary `.get(v, 0)` for summing.",
            "To sort by threat descending then name ascending: `sorted(threat_map.items(), key=lambda x: (-x[1], x[0]))`."
        ],
        "starter_code": (
            "# Daily Bugle Criminal Threat Indexer\n"
            "# BUG ALERT: KeyError on missing fields, mutating dict during loop, bad sorting\n\n"
            "def aggregate_villain_threats(incidents):\n"
            "    summary = {}\n"
            "    for record in incidents:\n"
            "        name = record['villain']\n"
            "        # Bug: Direct access throws KeyError if 'threat' is missing\n"
            "        threat = record['threat']\n"
            "        summary[name] = summary[name] + threat  # Bug: KeyError on initial encounter!\n"
            "        \n"
            "    # Bug: Sorted only ascending and without tuple representation\n"
            "    return sorted(summary.items())\n"
        ),
        "solution_code": (
            "def aggregate_villain_threats(incidents):\n"
            "    summary = {}\n"
            "    for record in incidents:\n"
            "        name = record.get('villain', 'Unknown')\n"
            "        threat = record.get('threat', 0)\n"
            "        summary[name] = summary.get(name, 0) + threat\n"
            "    # Sort descending by threat (-x[1]), then ascending by name (x[0])\n"
            "    return sorted(summary.items(), key=lambda x: (-x[1], x[0]))\n"
        ),
        "test_cases": [
            {
                "input": "([{'villain': 'Doc Ock', 'threat': 80}, {'villain': 'Venom', 'threat': 95}, {'villain': 'Doc Ock', 'threat': 40}],)",
                "expected": "[('Doc Ock', 120), ('Venom', 95)]",
                "hidden": False
            },
            {
                "input": "([{'villain': 'Rhino', 'threat': 50}, {'villain': 'Vulture'}, {'villain': 'Rhino', 'threat': 25}],)",
                "expected": "[('Rhino', 75), ('Vulture', 0)]",
                "hidden": False
            },
            {
                "input": "([{'villain': 'Green Goblin', 'threat': 100}, {'villain': 'Carnage', 'threat': 100}],)",
                "expected": "[('Carnage', 100), ('Green Goblin', 100)]",
                "hidden": False
            },
            {
                "input": "([],)",
                "expected": "[]",
                "hidden": True
            }
        ],
        "function_name": "aggregate_villain_threats"
    },
    {
        "id": 7,
        "title": "The Function Failure",
        "difficulty": "Intermediate",
        "points": 200,
        "category": "Recursion",
        "story": "Miguel O'Hara (Spider-Man 2099) needs to compute the dimensional warp decay sequence for the Multiverse Portal Generator. The recursive calculation triggers RecursionError (Maximum recursion depth exceeded) and fails to memoize branches!",
        "description": "Fix the recursive algorithm `calculate_warp_energy(dimension_level, memo=None)`. Implement correct base cases and dictionary memoization to prevent stack overflow and exponential slowdown.",
        "instructions": (
            "1. Given `dimension_level` (an integer >= 0):\n"
            "2. If `dimension_level == 0`, energy is 1.\n"
            "3. If `dimension_level == 1`, energy is 2.\n"
            "4. For `n >= 2`, `energy(n) = energy(n - 1) + 2 * energy(n - 2)`.\n"
            "5. If `dimension_level < 0`, return 0.\n"
            "6. Must support large values (e.g. n = 35) without exceeding recursion depth or timing out. Use memoization!"
        ),
        "hints": [
            "Always initialize default mutable arguments with `None`: `def calculate_warp_energy(n, memo=None): if memo is None: memo = {}`.",
            "Verify base cases: `if n < 0: return 0`, `if n == 0: return 1`, `if n == 1: return 2`.",
            "Store computed results in `memo[n]` before returning!"
        ],
        "starter_code": (
            "# Nueva York 2099 Dimensional Portal Engine\n"
            "# BUG ALERT: Missing base case causing RecursionError and mutable default argument bug\n\n"
            "def calculate_warp_energy(dimension_level, memo={}):\n"
            "    # Bug: Mutable default dictionary leaks across invocations\n"
            "    # Bug: Missing base case for n < 0 causes infinite recursion on negative inputs!\n"
            "    if dimension_level == 0:\n"
            "        return 1\n"
            "    # Bug: Forgot base case for dimension_level == 1!\n"
            "    \n"
            "    result = calculate_warp_energy(dimension_level - 1, memo) + 2 * calculate_warp_energy(dimension_level - 2, memo)\n"
            "    return result\n"
        ),
        "solution_code": (
            "def calculate_warp_energy(dimension_level, memo=None):\n"
            "    if memo is None:\n"
            "        memo = {}\n"
            "    if dimension_level < 0:\n"
            "        return 0\n"
            "    if dimension_level == 0:\n"
            "        return 1\n"
            "    if dimension_level == 1:\n"
            "        return 2\n"
            "    if dimension_level in memo:\n"
            "        return memo[dimension_level]\n"
            "    memo[dimension_level] = calculate_warp_energy(dimension_level - 1, memo) + 2 * calculate_warp_energy(dimension_level - 2, memo)\n"
            "    return memo[dimension_level]\n"
        ),
        "test_cases": [
            {"input": "(0,)", "expected": "1", "hidden": False},
            {"input": "(1,)", "expected": "2", "hidden": False},
            {"input": "(4,)", "expected": "16", "hidden": False},
            {"input": "(10,)", "expected": "1024", "hidden": False},
            {"input": "(30,)", "expected": "1073741824", "hidden": True}
        ],
        "function_name": "calculate_warp_energy"
    },
    {
        "id": 8,
        "title": "The Missing Mission File",
        "difficulty": "Intermediate",
        "points": 200,
        "category": "File & Data Stream Handling",
        "story": "A corrupted log dump from the Prowler's stolen stealth rig contains secret weapon frequencies in formatted log strings. We need a robust parser that parses the data stream without file descriptor leaks or formatting crashes.",
        "description": "Fix the simulated file stream processor `parse_stealth_log_stream(raw_log_lines)`. It parses lines of formatted security logs, cleans whitespace, ignores comment lines starting with `#`, extracts valid JSON or key-value frequency pairs, and calculates the average weapon frequency.",
        "instructions": (
            "1. Given a list of log line strings `raw_log_lines`:\n"
            "2. Strip whitespace from each line.\n"
            "3. Ignore empty lines and lines starting with `#`.\n"
            "4. Each valid line is formatted as `'TAG: <channel_name>, FREQ: <frequency_mhz>'`.\n"
            "5. Extract the frequency as a float. If a line is malformed or frequency cannot be parsed as a float, ignore that line.\n"
            "6. Return a dict with: `'valid_count'` (int) and `'avg_frequency'` (float rounded to 2 decimal places). If no valid lines, return `{'valid_count': 0, 'avg_frequency': 0.0}`."
        ),
        "hints": [
            "Use `.strip()` on each line first.",
            "Use `try...except ValueError` when parsing numeric values to gracefully skip corrupted lines.",
            "Split by comma or use string search to find `'FREQ:'`."
        ],
        "starter_code": (
            "# Prowler Stealth Gear Audio Stream Parser\n"
            "# BUG ALERT: Unhandled exceptions on malformed lines, comment parsing bug\n\n"
            "def parse_stealth_log_stream(raw_log_lines):\n"
            "    total_freq = 0\n"
            "    count = 0\n"
            "    for line in raw_log_lines:\n"
            "        # Bug: Does not strip before checking startswith\n"
            "        if line.startswith('#'):\n"
            "            continue\n"
            "        # Bug: Crashes with IndexError on lines without comma or FREQ\n"
            "        parts = line.split(',')\n"
            "        freq_part = parts[1]\n"
            "        val = float(freq_part.replace('FREQ:', ''))\n"
            "        total_freq += val\n"
            "        count += 1\n"
            "        \n"
            "    # Bug: Division by zero when count == 0\n"
            "    return {'valid_count': count, 'avg_frequency': round(total_freq / count, 2)}\n"
        ),
        "solution_code": (
            "def parse_stealth_log_stream(raw_log_lines):\n"
            "    total_freq = 0.0\n"
            "    count = 0\n"
            "    for line in raw_log_lines:\n"
            "        cleaned = line.strip()\n"
            "        if not cleaned or cleaned.startswith('#'):\n"
            "            continue\n"
            "        if 'FREQ:' not in cleaned:\n"
            "            continue\n"
            "        try:\n"
            "            freq_str = cleaned.split('FREQ:')[1].strip()\n"
            "            freq_val = float(freq_str.split(',')[0].strip())\n"
            "            total_freq += freq_val\n"
            "            count += 1\n"
            "        except (IndexError, ValueError):\n"
            "            continue\n"
            "    if count == 0:\n"
            "        return {'valid_count': 0, 'avg_frequency': 0.0}\n"
            "    return {'valid_count': count, 'avg_frequency': round(total_freq / count, 2)}\n"
        ),
        "test_cases": [
            {
                "input": "( ['# Calibration Log', 'TAG: Alpha, FREQ: 142.5', '  # Note', 'TAG: Beta, FREQ: 157.5'], )",
                "expected": "{'valid_count': 2, 'avg_frequency': 150.0}",
                "hidden": False
            },
            {
                "input": "( ['# All comments', '   # another comment   '], )",
                "expected": "{'valid_count': 0, 'avg_frequency': 0.0}",
                "hidden": False
            },
            {
                "input": "( ['TAG: Broken line without freq', 'TAG: Gamma, FREQ: corrupted_freq', 'TAG: Delta, FREQ: 300.0'], )",
                "expected": "{'valid_count': 1, 'avg_frequency': 300.0}",
                "hidden": False
            },
            {
                "input": "( ['TAG: X, FREQ: 100.25', 'TAG: Y, FREQ: 200.75', 'TAG: Z, FREQ: 300.5'], )",
                "expected": "{'valid_count': 3, 'avg_frequency': 200.5}",
                "hidden": True
            }
        ],
        "function_name": "parse_stealth_log_stream"
    },
    {
        "id": 9,
        "title": "The Multi-Bug Outbreak",
        "difficulty": "Hard",
        "points": 300,
        "category": "System Architecture",
        "story": "The Web-Shooter Rapid-Fabrication Nanite Engine has multiple cascading failures across memory allocation, cartridge reloading queue prioritization, and edge-case fluid pressure calculation.",
        "description": "Debug `manage_nanite_web_queue(requests, max_capacity)`. The function manages an incoming queue of cartridge reload requests, validates each request against inventory limits, sorts by priority (URGENT > NORMAL > LOW), and produces an approved batch without exceeding `max_capacity`.",
        "instructions": (
            "1. Given `requests` (list of dicts with `'id'`, `'priority'`, `'fluid_units'`) and `max_capacity` (int):\n"
            "2. Prioritize requests: `'URGENT'` has highest priority (value 3), `'NORMAL'` is 2, `'LOW'` is 1. Invalid or missing priority defaults to 0.\n"
            "3. If priority is tied, maintain original arrival order (stable sort).\n"
            "4. Filter out any request where `fluid_units <= 0` or missing.\n"
            "5. Greedily approve requests from highest priority to lowest as long as `current_total + fluid_units <= max_capacity`.\n"
            "6. Return dict with: `'approved_ids'` (list of request IDs in order of approval), `'total_fluid_used'` (int), and `'rejected_count'` (number of requests not approved)."
        ),
        "hints": [
            "Multiple bugs exist: priority weighting dictionary has typos, sorting is unstable, and negative fluid units are mistakenly counted.",
            "Define priority map: `{'URGENT': 3, 'NORMAL': 2, 'LOW': 1}`.",
            "Sort with stable Python `sorted()` using `key=lambda req: priority_map.get(req.get('priority'), 0), reverse=True`."
        ],
        "starter_code": (
            "# Stark Nanite Fabrication Pipeline\n"
            "# MULTI-BUG ALERT: 4 distinct bugs: inverted priority, missing validation, mutable accumulator, bad return\n\n"
            "def manage_nanite_web_queue(requests, max_capacity):\n"
            "    # Bug 1: Inverted priority values (makes LOW higher than URGENT!)\n"
            "    priority_weights = {'URGENT': 1, 'NORMAL': 2, 'LOW': 3}\n"
            "    \n"
            "    # Bug 2: Doesn't filter out requests with <= 0 fluid units\n"
            "    valid_requests = requests\n"
            "    \n"
            "    # Bug 3: Inverted sort order\n"
            "    sorted_requests = sorted(valid_requests, key=lambda r: priority_weights.get(r.get('priority'), 0))\n"
            "    \n"
            "    approved_ids = []\n"
            "    used = 0\n"
            "    for req in sorted_requests:\n"
            "        cost = req['fluid_units']\n"
            "        if used + cost < max_capacity: # Bug 4: Uses '<' instead of '<=', missing exact capacity!\n"
            "            approved_ids.append(req['id'])\n"
            "            used += cost\n"
            "            \n"
            "    return {\n"
            "        'approved_ids': approved_ids,\n"
            "        'total_fluid_used': used,\n"
            "        'rejected_count': len(requests) - len(approved_ids)\n"
            "    }\n"
        ),
        "solution_code": (
            "def manage_nanite_web_queue(requests, max_capacity):\n"
            "    priority_weights = {'URGENT': 3, 'NORMAL': 2, 'LOW': 1}\n"
            "    \n"
            "    # Filter out requests with invalid or non-positive fluid units\n"
            "    valid_requests = [r for r in requests if r.get('fluid_units', 0) > 0]\n"
            "    \n"
            "    # Stable sort by priority descending\n"
            "    sorted_requests = sorted(valid_requests, key=lambda r: priority_weights.get(r.get('priority'), 0), reverse=True)\n"
            "    \n"
            "    approved_ids = []\n"
            "    used = 0\n"
            "    for req in sorted_requests:\n"
            "        cost = req.get('fluid_units', 0)\n"
            "        if used + cost <= max_capacity:\n"
            "            approved_ids.append(req['id'])\n"
            "            used += cost\n"
            "            \n"
            "    return {\n"
            "        'approved_ids': approved_ids,\n"
            "        'total_fluid_used': used,\n"
            "        'rejected_count': len(requests) - len(approved_ids)\n"
            "    }\n"
        ),
        "test_cases": [
            {
                "input": "([\n    {'id': 'REQ-1', 'priority': 'LOW', 'fluid_units': 30},\n    {'id': 'REQ-2', 'priority': 'URGENT', 'fluid_units': 50},\n    {'id': 'REQ-3', 'priority': 'NORMAL', 'fluid_units': 40}\n], 100)",
                "expected": "{'approved_ids': ['REQ-2', 'REQ-3'], 'total_fluid_used': 90, 'rejected_count': 1}",
                "hidden": False
            },
            {
                "input": "([\n    {'id': 'BAD-1', 'priority': 'URGENT', 'fluid_units': -10},\n    {'id': 'GOOD-1', 'priority': 'NORMAL', 'fluid_units': 25}\n], 50)",
                "expected": "{'approved_ids': ['GOOD-1'], 'total_fluid_used': 25, 'rejected_count': 1}",
                "hidden": False
            },
            {
                "input": "([\n    {'id': 'A', 'priority': 'URGENT', 'fluid_units': 50},\n    {'id': 'B', 'priority': 'URGENT', 'fluid_units': 50}\n], 100)",
                "expected": "{'approved_ids': ['A', 'B'], 'total_fluid_used': 100, 'rejected_count': 0}",
                "hidden": False
            },
            {
                "input": "([\n    {'id': 'X', 'priority': 'LOW', 'fluid_units': 10},\n    {'id': 'Y', 'priority': 'NORMAL', 'fluid_units': 20},\n    {'id': 'Z', 'priority': 'URGENT', 'fluid_units': 70}\n], 30)",
                "expected": "{'approved_ids': ['Y', 'X'], 'total_fluid_used': 30, 'rejected_count': 1}",
                "hidden": True
            }
        ],
        "function_name": "manage_nanite_web_queue"
    },
    {
        "id": 10,
        "title": "Spider-Verse System Recovery",
        "difficulty": "Hard",
        "points": 300,
        "category": "Boss Battle: Core Matrix",
        "story": "KINGPIN HAS INJECTED THE 'SYMBIOTE VIRUS' INTO THE MULTIVERSE QUANTUM MAINFRAME! Dimensional tears are ripping through Brooklyn, Harlem, and Manhattan. Spider-Man, Spider-Gwen, and Miles Morales must execute the Full Master Core Recovery Algorithm to purge the corrupted nodes, route quantum power across optimal nodes, and restore the dimensional anchor!",
        "description": "Recover the Quantum Neural Mesh in `restore_spider_neural_matrix(network_nodes, virus_signatures)`. You must purge infected nodes, traverse the surviving graph using BFS/Dijkstra to determine connectivity from Root ('EARTH-616') to Target ('PORTAL-CORE'), and compute the max resilient bandwidth capacity.",
        "instructions": (
            "1. Given `network_nodes` (dict where keys are node IDs e.g. `'EARTH-616'`, and values are dicts with `'neighbors'` list of tuples `(neighbor_id, bandwidth)` and `'status'` string):\n"
            "2. Given `virus_signatures` (list of infected node IDs to quarantine and remove immediately).\n"
            "3. Step 1: Remove all virus-infected nodes from the network. Also purge any connections pointing to or from infected nodes.\n"
            "4. Step 2: From source `'EARTH-616'`, find if a reachable path exists to destination `'PORTAL-CORE'` using BFS or DFS.\n"
            "5. Step 3: If reachable, find the path that maximizes the bottleneck bandwidth (the minimum edge bandwidth along the path). If multiple paths have the same bottleneck bandwidth, choose the one with the fewest hops. Return `{'status': 'RESTORED', 'reachable': True, 'bottleneck': max_bottleneck, 'hops': hop_count}`.\n"
            "6. Step 4: If `'PORTAL-CORE'` is unreachable or `'EARTH-616'` is purged, return `{'status': 'CRITICAL_FAILURE', 'reachable': False, 'bottleneck': 0, 'hops': -1}`."
        ),
        "hints": [
            "Clean the adjacency list thoroughly: delete infected nodes, and filter neighbors to exclude infected ones.",
            "Use a queue or priority queue to explore paths from `'EARTH-616'` to `'PORTAL-CORE'`.",
            "Keep track of the bottleneck (minimum bandwidth along the path). You want the path with maximum bottleneck, and tiebreak by minimum hops!"
        ],
        "starter_code": (
            "# ========================================================\n"
            "# FINAL BOSS BATTLE: THE SYMBIOTE QUANTUM RECOVERY MATRIX\n"
            "# Corrupted by Kingpin's Cyber-Symbiote virus\n"
            "# ========================================================\n\n"
            "def restore_spider_neural_matrix(network_nodes, virus_signatures):\n"
            "    # Bug 1: Modifying network_nodes in-place during iteration causes skipped nodes\n"
            "    for virus in virus_signatures:\n"
            "        if virus in network_nodes:\n"
            "            del network_nodes[virus]\n"
            "            \n"
            "    # Bug 2: Neighbors still contain pointers to deleted virus nodes!\n"
            "    # Bug 3: BFS logic doesn't properly track path bottlenecks\n"
            "    # Bug 4: Doesn't handle disconnected or missing start/end nodes\n"
            "    \n"
            "    if 'EARTH-616' not in network_nodes or 'PORTAL-CORE' not in network_nodes:\n"
            "        return {'status': 'CRITICAL_FAILURE', 'reachable': False, 'bottleneck': 0, 'hops': -1}\n"
            "        \n"
            "    from collections import deque\n"
            "    queue = deque([('EARTH-616', float('inf'), 0)])\n"
            "    visited = set(['EARTH-616'])\n"
            "    \n"
            "    best_bottleneck = 0\n"
            "    best_hops = float('inf')\n"
            "    \n"
            "    # Broken traversal logic...\n"
            "    return {'status': 'RESTORED', 'reachable': False, 'bottleneck': 0, 'hops': -1}\n"
        ),
        "solution_code": (
            "from collections import deque\n\n"
            "def restore_spider_neural_matrix(network_nodes, virus_signatures):\n"
            "    infected = set(virus_signatures)\n"
            "    if 'EARTH-616' in infected or 'PORTAL-CORE' in infected:\n"
            "        return {'status': 'CRITICAL_FAILURE', 'reachable': False, 'bottleneck': 0, 'hops': -1}\n"
            "    if 'EARTH-616' not in network_nodes or 'PORTAL-CORE' not in network_nodes:\n"
            "        return {'status': 'CRITICAL_FAILURE', 'reachable': False, 'bottleneck': 0, 'hops': -1}\n"
            "    \n"
            "    # Clean graph: purge infected nodes and edges to infected nodes\n"
            "    graph = {}\n"
            "    for node, data in network_nodes.items():\n"
            "        if node in infected:\n"
            "            continue\n"
            "        clean_neighbors = []\n"
            "        for nbr, cap in data.get('neighbors', []):\n"
            "            if nbr not in infected and nbr in network_nodes:\n"
            "                clean_neighbors.append((nbr, cap))\n"
            "        graph[node] = clean_neighbors\n"
            "        \n"
            "    # Explore paths from EARTH-616 to PORTAL-CORE\n"
            "    # Queue holds: (current_node, path_bottleneck, hops, visited_nodes_tuple)\n"
            "    queue = deque([('EARTH-616', float('inf'), 0, ('EARTH-616',))])\n"
            "    \n"
            "    best_bottleneck = -1\n"
            "    min_hops_for_best = float('inf')\n"
            "    \n"
            "    while queue:\n"
            "        curr, bneck, hops, path = queue.popleft()\n"
            "        if curr == 'PORTAL-CORE':\n"
            "            if bneck > best_bottleneck:\n"
            "                best_bottleneck = bneck\n"
            "                min_hops_for_best = hops\n"
            "            elif bneck == best_bottleneck:\n"
            "                if hops < min_hops_for_best:\n"
            "                    min_hops_for_best = hops\n"
            "            continue\n"
            "            \n"
            "        for nbr, cap in graph.get(curr, []):\n"
            "            if nbr not in path:\n"
            "                new_bneck = min(bneck, cap)\n"
            "                queue.append((nbr, new_bneck, hops + 1, path + (nbr,)))\n"
            "                \n"
            "    if best_bottleneck != -1:\n"
            "        return {\n"
            "            'status': 'RESTORED',\n"
            "            'reachable': True,\n"
            "            'bottleneck': int(best_bottleneck),\n"
            "            'hops': min_hops_for_best\n"
            "        }\n"
            "    else:\n"
            "        return {\n"
            "            'status': 'CRITICAL_FAILURE',\n"
            "            'reachable': False,\n"
            "            'bottleneck': 0,\n"
            "            'hops': -1\n"
            "        }\n"
        ),
        "test_cases": [
            {
                "input": "({\n    'EARTH-616': {'neighbors': [('NODE-A', 100), ('NODE-B', 50)]},\n    'NODE-A': {'neighbors': [('PORTAL-CORE', 80)]},\n    'NODE-B': {'neighbors': [('PORTAL-CORE', 120)]},\n    'PORTAL-CORE': {'neighbors': []}\n}, ['NODE-B'])",
                "expected": "{'status': 'RESTORED', 'reachable': True, 'bottleneck': 80, 'hops': 2}",
                "hidden": False
            },
            {
                "input": "({\n    'EARTH-616': {'neighbors': [('NODE-A', 100)]},\n    'NODE-A': {'neighbors': [('PORTAL-CORE', 100)]},\n    'PORTAL-CORE': {'neighbors': []}\n}, ['NODE-A'])",
                "expected": "{'status': 'CRITICAL_FAILURE', 'reachable': False, 'bottleneck': 0, 'hops': -1}",
                "hidden": False
            },
            {
                "input": "({\n    'EARTH-616': {'neighbors': [('HUB-1', 500)]},\n    'HUB-1': {'neighbors': [('HUB-2', 400)]},\n    'HUB-2': {'neighbors': [('PORTAL-CORE', 350)]},\n    'PORTAL-CORE': {'neighbors': []}\n}, [])",
                "expected": "{'status': 'RESTORED', 'reachable': True, 'bottleneck': 350, 'hops': 3}",
                "hidden": False
            },
            {
                "input": "({\n    'EARTH-616': {'neighbors': [('DIRECT', 10), ('LONG', 90)]},\n    'DIRECT': {'neighbors': [('PORTAL-CORE', 10)]},\n    'LONG': {'neighbors': [('LONG-2', 80)]},\n    'LONG-2': {'neighbors': [('PORTAL-CORE', 70)]},\n    'PORTAL-CORE': {'neighbors': []}\n}, [])",
                "expected": "{'status': 'RESTORED', 'reachable': True, 'bottleneck': 70, 'hops': 3}",
                "hidden": True
            }
        ],
        "function_name": "restore_spider_neural_matrix"
    }
]
