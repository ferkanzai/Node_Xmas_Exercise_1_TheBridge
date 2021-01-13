const fs = require('fs');
const path = require('path');

const read = async (path) => {
  const raw = await fs.readFileSync(path);
  return JSON.parse(raw);
};

const write = async (path, content) => {
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
  await fs.writeFileSync(path, contentStr);
};

const createError = (message, code) => {
  const error = new Error(message);
  error.code = code;
  throw error;
};

const checkPresentsForMoney = (arr, money = 0, newPresents = []) => {
  if (!arr.length) return newPresents;
  if (money >= arr[0].price) {
    newPresents.push(arr[0].present);
    money -= arr[0].price;
  }
  return checkPresentsForMoney(arr.splice(1), money, newPresents);
};

module.exports = {
  read,
  write,
  createError,
  checkPresentsForMoney,
};
