import inquirer from 'inquirer';
import { isObjectRecord } from './types';

export const askIfRealRun = async(): Promise<boolean> => {
  const answers: unknown = await inquirer.prompt([
    {
      type: 'list',
      name: 'runMode',
      message: 'What type of run do you want to perform?',
      choices: [
        { name: 'Test Run ("Dry Run")', value: 'test' },
        { name: 'Production Run', value: 'real' },
      ],
      default: 'test',
    },
  ]);
  if (!isObjectRecord(answers)) {
    throw new Error('Invalid answers');
  }
  const isRealRun = answers.runMode === 'real';
  return isRealRun;
};

export const askForConfirmation = async(amount: number): Promise<boolean> => {
  const answers: unknown = await inquirer.prompt([
    {
      type: 'input',
      name: 'confirmation',
      message: `Please type in the total payout amount (${amount}) to confirm that you wish to send the bonus payments:`,
    },
  ]);
  if (!isObjectRecord(answers)) {
    throw new Error('Invalid answers');
  }
  return answers.confirmation === `${amount}`;
};
