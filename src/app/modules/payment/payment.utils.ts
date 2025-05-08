import { v4 as uuidv4 } from 'uuid';

function generateTransactionId() {
  const uuid = uuidv4();
  const alphanumeric = uuid.replace(/[^a-z0-9]/gi, '');
  return `TRX-${alphanumeric.substring(0, 10).toUpperCase()}`;
}

const PaymentUtils = {
  generateTransactionId,
};

export default PaymentUtils;
