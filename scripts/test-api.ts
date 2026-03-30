import dotenv from 'dotenv';
import path from 'path';
// .env.local 로드 - 반드시 import들 보다 위에 있어야 함(을 보장하기 위해 최상단 위치)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { fetchChungyakHome } from '../src/lib/api/chungyak-home';
import { fetchLH } from '../src/lib/api/lh';

async function runTest() {
    console.log('--- API Connectivity Test Start ---');
    console.log('ENV KEYS CHECK:');
    console.log('NEXT_PUBLIC_PUBLIC_DATA_KEY:', process.env.NEXT_PUBLIC_PUBLIC_DATA_KEY ? 'EXISTS' : 'MISSING');
    console.log('LH_API_KEY:', process.env.LH_API_KEY ? 'EXISTS' : 'MISSING');

    console.log('\nFetching Data...');

    const tasks = [
        { name: 'HOME', fn: fetchChungyakHome },
        { name: 'LH', fn: fetchLH },
    ];

    for (const task of tasks) {
        try {
            console.log(`\n[${task.name}] Requesting...`);
            const res = await task.fn();
            console.log(`[${task.name}] Result: ${res.length} items`);
        } catch (err: any) {
            console.error(`[${task.name}] FATAL ERROR:`, err.message);
        }
    }
}

runTest();
