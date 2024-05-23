export const PasswordRegex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*\\W?)[a-zA-Z\\d\\W]{8,}$"
);

export const EmailRegex = new RegExp(
  "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}"
);

export const NameRegex = new RegExp("^[a-zA-Z]+(?: [a-zA-Z]+)*$");

export const AlphaNumericRegex = new RegExp("^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$");

export const SpecialNameRegex = new RegExp(
  "(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*()-_=+\\[\\]{};:'\",.<>\\/?\\\\|]+(?: [a-zA-Z0-9!@#$%^&*()-_=+\\[\\]{};:'\",.<>\\/?\\\\|]+)*$"
);
