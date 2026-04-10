import { useMutationGraphQL } from '../../../hooks/useQueryTanstack';

const RECOVERY_PASSWORD_MUTATION = `
  mutation RecoveryPassword($email: String!) {
    recoveryPassword(email: $email) {
      code
      message
    }
  }
`;

export interface RecoveryPasswordResponse {
  recoveryPassword: {
    code: string;
    message: string;
  };
}

export const useRecoveryPasswordMutation = () => {
  return useMutationGraphQL({ query: RECOVERY_PASSWORD_MUTATION });
};
