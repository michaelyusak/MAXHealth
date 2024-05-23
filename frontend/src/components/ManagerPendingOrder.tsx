import React from "react";
import { IOrderPharmacy } from "../interfaces/Order";
import ManagerPendingOrderItem from "./ManagerPendingOrderItem";

type managerPendingOrderProps = {
  pendingOrders: IOrderPharmacy[];
  refetchOrder: () => void;
};

const ManagerPendingOrder = ({
  pendingOrders,
  refetchOrder,
}: managerPendingOrderProps): React.ReactElement => {
  return (
    <div className="w-full h-[100%] bg-white rounded-[8px] p-[10px] flex flex-col gap-[20px]">
      <h1 className="text-[18px] font-[600] border-b-2">Pending Orders</h1>
      <div
        className="flex flex-col gap-[5px] overflow-y-auto h-full"
        style={{ scrollbarWidth: "thin" }}
      >
        {pendingOrders.length > 0 ? (
          <>
            {pendingOrders.map((order) => (
              <ManagerPendingOrderItem
                key={order.order_pharmacy_id}
                order={order}
                refetchOrder={refetchOrder}
              />
            ))}
          </>
        ) : (
          <div className="h-full flex flex-col justify-center items-center">
            <p className="text-center text-navy font-bold text-[17px]">
              No orders
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerPendingOrder;
