import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL;
const RATE = Number(__ENV.RATE || 10);
const DURATION = __ENV.DURATION || '5m';

export const options = {
    scenarios: {
        baseline_orders: {
            executor: 'constant-arrival-rate',
            rate: RATE,
            timeUnit: '1s',
            duration: DURATION,
            preAllocatedVUs: 30,
            maxVUs: 150,
        },
    },

    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<2000', 'p(99)<4000'],
    },

    summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
};

export default function () {
    const payload = JSON.stringify({
        userEmail: 'dummy@upf.br',
        amount: 100,
        description: 'Pedido benchmark k6',
    });

    const res = http.post(`${BASE_URL}/orders`, payload, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (res.status !== 200 && res.status !== 201) {
        console.log(`ERRO: ${res.status} - ${res.body}`);
    }

    check(res, {
        'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    });
}