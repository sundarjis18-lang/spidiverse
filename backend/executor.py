import sys
import subprocess
import json
import time
import ast
import tempfile
import os
import threading

# Throttle concurrent subprocess executions to protect host CPU and RAM under 60-user load
EXECUTION_SEMAPHORE = threading.Semaphore(8)

DANGEROUS_MODULES = ["os", "subprocess", "sys", "shutil", "socket", "http", "urllib", "requests", "pathlib"]

def validate_code_safety(code: str) -> tuple[bool, str]:
    """
    Static safety validation using AST to detect disallowed imports or dangerous builtins.
    """
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        # If syntax error, allow it to be reported naturally during execution
        return True, ""
    
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                base_module = alias.name.split('.')[0]
                if base_module in DANGEROUS_MODULES:
                    return False, f"Import of module '{alias.name}' is restricted in this arena."
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                base_module = node.module.split('.')[0]
                if base_module in DANGEROUS_MODULES:
                    return False, f"Import from module '{node.module}' is restricted in this arena."
        elif isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                if node.func.id in ["eval", "exec", "open", "__import__"]:
                    return False, f"Built-in function '{node.func.id}()' is restricted."
    return True, ""

def run_isolated_python(script_content: str, timeout: float = 4.0, skip_safety_check: bool = False) -> dict:
    """
    Executes script in an isolated subprocess with timeout and returns stdout, stderr, exit code.
    """
    if not skip_safety_check:
        is_safe, error_msg = validate_code_safety(script_content)
        if not is_safe:
            return {
                "success": False,
                "stdout": "",
                "stderr": f"SECURITY ALERT: {error_msg}",
                "exit_code": -1,
                "runtime_ms": 0.0
            }
    
    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False, encoding="utf-8") as f:
        f.write(script_content)
        temp_path = f.name

    try:
        with EXECUTION_SEMAPHORE:
            start_time = time.perf_counter()
            process = subprocess.run(
                [sys.executable, temp_path],
                capture_output=True,
                text=True,
                timeout=timeout,
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
            )
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            return {
                "success": process.returncode == 0,
                "stdout": process.stdout,
                "stderr": process.stderr,
                "exit_code": process.returncode,
                "runtime_ms": elapsed_ms
            }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "stdout": "",
            "stderr": f"Execution timed out ({timeout}s limit exceeded - potential infinite loop!)",
            "exit_code": -2,
            "runtime_ms": round(timeout * 1000, 2)
        }
    except Exception as e:
        return {
            "success": False,
            "stdout": "",
            "stderr": f"Runtime execution error: {str(e)}",
            "exit_code": -3,
            "runtime_ms": 0.0
        }
    finally:
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass

def execute_user_code(user_code: str) -> dict:
    """
    Run user code standalone (for 'Run Code' button).
    """
    res = run_isolated_python(user_code, timeout=3.5)
    return {
        "status": "success" if res["success"] else "error",
        "output": res["stdout"],
        "error": res["stderr"] if not res["success"] else (res["stderr"] if res["stderr"] else None),
        "runtime_ms": res["runtime_ms"]
    }

def test_user_solution(user_code: str, test_cases: list, function_name: str) -> dict:
    """
    Runs user code against each test case, validating behavior and return values.
    """
    is_safe, error_msg = validate_code_safety(user_code)
    if not is_safe:
        return {
            "all_passed": False,
            "passed_count": 0,
            "total_count": len(test_cases),
            "results": [],
            "general_error": f"SECURITY ALERT: {error_msg}",
            "stdout": ""
        }

    test_cases_json = json.dumps(test_cases)
    test_harness = f"""
import sys
import json
import traceback

{user_code}

test_cases = json.loads({json.dumps(test_cases_json)})
func_name = {json.dumps(function_name)}


results = []

if func_name not in globals():
    results.append({{
        "passed": False,
        "input": "Function Lookup",
        "expected": "Function '" + func_name + "' defined",
        "actual": "Function not defined in code",
        "stdout": "",
        "error": "NameError: function '" + func_name + "' is not defined. Ensure you kept the required function signature.",
        "runtime_ms": 0.0,
        "hidden": False
    }})
    print("__TEST_RESULTS__" + json.dumps(results))
    sys.exit(0)

target_func = globals()[func_name]

for tc in test_cases:
    raw_input_str = tc["input"]
    expected_str = tc["expected"]
    is_hidden = tc.get("hidden", False)
    
    # Capture stdout per test case
    from io import StringIO
    old_stdout = sys.stdout
    captured = StringIO()
    sys.stdout = captured
    
    passed = False
    actual_repr = ""
    err_msg = ""
    
    try:
        # evaluate input arguments
        # If input starts with '(', parse as tuple of args
        # Otherwise wrap in tuple
        eval_args = eval(raw_input_str)
        if not isinstance(eval_args, tuple):
            eval_args = (eval_args,)
            
        actual_val = target_func(*eval_args)
        expected_val = eval(expected_str)
        
        # Compare actual and expected
        if actual_val == expected_val:
            passed = True
        elif isinstance(actual_val, float) and isinstance(expected_val, float):
            passed = abs(actual_val - expected_val) < 1e-4
        else:
            passed = False
            
        actual_repr = repr(actual_val)
    except Exception as e:
        passed = False
        err_msg = traceback.format_exc().strip().split('\\n')[-1]
        actual_repr = "Exception: " + type(e).__name__
    finally:
        sys.stdout = old_stdout
        stdout_val = captured.getvalue()
        
    results.append({{
        "passed": passed,
        "input": "HIDDEN_TEST_CASE" if is_hidden and not passed else raw_input_str,
        "expected": "CONFIDENTIAL" if is_hidden and not passed else expected_str,
        "actual": actual_repr,
        "stdout": stdout_val,
        "error": err_msg if err_msg else None,
        "runtime_ms": 0.0,
        "hidden": is_hidden
    }})

print("__TEST_RESULTS__" + json.dumps(results))
"""
    res = run_isolated_python(test_harness, timeout=5.0, skip_safety_check=True)
    
    if not res["success"] and not "__TEST_RESULTS__" in res["stdout"]:
        return {
            "all_passed": False,
            "passed_count": 0,
            "total_count": len(test_cases),
            "results": [],
            "general_error": res["stderr"] or "Syntax or runtime error during execution.",
            "stdout": res["stdout"]
        }
        
    # Extract json
    stdout_lines = res["stdout"]
    split_marker = "__TEST_RESULTS__"
    if split_marker in stdout_lines:
        prefix, json_str = stdout_lines.split(split_marker, 1)
        try:
            results = json.loads(json_str.strip())
            all_passed = all(r["passed"] for r in results)
            passed_count = sum(1 for r in results if r["passed"])
            return {
                "all_passed": all_passed,
                "passed_count": passed_count,
                "total_count": len(results),
                "results": results,
                "general_error": None,
                "stdout": prefix
            }
        except Exception as e:
            return {
                "all_passed": False,
                "passed_count": 0,
                "total_count": len(test_cases),
                "results": [],
                "general_error": f"Failed to parse test outputs: {str(e)}",
                "stdout": stdout_lines
            }
    else:
        return {
            "all_passed": False,
            "passed_count": 0,
            "total_count": len(test_cases),
            "results": [],
            "general_error": res["stderr"] or "Code execution failed unexpectedly.",
            "stdout": res["stdout"]
        }
