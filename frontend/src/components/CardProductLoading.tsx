import React from "react";

type cardProductLoadingProps = {
  itemCount: number;
};

const CardProductLoading = ({
  itemCount,
}: cardProductLoadingProps): React.ReactElement => {
  return (
    <>
      {[...Array(itemCount)].map((_, i) => (
        <div
          key={i}
          id={i.toString()}
          className="w-[180px] md:w-[200px] xl:w-[240px] h-[270px] md:h-[350px] xl:h-[350px] bg-gray-400 animate-pulse flex flex-col p-[10px] gap-[10px] shadow-[0px_0px_15px_0px_rgba(0,0,0,0.3)] rounded-xl"
        ></div>
      ))}
    </>
  );
};

export default CardProductLoading;
