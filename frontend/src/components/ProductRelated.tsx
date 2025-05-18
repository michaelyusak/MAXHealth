import React, { useCallback, useContext, useEffect, useState } from "react";
import CardProduct from "./CardProduct";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IDrugListResponse } from "../interfaces/Drug";
import { HandleGet } from "../util/API";
import CardProductLoading from "./CardProductLoading";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";

type productRelatedProps = {
  categoryId: number;
  isTokenValid: boolean;
  loc: {lat: string, long: string}
};

const ProductRelated = ({
  categoryId,
  isTokenValid,
  loc
}: productRelatedProps): React.ReactElement => {
  const { setToast } = useContext(ToastContext);

  const [relatedDrugList, setRelatedDrugList] = useState<IDrugListResponse>();
  const [page, setPage] = useState<number>(1);

  function handleSetPage(diff: number) {
    if (!relatedDrugList) {
      return;
    }

    if (diff > 0 && page < relatedDrugList.page_info.page_count) {
      setPage(page + 1);
      return;
    }

    if (diff < 0 && page > 1) {
      setPage(page - 1);
      return;
    }
  }

  const fetchDrugList = useCallback(
    (latitude: string, longitude: string, targetPage: number) => {
      const url =
        import.meta.env.VITE_HTTP_BASE_URL +
        `/drugs?lat=${latitude}&long=${longitude}&category=${categoryId}&limit=10&page=${targetPage}`;
      HandleGet<IDrugListResponse>(url)
        .then((responseData) => {
          setRelatedDrugList(responseData);
        })
        .catch((error: Error) => {
          HandleShowToast(setToast, false, error.message, 5);
        });
    },
    [
      categoryId,
      setToast,
    ]
  );

  useEffect(() => {
    setRelatedDrugList(undefined);

    fetchDrugList(loc.lat, loc.long, page)
  }, [page]);

  return (
    <div className="flex flex-col gap-3 my-5 p-2 md:p-0 xl:px-[50px]">
      <div className="flex justify-between">
        <h1 className="text-[#000D44] font-bold text-3xl">Related Product</h1>
        <div className="flex text-3xl gap-6">
          <button
            onClick={() => handleSetPage(-1)}
            className="disabled:opacity-50"
            disabled={page <= 1}
          >
            <FaArrowAltCircleLeft />
          </button>
          <button
            onClick={() => handleSetPage(1)}
            className="disabled:opacity-50"
            disabled={page == relatedDrugList?.page_info.page_count}
          >
            <FaArrowAltCircleRight />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(170px,_1fr))] md:grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] xl:grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))] gap-[20px] w-[100%] min-h-[350px] place-content-start justify-items-center">
        {relatedDrugList ? (
          relatedDrugList?.drug_list.map((pharmacyDrug) => (
            <Link
              key={pharmacyDrug.pharmacy_drug_id}
              to={`/product/${pharmacyDrug.drug_id}`}
            >
              <CardProduct
                showAddToCartButton={isTokenValid}
                pharmacyDrug={pharmacyDrug}
              ></CardProduct>
            </Link>
          ))
        ) : (
          <>
            <CardProductLoading itemCount={10}></CardProductLoading>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductRelated;
