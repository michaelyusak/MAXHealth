import React from "react";

type managerFooterProps = {
  withoutSideNav?: boolean;
};

const ManagerFooter = ({
  withoutSideNav,
}: managerFooterProps): React.ReactElement => {
  return (
    <div
      className={`${withoutSideNav ? "pl-[80px]" : "pl-[250px]"} w-[100%] py-[5px]`}
    >
      <p>&copy; 2024 - MaxHealth, All rights reserved.</p>
    </div>
  );
};

export default ManagerFooter;
