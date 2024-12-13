import { query } from "../utils/db";
import { getAccount } from "./accountHandler";

export const withdrawal = async (accountID: string, amount: number) => {
  if (amount < 0) {
    throw new Error("Withdrawal amount cannot be negative");
  }
  if (amount > 200) {
    throw new Error("Withdrawal amount cannot exceed $200");
  }
  if (amount == 0 || amount % 5 !== 0) {
    throw new Error("Withdrawal amount must be divisible by $5");
  }

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dateString = today.toISOString().split('T')[0];
  const withdrawals = await query(`
    SELECT CAST(COALESCE(SUM(amount), 0) as INTEGER) as sum
    FROM WITHDRAWALS
    WHERE account_number = $1 AND date > $2 AND date < $3`,
    [accountID, dateString, tomorrow.toISOString().split('T')[0]]
  );
  if (withdrawals + amount > 400) {
    throw new Error("Withdrawal amount exceeds 400 for the day");
  }

  const account = await getAccount(accountID);
  if (account.type !== "credit" && amount > account.amount) {
    throw new Error("Insufficient funds");
  }
  if (account.type === "credit" && amount > account.creditLimit) {
    throw new Error("Credit limit exceeded");
  }

  account.amount -= amount;
  const res = await query(`
    UPDATE accounts
    SET amount = $1 
    WHERE account_number = $2`,
    [account.amount, accountID]
  );

  if (res.rowCount === 0) {
    throw new Error("Failed to update account");
  }

  const newWithdrawal = await query(`
    INSERT INTO withdrawals (account_number, amount, date)
    VALUES ($1, $2, NOW())
    RETURNING *`,
    [accountID, amount]
  );

  if (newWithdrawal.rowCount === 0) {
    throw new Error("Failed to create withdrawal record");
  }

  return account;
}

export const deposit = async (accountID: string, amount: number) => {
  if (amount < 0) {
    throw new Error("Deposit amount cannot be negative");
  }

  if (amount > 1000) {
    throw new Error("Deposit amount cannot exceed $1000");
  }

  const account = await getAccount(accountID);
  if (account.type === "credit" && amount > Math.abs(account.balance)) {
    throw new Error("Cannot desposit more than needed to zero out account");
  }

  account.amount += amount;
  const res = await query(`
    UPDATE accounts
    SET amount = $1 
    WHERE account_number = $2`,
    [account.amount, accountID]
  );

  if (res.rowCount === 0) {
    throw new Error("Transaction failed");
  }

  return account;
}
