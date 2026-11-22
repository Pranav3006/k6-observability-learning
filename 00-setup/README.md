# 00 – Setup: first k6 smoke test

## What
A smoke test (2 virtual users, 15 s) against a local nginx container,
to prove k6 and Docker are installed and working.

## How to run
docker run -d --name web -p 8080:80 nginx:alpine
k6 run 00-setup/smoke.js
docker rm -f web

## Result
- App running: ~30 requests, 100% status 200, all thresholds passed, exit code 0
- App stopped: requests failed, http_req_failed threshold breached, exit code 99

## What I learned
- A failed `check` is only recorded; the test keeps going. A failed **threshold**
  marks the whole run as failed when it ends, and k6 exits with code 99
  (it does not stop early unless `abortOnFail: true` is set).
  I can see the code by running `$LASTEXITCODE` right after `k6 run`.
- With the app stopped, `http_req_duration p(95)<300` still **passed** (p95 = 0 s),
  because "connection refused" comes back instantly. A broken app can look fast,
  so a latency threshold must always be paired with an error-rate threshold.
- In CI, any non-zero exit code fails the pipeline. Exit code 99 turns thresholds
  into an automatic quality gate: if a change makes an API slow or error-prone,
  the build goes red on its own.

## Interview question
**Q:** What is a smoke test in performance testing, and why run it before a load test?
**A:** A smoke test is a minimal run (1–5 VUs, seconds to a minute). It is not for
measuring performance; it verifies that the script, test data and environment work.
Running it first catches problems like wrong URLs, auth failures or the app being down
before we spend time on a long load test. Example: my smoke test caught the app
being down in 15 seconds (100% http_req_failed).