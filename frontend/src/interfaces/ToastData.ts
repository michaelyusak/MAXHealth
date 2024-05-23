export interface IToastData {
  isSuccess: boolean | undefined;
  message: string;
  isVisible?: boolean;
  withLoginRedirection?: boolean;
}