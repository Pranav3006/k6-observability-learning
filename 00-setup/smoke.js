import http from 'k6/http';
import { check, sleep } from 'k6';

// 2 virtual users for 15 seconds: a "smoke" test proves the script and app work
export const options = {
  vus: 2,
  duration: '15s',
  thresholds: {
    http_req_failed: ['rate<0.01'],   // under 1% errors
    http_req_duration: ['p(95)<300'], // 95% of requests faster than 300 ms
  },
};

export default function () {
  const res = http.get('http://localhost:8080/');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1); // "think time", like a real user pausing between clicks
}