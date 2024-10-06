import React, { ChangeEvent, useEffect, useState } from "react";
import { MdArrowForwardIos } from "react-icons/md";
import ItemSelector from "./ItemSelector";

type paginationInfoProps = {
  totalPage: number;
  activePage: number;
  setPage: (page: number) => void;
  minItemPerPage?: number;
  maxItemPerPage?: number;
  stepItemPerPage?: number;
  itemPerPage?: number;
  setItemPerPage?: (itemPerPage: string) => void;
  withItemPerPage?: boolean;
};

const PaginationInfo = ({
  totalPage,
  activePage,
  setPage,
  minItemPerPage,
  maxItemPerPage,
  stepItemPerPage,
  setItemPerPage,
  itemPerPage,
  withItemPerPage,
}: paginationInfoProps): React.ReactElement => {
  const displayedPageButtons: number[] = [];

  const firstPage: number = activePage === 1 ? 1 : activePage - 1;

  for (
    let i = firstPage;
    displayedPageButtons.length < 3 && i <= (totalPage ?? 1);
    i++
  ) {
    displayedPageButtons.push(i);
  }

  const [inputPage, setInputPage] = useState<string>(activePage.toString());
  function handleInputPageOnChange(e: ChangeEvent<HTMLInputElement>) {
    if (isNaN(+e.target.value) && e.target.value != "") {
      return;
    }

    setInputPage(e.target.value);
  }

  useEffect(() => {
    setInputPage(activePage.toString());
  }, [activePage]);

  function handleInputPageOnKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key != "Enter") {
      return;
    }

    if (inputPage == "") {
      return;
    }

    if (+inputPage < 1 || +inputPage > totalPage) {
      return;
    }

    setPage(+inputPage);
  }

  function itemPerPageOptions(
    step: number,
    min: number,
    max: number
  ): string[] {
    const opts: string[] = [];

    for (let i = min; i <= max; i += step) {
      opts.push(i.toString());
    }

    return opts;
  }

  return (
    <div className="flex items-center gap-[20px] flex-col md:flex-row">
      <div className="flex w-fit items-center justify-between gap-[5px]">
        {activePage > 1 && (
          <button
            className="flex items-center px-[8px] py-[5px] border-2 border-slate-400 rounded-[8px]"
            onClick={() => setPage(activePage - 1)}
            disabled={activePage == 1}
          >
            <MdArrowForwardIos className="rotate-180"></MdArrowForwardIos>
            <p>Previous</p>
          </button>
        )}
        <div className="flex justify-start w-[100%] gap-[5px]">
          {displayedPageButtons.map((page, i) => (
            <button
              key={i}
              onClick={() => setPage(page)}
              className={`px-[8px] py-[5px] border-2 rounded-[8px] ${
                activePage === page
                  ? "bg-navy text-white border-navy"
                  : "border-slate-400"
              }`}
            >
              {page}
            </button>
          ))}
          {displayedPageButtons.length >= 3 &&
            displayedPageButtons[displayedPageButtons.length - 1] !==
              totalPage && <div className="tracking-[5px] h-[20px]">...</div>}

          {displayedPageButtons[displayedPageButtons.length - 1] !==
            totalPage && (
            <button
              className="px-[8px] py-[5px] border-2 border-slate-400 rounded-[8px]"
              onClick={() => setPage(totalPage)}
            >
              {totalPage}
            </button>
          )}
        </div>
        {activePage < totalPage && (
          <button
            className="flex items-center  px-[8px] py-[5px] border-2 border-slate-400 rounded-[8px]"
            onClick={() => setPage(activePage + 1)}
            disabled={activePage == totalPage}
          >
            <p>Next</p>
            <MdArrowForwardIos></MdArrowForwardIos>
          </button>
        )}
      </div>

      <p className="w-[100px] text-center">
        <b>{activePage}</b>/{totalPage}
      </p>
      <div className="flex items-center gap-[10px]">
        <p>To page: </p>
        <input
          type="text"
          value={inputPage}
          onChange={(e) => handleInputPageOnChange(e)}
          className="w-[60px] px-[8px] py-[5px] border-2 border-slate-400 rounded-[8px]"
          onKeyDown={(e) => handleInputPageOnKeyDown(e)}
        ></input>
      </div>
      {withItemPerPage &&
        stepItemPerPage &&
        minItemPerPage &&
        maxItemPerPage &&
        itemPerPage &&
        setItemPerPage && (
          <div className="flex h-[20px] items-center gap-[10px] w-[200px]">
            <p>Item per page: </p>
            <ItemSelector
              items={itemPerPageOptions(
                stepItemPerPage,
                minItemPerPage,
                maxItemPerPage
              )}
              placeholder=""
              height="20px"
              value={itemPerPage.toString()}
              setValue={(value) => {
                setPage(1);
                setItemPerPage(value);
              }}
              expandTop={true}
            ></ItemSelector>
          </div>
        )}
    </div>
  );
};

export default PaginationInfo;
