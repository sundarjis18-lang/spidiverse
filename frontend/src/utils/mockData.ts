import { Challenge, LeaderboardEntry, User } from '../types';

const RAW_CHALLENGES = [
  {
    id: 1,
    title: "The Broken Calculator",
    difficulty: "Beginner" as const,
    points: 100,
    category: "Syntax",
    story: "The Oscorp Tower Web-Sensors are dropping connection packets due to syntax corruption in the telemetry logger. Patch the malformed Python statements before the network goes completely dark!",
    description: "Fix the syntax errors in `calculate_web_fluid_pressure`. The code fails to compile due to missing colons, unbalanced parentheses, and an invalid keyword.",
    instructions: "1. Inspect `calculate_web_fluid_pressure(nozzle_diameter, fluid_density)`.\n2. Fix syntax errors: add missing colons on def/if statements, fix misspelled 'esle', and balance parentheses.\n3. Return `round(pressure, 2)` if nozzle_diameter > 0, else 0.0.",
    hints: [
      "Check for missing colons `:` after the function signature and `if` statement.",
      "Check the spelling of the `else` keyword.",
      "Make sure parentheses are properly closed in `(nozzle_diameter ** 2)`."
    ],
    starter_code: `# Oscorp Web-Sensor Diagnostic Subroutine
# BUG ALERT: Multiple syntax errors prevent compilation

def calculate_web_fluid_pressure(nozzle_diameter, fluid_density)
    if nozzle_diameter <= 0
        return 0.0
    esle:
        pressure = (fluid_density * 9.81) / (nozzle_diameter ** 2
        return round(pressure, 2)
`,
    function_name: "calculate_web_fluid_pressure",
    test_cases: [
      { input: "(2.0, 1000.0)", expected: "2452.5", hidden: false },
      { input: "(1.5, 850.0)", expected: "3706.0", hidden: false },
      { input: "(0.0, 500.0)", expected: "0.0", hidden: false },
      { input: "(0.8, 1200.0)", expected: "18393.75", hidden: true }
    ],
    is_unlocked: true,
    is_completed: false
  },
  {
    id: 2,
    title: "Variable Identity Crisis",
    difficulty: "Beginner" as const,
    points: 100,
    category: "Data Types",
    story: "Peter's Stark Suit HUD is malfunctioning! Telemetry comes in as raw strings, causing TypeError crashes when computing trajectory metrics.",
    description: "Fix type conversion and string concatenation bugs in `calculate_suit_trajectory`.",
    instructions: "1. In `calculate_suit_trajectory(altitude_str, velocity_str, boost_str)`:\n2. Cast altitude and velocity to float.\n3. Check if boost is active (True or 'true').\n4. Calculate `impact_metric = (altitude * 0.4) + (velocity * 1.5) + (50.0 if boost else 0.0)`.\n5. Return `f'TRAJECTORY: {impact_metric:.1f}'`.",
    hints: [
      "Wrap altitude and velocity with `float()` before multiplying.",
      "A float cannot be concatenated to a string with `+` without formatting or string casting.",
      "Use an f-string: `f'TRAJECTORY: {impact_metric:.1f}'`."
    ],
    starter_code: `# Stark Suit HUD Trajectory Engine
# BUG ALERT: Incompatible type concatenation and incorrect scoping

def calculate_suit_trajectory(altitude_str, velocity_str, boost_str):
    altitude = altitude_str
    velocity = velocity_str
    
    # Bug: Adding string and float causes TypeError
    boost = True if boost_str == 'True' or boost_str is True else False
    impact_metric = (altitude * 0.4) + (velocity * 1.5) + (50.0 if boost else 0.0)
    
    # Bug: String + float concatenation
    return 'TRAJECTORY: ' + impact_metric
`,
    function_name: "calculate_suit_trajectory",
    test_cases: [
      { input: "('100.0', '40.0', 'True')", expected: "'TRAJECTORY: 150.0'", hidden: false },
      { input: "('250.5', '10.2', 'False')", expected: "'TRAJECTORY: 115.5'", hidden: false },
      { input: "('0.0', '0.0', 'true')", expected: "'TRAJECTORY: 50.0'", hidden: false },
      { input: "('500.0', '80.0', True)", expected: "'TRAJECTORY: 370.0'", hidden: true }
    ],
    is_unlocked: false,
    is_completed: false
  },
  {
    id: 3,
    title: "The Infinite Web Loop",
    difficulty: "Beginner" as const,
    points: 100,
    category: "Loops & Conditionals",
    story: "Miles Morales is monitoring bio-electric venom strikes across Queens power substations. The monitoring loop hangs in an infinite loop and misclassifies danger zones!",
    description: "Fix the loop condition and index increment in `detect_danger_zones(readings, threshold)`.",
    instructions: "1. Iterate through `readings`.\n2. Skip negative anomaly readings.\n3. If reading strictly exceeds `threshold`, record its 0-based index.\n4. Return list of danger indices.",
    hints: [
      "Avoid infinite loops in `while` by incrementing index `i` on all branches or use `for i, val in enumerate(readings)`.",
      "Danger condition must be `val > threshold`, not `<=`."
    ],
    starter_code: `# Queens Power Grid Venom Charge Monitor
# BUG ALERT: Loop variable never increments on anomaly, causing infinite loop

def detect_danger_zones(readings, threshold):
    danger_indices = []
    i = 0
    while i < len(readings):
        val = readings[i]
        if val < 0:
            # Bug: Forgot to increment i before skipping!
            continue
        if val <= threshold: # Bug: Inverted condition
            danger_indices.append(i)
        i += 1
    return danger_indices
`,
    function_name: "detect_danger_zones",
    test_cases: [
      { input: "([45, 120, -5, 88, 150, 60], 100)", expected: "[1, 4]", hidden: false },
      { input: "([10, 20, 30], 50)", expected: "[]", hidden: false },
      { input: "([-10, -20, 95, 105], 90)", expected: "[2, 3]", hidden: false },
      { input: "([200, -1, 300, 100, 500], 150)", expected: "[0, 2, 4]", hidden: true }
    ],
    is_unlocked: false,
    is_completed: false
  },
  {
    id: 4,
    title: "The Scrambled Message",
    difficulty: "Beginner" as const,
    points: 100,
    category: "Strings",
    story: "Spider-Gwen intercepted encrypted distress beacons from Earth-65. The beacon strings have noise punctuation and reverse order encoding. Decode the true beacon callsign!",
    description: "Fix string cleaning, case conversion, and palindrome verification in `decode_spider_beacon(raw_signal)`.",
    instructions: "1. Filter out all non-alphanumeric characters.\n2. Convert all characters to uppercase.\n3. If cleaned string is a palindrome and len >= 3, return `f'VERIFIED:{cleaned}'`.\n4. Otherwise return `f'STANDARD:{cleaned[::-1]}'`. ",
    hints: [
      "Filter with `''.join(c.upper() for c in raw_signal if c.isalnum())'`.",
      "To reverse a string in Python: `s[::-1]`."
    ],
    starter_code: `# Earth-65 Inter-dimensional Beacon Decoder
# BUG ALERT: Incomplete string sanitization and broken palindrome verification

def decode_spider_beacon(raw_signal):
    cleaned = raw_signal.replace('#', '').replace('$', '')
    is_palindrome = cleaned == cleaned[0:len(cleaned)] # Bug: Not checking reverse!
    
    if is_palindrome and len(cleaned) >= 3:
        return 'VERIFIED:' + cleaned
    else:
        return 'STANDARD:' + cleaned # Bug: Not reversed!
`,
    function_name: "decode_spider_beacon",
    test_cases: [
      { input: "('R#a!d$a%r')", expected: "'VERIFIED:RADAR'", hidden: false },
      { input: "('Spider-Man!')", expected: "'STANDARD:NAMREDIPS'", hidden: false },
      { input: "('A1-b-1a')", expected: "'VERIFIED:A1B1A'", hidden: false },
      { input: "('!k@a#y$a%k^')", expected: "'VERIFIED:KAYAK'", hidden: true }
    ],
    is_unlocked: false,
    is_completed: false
  },
  {
    id: 5,
    title: "The Logic Trap",
    difficulty: "Intermediate" as const,
    points: 200,
    category: "Logic & Math",
    story: "Electro has destabilized the Manhattan power grid harmonic frequencies. Identify the prime harmonic frequencies within each power band to neutralize Electro's grid.",
    description: "Fix prime checking logic and boundary conditions in `find_harmonic_primes(start, end)`.",
    instructions: "1. Given `start` and `end` (inclusive).\n2. Return a sorted list of all primes in `[start, end]`.\n3. Note: numbers <= 1 are not prime. 2 is the only even prime.",
    hints: [
      "1 is NOT prime. Ensure `if n < 2: return False`.",
      "The range must include `end`: `range(start, end + 1)`.",
      "Check divisors up to `int(n**0.5) + 1`."
    ],
    starter_code: `# Oscorp Grid Frequency Filter
# BUG ALERT: Flawed primality testing logic and range omission

def is_prime(n):
    if n <= 0:
        return False
    if n == 1:
        return True  # ERROR: 1 is NOT prime!
    for i in range(2, n):
        if n % i == 0:
            return False
    return True

def find_harmonic_primes(start, end):
    primes = []
    # Bug: range(start, end) excludes end boundary!
    for num in range(start, end):
        if is_prime(num):
            primes.append(num)
    return primes
`,
    function_name: "find_harmonic_primes",
    test_cases: [
      { input: "(1, 10)", expected: "[2, 3, 5, 7]", hidden: false },
      { input: "(10, 20)", expected: "[11, 13, 17, 19]", hidden: false },
      { input: "(24, 28)", expected: "[]", hidden: false },
      { input: "(50, 70)", expected: "[53, 59, 61, 67]", hidden: true }
    ],
    is_unlocked: false,
    is_completed: false
  },
  {
    id: 6,
    title: "The Lost Web Database",
    difficulty: "Intermediate" as const,
    points: 200,
    category: "Collections",
    story: "The Daily Bugle criminal incident report throws KeyError exceptions and fails to aggregate threat points across NYC boroughs.",
    description: "Fix KeyError exceptions and custom sorting in `aggregate_villain_threats(incidents)`.",
    instructions: "1. Each incident has `'villain'` and optional `'threat'` score.\n2. Aggregate total threat per villain (missing threat counts as 0).\n3. Return list of tuples `(villain, total_threat)` sorted by threat descending, then villain name ascending.",
    hints: [
      "Use `record.get('threat', 0)` to prevent KeyErrors.",
      "Sort with `key=lambda x: (-x[1], x[0])`."
    ],
    starter_code: `# Daily Bugle Criminal Threat Indexer
# BUG ALERT: KeyError on missing fields, bad sorting

def aggregate_villain_threats(incidents):
    summary = {}
    for record in incidents:
        name = record['villain']
        threat = record['threat'] # KeyError if missing!
        summary[name] = summary[name] + threat
        
    return sorted(summary.items())
`,
    function_name: "aggregate_villain_threats",
    test_cases: [
      { input: "([{'villain': 'Doc Ock', 'threat': 80}, {'villain': 'Venom', 'threat': 95}, {'villain': 'Doc Ock', 'threat': 40}],)", expected: "[('Doc Ock', 120), ('Venom', 95)]", hidden: false },
      { input: "([{'villain': 'Rhino', 'threat': 50}, {'villain': 'Vulture'}, {'villain': 'Rhino', 'threat': 25}],)", expected: "[('Rhino', 75), ('Vulture', 0)]", hidden: false },
      { input: "([{'villain': 'Green Goblin', 'threat': 100}, {'villain': 'Carnage', 'threat': 100}],)", expected: "[('Carnage', 100), ('Green Goblin', 100)]", hidden: false },
      { input: "([],)", expected: "[]", hidden: true }
    ],
    is_unlocked: false,
    is_completed: false
  },
  {
    id: 7,
    title: "The Function Failure",
    difficulty: "Intermediate" as const,
    points: 200,
    category: "Recursion",
    story: "Spider-Man 2099 needs to compute the dimensional warp decay sequence for the Multiverse Portal. Unhandled base cases trigger RecursionError stack overflows!",
    description: "Fix base cases and memoization in `calculate_warp_energy(dimension_level, memo=None)`.",
    instructions: "1. If `dimension_level < 0`, return 0.\n2. If 0, return 1; if 1, return 2.\n3. For `n >= 2`: `energy(n) = energy(n - 1) + 2 * energy(n - 2)`.\n4. Use memoization to handle large inputs without stack overflow.",
    hints: [
      "Avoid default mutable argument `memo={}`. Use `memo=None` and initialize inside function.",
      "Add base cases for `n < 0`, `n == 0`, and `n == 1`."
    ],
    starter_code: `# Nueva York 2099 Dimensional Portal Engine
# BUG ALERT: Missing base case causing RecursionError and mutable default argument

def calculate_warp_energy(dimension_level, memo={}):
    if dimension_level == 0:
        return 1
    # Bug: Missing base case for dimension_level == 1 and negative inputs!
    
    result = calculate_warp_energy(dimension_level - 1, memo) + 2 * calculate_warp_energy(dimension_level - 2, memo)
    return result
`,
    function_name: "calculate_warp_energy",
    test_cases: [
      { input: "(0,)", expected: "1", hidden: false },
      { input: "(1,)", expected: "2", hidden: false },
      { input: "(4,)", expected: "16", hidden: false },
      { input: "(10,)", expected: "1024", hidden: false },
      { input: "(30,)", expected: "1073741824", hidden: true }
    ],
    is_unlocked: false,
    is_completed: false
  },
  {
    id: 8,
    title: "The Missing Mission File",
    difficulty: "Intermediate" as const,
    points: 200,
    category: "File & Stream Parsing",
    story: "A corrupted log dump from Prowler's stolen stealth rig contains weapon frequency logs. Clean lines, bypass comments and malformed lines safely.",
    description: "Fix file stream parsing and exception handling in `parse_stealth_log_stream(raw_log_lines)`.",
    instructions: "1. Strip each line of whitespace.\n2. Ignore empty lines and lines starting with `#`.\n3. Extract float frequency from `'TAG: <channel>, FREQ: <frequency>'`.\n4. Return `{'valid_count': count, 'avg_frequency': round(avg, 2)}`. If no valid lines, return 0 for both.",
    hints: [
      "Check `line.strip()` before checking `.startswith('#')`.",
      "Wrap frequency parsing in `try...except (IndexError, ValueError):` to safely skip broken logs.",
      "Check if `count == 0` to prevent division by zero!"
    ],
    starter_code: `# Prowler Stealth Gear Audio Stream Parser
# BUG ALERT: Unhandled exceptions on malformed lines, comment parsing bug

def parse_stealth_log_stream(raw_log_lines):
    total_freq = 0
    count = 0
    for line in raw_log_lines:
        if line.startswith('#'): # Bug: whitespace not stripped!
            continue
        parts = line.split(',')
        freq_part = parts[1] # Bug: Crashes if no comma!
        val = float(freq_part.replace('FREQ:', ''))
        total_freq += val
        count += 1
        
    return {'valid_count': count, 'avg_frequency': round(total_freq / count, 2)} # ZeroDivisionError!
`,
    function_name: "parse_stealth_log_stream",
    test_cases: [
      { input: "( ['# Calibration Log', 'TAG: Alpha, FREQ: 142.5', '  # Note', 'TAG: Beta, FREQ: 157.5'], )", expected: "{'valid_count': 2, 'avg_frequency': 150.0}", hidden: false },
      { input: "( ['# All comments', '   # another comment   '], )", expected: "{'valid_count': 0, 'avg_frequency': 0.0}", hidden: false },
      { input: "( ['TAG: Broken line without freq', 'TAG: Gamma, FREQ: corrupted_freq', 'TAG: Delta, FREQ: 300.0'], )", expected: "{'valid_count': 1, 'avg_frequency': 300.0}", hidden: false },
      { input: "( ['TAG: X, FREQ: 100.25', 'TAG: Y, FREQ: 200.75', 'TAG: Z, FREQ: 300.5'], )", expected: "{'valid_count': 3, 'avg_frequency': 200.5}", hidden: true }
    ],
    is_unlocked: false,
    is_completed: false
  },
  {
    id: 9,
    title: "The Multi-Bug Outbreak",
    difficulty: "Hard" as const,
    points: 300,
    category: "System Architecture",
    story: "The Web-Shooter Rapid-Fabrication Nanite Engine has multiple cascading failures across priority ranking, invalid fluid validation, and capacity accumulation.",
    description: "Debug `manage_nanite_web_queue(requests, max_capacity)` fixing 4 concurrent system bugs.",
    instructions: "1. Prioritize requests: `'URGENT'` (3), `'NORMAL'` (2), `'LOW'` (1).\n2. Filter out requests with `fluid_units <= 0`.\n3. Greedily approve requests from highest priority to lowest while `used + cost <= max_capacity`.\n4. Return `{'approved_ids': list, 'total_fluid_used': int, 'rejected_count': int}`.",
    hints: [
      "Priority map was inverted in the starter code: ensure URGENT has the highest weight.",
      "Filter out invalid negative or zero fluid requests.",
      "Use `<= max_capacity`, not `< max_capacity`."
    ],
    starter_code: `# Stark Nanite Fabrication Pipeline
# MULTI-BUG ALERT: 4 distinct bugs: inverted priority, missing validation, mutable accumulator, bad return

def manage_nanite_web_queue(requests, max_capacity):
    priority_weights = {'URGENT': 1, 'NORMAL': 2, 'LOW': 3} # Bug 1: Inverted weights!
    
    valid_requests = requests # Bug 2: Negative fluid units not filtered!
    
    sorted_requests = sorted(valid_requests, key=lambda r: priority_weights.get(r.get('priority'), 0)) # Bug 3: Inverted sort!
    
    approved_ids = []
    used = 0
    for req in sorted_requests:
        cost = req['fluid_units']
        if used + cost < max_capacity: # Bug 4: Uses '<' instead of '<='!
            approved_ids.append(req['id'])
            used += cost
            
    return {
        'approved_ids': approved_ids,
        'total_fluid_used': used,
        'rejected_count': len(requests) - len(approved_ids)
    }
`,
    function_name: "manage_nanite_web_queue",
    test_cases: [
      { input: "([\n    {'id': 'REQ-1', 'priority': 'LOW', 'fluid_units': 30},\n    {'id': 'REQ-2', 'priority': 'URGENT', 'fluid_units': 50},\n    {'id': 'REQ-3', 'priority': 'NORMAL', 'fluid_units': 40}\n], 100)", expected: "{'approved_ids': ['REQ-2', 'REQ-3'], 'total_fluid_used': 90, 'rejected_count': 1}", hidden: false },
      { input: "([\n    {'id': 'BAD-1', 'priority': 'URGENT', 'fluid_units': -10},\n    {'id': 'GOOD-1', 'priority': 'NORMAL', 'fluid_units': 25}\n], 50)", expected: "{'approved_ids': ['GOOD-1'], 'total_fluid_used': 25, 'rejected_count': 1}", hidden: false },
      { input: "([\n    {'id': 'A', 'priority': 'URGENT', 'fluid_units': 50},\n    {'id': 'B', 'priority': 'URGENT', 'fluid_units': 50}\n], 100)", expected: "{'approved_ids': ['A', 'B'], 'total_fluid_used': 100, 'rejected_count': 0}", hidden: false },
      { input: "([\n    {'id': 'X', 'priority': 'LOW', 'fluid_units': 10},\n    {'id': 'Y', 'priority': 'NORMAL', 'fluid_units': 20},\n    {'id': 'Z', 'priority': 'URGENT', 'fluid_units': 70}\n], 30)", expected: "{'approved_ids': ['Y', 'X'], 'total_fluid_used': 30, 'rejected_count': 1}", hidden: true }
    ],
    is_unlocked: false,
    is_completed: false
  },
  {
    id: 10,
    title: "Spider-Verse System Recovery",
    difficulty: "Hard" as const,
    points: 300,
    category: "Boss Battle: Core Matrix",
    story: "KINGPIN HAS INJECTED THE SYMBIOTE VIRUS INTO THE MULTIVERSE QUANTUM MAINFRAME! Purge infected nodes and route quantum power across optimal nodes to restore the dimensional anchor!",
    description: "Recover the Quantum Neural Mesh in `restore_spider_neural_matrix(network_nodes, virus_signatures)`.",
    instructions: "1. Purge all virus-infected nodes and references from the graph.\n2. Find path from `'EARTH-616'` to `'PORTAL-CORE'` maximizing bottleneck bandwidth.\n3. In case of ties, select path with minimum hops.\n4. Return `{'status': 'RESTORED', 'reachable': True, 'bottleneck': max_bottleneck, 'hops': hop_count}` or `{'status': 'CRITICAL_FAILURE', 'reachable': False, 'bottleneck': 0, 'hops': -1}`.",
    hints: [
      "Quarantine all virus nodes: remove them from network_nodes and prune all neighbor edges pointing to them.",
      "Explore paths with BFS or Dijkstra, recording the minimum bandwidth edge along each path.",
      "Maximize bottleneck, tiebreak by minimum hop count."
    ],
    starter_code: `# ========================================================
# FINAL BOSS BATTLE: THE SYMBIOTE QUANTUM RECOVERY MATRIX
# Corrupted by Kingpin's Cyber-Symbiote virus
# ========================================================

def restore_spider_neural_matrix(network_nodes, virus_signatures):
    # Bug 1: Modifying network_nodes in-place during iteration
    for virus in virus_signatures:
        if virus in network_nodes:
            del network_nodes[virus]
            
    # Bug 2: Neighbors still contain pointers to deleted virus nodes!
    # Bug 3: BFS logic doesn't properly track path bottlenecks
    # Bug 4: Doesn't handle disconnected start/end nodes
    
    if 'EARTH-616' not in network_nodes or 'PORTAL-CORE' not in network_nodes:
        return {'status': 'CRITICAL_FAILURE', 'reachable': False, 'bottleneck': 0, 'hops': -1}
        
    return {'status': 'RESTORED', 'reachable': False, 'bottleneck': 0, 'hops': -1}
`,
    function_name: "restore_spider_neural_matrix",
    test_cases: [
      { input: "({\n    'EARTH-616': {'neighbors': [('NODE-A', 100), ('NODE-B', 50)]},\n    'NODE-A': {'neighbors': [('PORTAL-CORE', 80)]},\n    'NODE-B': {'neighbors': [('PORTAL-CORE', 120)]},\n    'PORTAL-CORE': {'neighbors': []}\n}, ['NODE-B'])", expected: "{'status': 'RESTORED', 'reachable': True, 'bottleneck': 80, 'hops': 2}", hidden: false },
      { input: "({\n    'EARTH-616': {'neighbors': [('NODE-A', 100)]},\n    'NODE-A': {'neighbors': [('PORTAL-CORE', 100)]},\n    'PORTAL-CORE': {'neighbors': []}\n}, ['NODE-A'])", expected: "{'status': 'CRITICAL_FAILURE', 'reachable': False, 'bottleneck': 0, 'hops': -1}", hidden: false },
      { input: "({\n    'EARTH-616': {'neighbors': [('HUB-1', 500)]},\n    'HUB-1': {'neighbors': [('HUB-2', 400)]},\n    'HUB-2': {'neighbors': [('PORTAL-CORE', 350)]},\n    'PORTAL-CORE': {'neighbors': []}\n}, [])", expected: "{'status': 'RESTORED', 'reachable': True, 'bottleneck': 350, 'hops': 3}", hidden: false },
      { input: "({\n    'EARTH-616': {'neighbors': [('DIRECT', 10), ('LONG', 90)]},\n    'DIRECT': {'neighbors': [('PORTAL-CORE', 10)]},\n    'LONG': {'neighbors': [('LONG-2', 80)]},\n    'LONG-2': {'neighbors': [('PORTAL-CORE', 70)]},\n    'PORTAL-CORE': {'neighbors': []}\n}, [])", expected: "{'status': 'RESTORED', 'reachable': True, 'bottleneck': 70, 'hops': 3}", hidden: true }
    ],
    is_unlocked: false,
    is_completed: false
  }
];

// Normalize and guarantee all 10 challenges have complete, valid structures
export const INITIAL_CHALLENGES: Challenge[] = RAW_CHALLENGES.map(ch => ({
  ...ch,
  starter_code: ch.starter_code,
  starterCode: ch.starter_code,
  test_cases: ch.test_cases,
  testCases: ch.test_cases,
  hints: Array.isArray(ch.hints) ? ch.hints : [],
  expectedOutput: ch.test_cases[0]?.expected || 'Verified Output',
  expected_output: ch.test_cases[0]?.expected || 'Verified Output',
  functionName: ch.function_name,
  isUnlocked: ch.is_unlocked,
  isCompleted: ch.is_completed
}));

export const MOCK_USER: User = {
  id: 7,
  name: "Peter Parker",
  email: "peter.parker@spiderverse.edu",
  reg_number: "RA2111003010142",
  avatar: "classic",
  points: 100,
  completed_challenges: [1],
  time_spent_seconds: 480,
  role: "student"
};

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    id: 1,
    name: "Miles Morales",
    masked_reg: "RA21••••0255",
    avatar: "miles",
    points: 1800,
    completed_count: 10,
    completion_time: "39m 00s",
    time_seconds: 2340
  },
  {
    rank: 2,
    id: 2,
    name: "Gwen Stacy",
    masked_reg: "RA21••••0389",
    avatar: "gwen",
    points: 1500,
    completed_count: 9,
    completion_time: "52m 00s",
    time_seconds: 3120
  },
  {
    rank: 3,
    id: 3,
    name: "Miguel O'Hara",
    masked_reg: "RA21••••0411",
    avatar: "spider-2099",
    points: 1200,
    completed_count: 8,
    completion_time: "64m 50s",
    time_seconds: 3890
  },
  {
    rank: 4,
    id: 4,
    name: "Pavitr Prabhakar",
    masked_reg: "RA21••••0530",
    avatar: "spider-india",
    points: 800,
    completed_count: 6,
    completion_time: "46m 40s",
    time_seconds: 2800
  },
  {
    rank: 5,
    id: 5,
    name: "Hobie Brown",
    masked_reg: "RA21••••0672",
    avatar: "spider-punk",
    points: 600,
    completed_count: 5,
    completion_time: "32m 30s",
    time_seconds: 1950
  },
  {
    rank: 6,
    id: 6,
    name: "Peni Parker",
    masked_reg: "RA21••••0788",
    avatar: "peni",
    points: 400,
    completed_count: 4,
    completion_time: "23m 40s",
    time_seconds: 1420
  },
  {
    rank: 7,
    id: 7,
    name: "Peter Parker",
    masked_reg: "RA21••••0142",
    avatar: "classic",
    points: 100,
    completed_count: 1,
    completion_time: "08m 00s",
    time_seconds: 480
  }
];

export const SPIDER_AVATARS: Record<string, { label: string; badge: string; color: string }> = {
  classic: { label: "Classic Spider-Man", badge: "Earth-616", color: "#F52245" },
  miles: { label: "Miles Morales (Venom Strike)", badge: "Earth-1610", color: "#E11D48" },
  gwen: { label: "Ghost-Spider (Gwen)", badge: "Earth-65", color: "#EC4899" },
  "spider-2099": { label: "Miguel O'Hara (2099)", badge: "Earth-928", color: "#087CFF" },
  "spider-punk": { label: "Hobie Brown (Spider-Punk)", badge: "Earth-138", color: "#8B35FF" },
  "spider-india": { label: "Pavitr Prabhakar", badge: "Earth-50101", color: "#F59E0B" },
  peni: { label: "Peni Parker (SP//dr)", badge: "Earth-14512", color: "#10B981" },
  symbiote: { label: "Symbiote Suit Overseer", badge: "Klyntar", color: "#64748B" }
};
