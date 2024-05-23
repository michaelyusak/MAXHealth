export interface IInputField {
  type:
    | "email"
    | "password"
    | "confirmPassword"
    | "text"
    | "file"
    | "name"
    | "picture"
    | "date"
    | "binary";
  name: string;
  placeholder?: string;
  isRequired: boolean;
  additionalClassName?: string;
  isForLogin?: boolean;
  minLength?: number;
  maxLength?: number;
  fileFormat?: string[];
  maxFileSize?: number;
  withConfirmPassword?: boolean;
  readOnly?: boolean;
  options?: { label: string; value: number }[];
}
