from executor import test_user_solution
from challenges_data import CHALLENGES

print("="*60)
print("TESTING ALL 10 CHALLENGE SOLUTIONS")
print("="*60)

all_ok = True
for ch in CHALLENGES:
    res = test_user_solution(ch['solution_code'], ch['test_cases'], ch['function_name'])
    passed = res.get("all_passed", False)
    count = f"{res.get('passed_count')}/{res.get('total_count')}"
    status = "OK" if passed else "FAILED"
    print(f"[{status}] Mission {ch['id']:02d}: {ch['title']} -> {count}")
    if not passed:
        all_ok = False
        print("  Error:", res.get("general_error"))
        for r in res.get("results", []):
            if not r["passed"]:
                print("   Mismatch:", r)

print("="*60)
if all_ok:
    print("ALL 10 CHALLENGES PASSED PERFECTLY!")
else:
    print("SOME CHALLENGES FAILED!")
print("="*60)

print("\nVERIFYING THAT STARTER CODE CONTAINS REAL BUGS:")
for ch in CHALLENGES:
    res = test_user_solution(ch['starter_code'], ch['test_cases'], ch['function_name'])
    print(f"Mission {ch['id']:02d}: Starter Code fails as expected: {not res.get('all_passed')} (Passed {res.get('passed_count')}/{res.get('total_count')})")

