import config from './config';
import database from './database';
import { askForConfirmation, askIfRealRun } from './prompts';

const BONUS_AMOUNT = 100; // 100 AMANA

const main = async(): Promise<void> => {
  const isRealRun = await askIfRealRun();
  console.log(`Beginning a ${isRealRun ? 'production' : 'test'} run of the AMANA bonus payout.`);
  const balances = await database.getPositiveBalances();
  const payments = Object.entries(balances)
    .map(([manifolduserid, balance]) => ({
      manifolduserid,
      balance,
      bonus: BONUS_AMOUNT,
    }));
  payments.forEach((payment) => {
    console.log(`${isRealRun ? 'Will' : 'Would'} pay a bonus of ${payment.bonus} to ${payment.manifolduserid} because they have deposited ${payment.balance} more MANA than they have withdrawn.`);
  });
  const totalPayout = payments.reduce((acc, payment) => acc + payment.bonus, 0);
  console.log(`The total bonus payout ${isRealRun ? 'will' : 'would'} be ${totalPayout} MANA in ${payments.length} payments.`);
  if (!isRealRun) {
    console.log('This was a test run, so no payments were actually made. Exiting now.');
    return;
  }
  const confirmed = await askForConfirmation(totalPayout);
  if (!confirmed) {
    console.log('The total bonus payout was not confirmed, so no payments were made. Exiting now.');
    return;
  }
  console.log('The total bonus payout was confirmed, so the payments will now be made.');
  for (const payment of payments) {
    const { bonus, manifolduserid } = payment;
    console.log(`Submitting the bonus payment of ${bonus} to ${manifolduserid}...`);
    const railgunAddress = await database.getDepositAddress(manifolduserid);
    console.log(`The railgun address for ${manifolduserid} is ${railgunAddress}.`);
    await database.createDeposit(railgunAddress, config.botUserID, bonus);
    console.log(`The bonus payment of ${payment.bonus} to ${payment.manifolduserid} at ${railgunAddress} was successfully entered into the database as a deposit to be processed.`);
  }
  console.log('All bonus payments have been successfully submitted.');
};

main().catch((error) => {
  console.error('error', error);
});
