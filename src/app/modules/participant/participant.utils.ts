import { v4 as uuidv4 } from 'uuid';

const GenerateToken = () => {
  const uuid = uuidv4();
  const alphanumeric = uuid.replace(/[^a-z0-9]/gi, '');
  return alphanumeric.substring(0, 8).toUpperCase();
};

const ParticipantUtils = {
  GenerateToken,
};

export default ParticipantUtils;
