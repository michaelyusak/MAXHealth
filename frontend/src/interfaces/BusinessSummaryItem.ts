export interface IBusinessSummaryItem {
  category:
    | "All Order"
    | "Awaiting Payment Order"
    | "Awaiting Approval Order"
    | "Pending Order"
    | "Sent Order"
    | "Confirmed Order"
    | "Canceled Order";
  value: number;
  onClick: () => void;
}
