import { randomBytes } from 'crypto';
import { Pool, type QueryResult } from 'pg';
import { isObjectRecord } from './types';

const pool = new Pool({
  ssl: {
    rejectUnauthorized: false,
  },
});

const connection = {
  query: async(text: string, params: unknown[] = []): Promise<QueryResult> => (
    pool.query(text, params)
  ),
};

const getDepositTotals = async(): Promise<Record<string, number>> => {
  const query = `SELECT manifolduserid, SUM(amount)
    FROM deposits
    WHERE state='Confirmed'
    GROUP BY manifolduserid`;
  const results = await connection.query(query);
  const depositTotals: Record<string, number> = {};
  results.rows.forEach((row: unknown) => {
    if (isObjectRecord(row) && typeof row.manifolduserid === 'string' && typeof row.sum === 'string') {
      depositTotals[row.manifolduserid] = parseInt(row.sum, 10);
    }
  });
  return depositTotals;
};

const getWithdrawalTotals = async(): Promise<Record<string, number>> => {
  const query = `SELECT manifolduserid, SUM(amount)
    FROM withdrawals
    WHERE state='Confirmed'
    GROUP BY manifolduserid`;
  const results = await connection.query(query);
  const withdrawalTotals: Record<string, number> = {};
  results.rows.forEach((row: unknown) => {
    if (isObjectRecord(row) && typeof row.manifolduserid === 'string' && typeof row.sum === 'string') {
      withdrawalTotals[row.manifolduserid] = parseInt(row.sum, 10);
    }
  });
  return withdrawalTotals;
};

const getBalances = async(): Promise<Record<string, number>> => {
  const deposits = await getDepositTotals();
  const withdrawals = await getWithdrawalTotals();
  const balances = Object.keys(deposits).reduce((acc, manifolduserid) => {
    const deposit = deposits[manifolduserid];
    const withdrawal = withdrawals[manifolduserid] ?? 0;
    const balance = deposit - withdrawal;
    return {
      ...acc,
      [manifolduserid]: balance,
    };
  }, {});
  return balances;
};

const getDepositAddress = (
  async(manifolduserid: string): Promise<string> => {
    const query = `SELECT railgunaddress
    FROM deposits
    WHERE manifolduserid=$1
    ORDER BY timestamp DESC
    LIMIT 1`;
    const results = await connection.query(query, [manifolduserid]);
    if (results.rows.length === 0) {
      throw new Error(`No deposit address found for manifolduserid ${manifolduserid}`);
    }
    const row: unknown = results.rows[0];
    if (!isObjectRecord(row) || typeof row.railgunaddress !== 'string') {
      throw new Error('Invalid row');
    }
    return row.railgunaddress;
  }
);

const createDeposit = async(
  railgunAddress: string,
  manifoldUserId: string,
  amount: number,
): Promise<void> => {
  const id = randomBytes(32).toString('hex');
  const timestamp = Date.now();
  const state = 'Requested';
  const manifoldTransferId = `bonus:${id}`;
  const query = 'INSERT INTO Deposits (id, timestamp, railgunAddress, manifoldTransferId, manifoldUserId, amount, state) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING';
  const parameters = [
    id,
    timestamp,
    railgunAddress,
    manifoldTransferId,
    manifoldUserId,
    amount,
    state,
  ];
  await connection.query(query, parameters);
};

export default {
  getDepositTotals,
  getWithdrawalTotals,
  getBalances,
  getDepositAddress,
  createDeposit,
};
