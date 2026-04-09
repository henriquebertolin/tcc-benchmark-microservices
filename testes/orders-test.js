import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 25,
  duration: '20s',
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<1500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const payload = JSON.stringify({
    userEmail: 'henrique@upf.br',
    amount: 100,
    description: 'Pedido benchmark'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post('http://localhost:3001/orders', payload, params);

  check(res, {
    'status 200 ou 201': (r) => r.status === 200 || r.status === 201,
  });
}
