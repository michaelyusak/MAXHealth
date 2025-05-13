import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import NotMaximCard from "../components/NotMaximCard";

const ShowAck = (): React.ReactElement => {
  const [isShowAck, setIsShowAck] = useState<boolean>(true);

  const location = useLocation();

  useEffect(() => {
    setIsShowAck(true);
  }, [location]);
  return (
    <>
      <Outlet></Outlet>
      {isShowAck && (
        <NotMaximCard onClose={() => setIsShowAck(false)}></NotMaximCard>
      )}
    </>
  );
};

export default ShowAck;
