import React, { useEffect, useState } from "react";
import CardCategory from "./CardCategory";
import { CategoryData } from "../interfaces/Category";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAppDispatch } from "../redux/reduxHooks";
import { store } from "../slices/InitailCategoryFilter";
import { IconButton } from "@material-tailwind/react";
import { IconContext } from "react-icons";
import { HandleGet } from "../util/API";
import CardCategoryLoading from "./CardCategoryLoading";
import { VscDebugDisconnect } from "react-icons/vsc";

const Category = (): React.ReactElement => {
  const [categoryData, setCategoryData] = useState<CategoryData[]>();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [categoriesPerPage, setCategoriesPerPage] = useState<number>(
    handleCategoryPerPage()
  );
  const [currentCategoryData, setCurrentCategoryData] =
    useState<CategoryData[]>();

  const dispatch = useAppDispatch();

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const fetchDataCategory = async () => {
    const url = import.meta.env.VITE_HTTP_BASE_URL + "/categories/";

    setLoading(true);

    HandleGet<CategoryData[]>(url)
      .then((data) => {
        setCategoryData(data);
      })
      .catch((error: Error) => {
        console.log(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  function handleCategoryPerPage(): number {
    const width = window.innerWidth;

    return width >= 1391
      ? 8
      : width >= 1280
      ? 6
      : width >= 1195
      ? 10
      : width >= 989
      ? 8
      : width >= 782
      ? 6
      : width >= 768
      ? 4
      : width >= 671
      ? 8
      : width >= 523
      ? 6
      : width >= 375
      ? 4
      : 2;
  }

  useEffect(() => {
    const handleResize = () => {
      setCategoriesPerPage(handleCategoryPerPage());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    fetchDataCategory();
  }, []);

  useEffect(() => {
    if (!categoryData) {
      return;
    }

    setCurrentCategoryData(
      categoryData.slice(
        (currentPage - 1) * categoriesPerPage,
        currentPage * categoriesPerPage
      )
    );
  }, [categoriesPerPage, categoryData, currentPage]);

  // const startIndex = (currentPage - 1) * categoriesPerPage;
  // const endIndex = startIndex + categoriesPerPage;
  // const currentCategoryData = categoryData.slice(startIndex, endIndex);

  return (
    <div className="items-start p-3 md:px-0 flex flex-col md:items-center gap-[30px] bg-[#f6f7fb] md:py-10">
      <h1 className="font-extrabold md:text-[50px] text-[#000D44] capitalize text-[30px]">
        Explore Our Product and Services
      </h1>

      {currentCategoryData ? (
        <div className="flex items-center py-[10px] justify-between md:px-[50px] w-[100%]">
          <IconButton
            placeholder={""}
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
            size="md"
            disabled={currentPage <= 1}
            onClick={handlePreviousPage}
          >
            <IconContext.Provider value={{ size: "20px", color: "#374151" }}>
              <FaArrowLeft></FaArrowLeft>
            </IconContext.Provider>
          </IconButton>

          <div className="w-full xl:h-[400px] h-[400px] gap-x-[5px] gap-y-[10px] grid grid-cols-[repeat(auto-fit,_minmax(140px,_1fr))] md:grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] xl:grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] content-center justify-items-center place-content-start">
            {currentCategoryData.map((data) => (
              <Link
                key={data.category_id}
                to="/product"
                onClick={() => dispatch(store(data.category_id.toString()))}
              >
                <CardCategory categoryData={data} key={data.category_id} />
              </Link>
            ))}
          </div>

          <IconButton
            placeholder={""}
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
            size="md"
            disabled={
              (currentCategoryData &&
                currentCategoryData.length < categoriesPerPage) ||
              (categoryData &&
                categoriesPerPage * currentPage >= categoryData.length)
            }
            onClick={handleNextPage}
          >
            <IconContext.Provider value={{ size: "20px", color: "#374151" }}>
              <FaArrowRight></FaArrowRight>
            </IconContext.Provider>
          </IconButton>
        </div>
      ) : isLoading ? (
        <div className="flex items-center py-[10px] justify-between md:px-[50px] w-[100%]">
          <IconButton
            placeholder={""}
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
            size="md"
            disabled
            onClick={handlePreviousPage}
          >
            <IconContext.Provider value={{ size: "20px", color: "#374151" }}>
              <FaArrowLeft></FaArrowLeft>
            </IconContext.Provider>
          </IconButton>

          <div className="w-full xl:h-[400px] h-[400px] gap-x-[5px] gap-y-[10px] grid grid-cols-[repeat(auto-fit,_minmax(140px,_1fr))] md:grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] xl:grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] content-center justify-items-center place-content-start">
            {Array.from({ length: categoriesPerPage }).map((_, i) => (
              <CardCategoryLoading key={i}></CardCategoryLoading>
            ))}
          </div>

          <IconButton
            placeholder={""}
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
            size="md"
            disabled
            onClick={handleNextPage}
          >
            <IconContext.Provider value={{ size: "20px", color: "#374151" }}>
              <FaArrowRight></FaArrowRight>
            </IconContext.Provider>
          </IconButton>
        </div>
      ) : (
        <div className="flex items-center py-[10px] justify-center md:px-[50px] w-[100%]">
          <div className="flex flex-col gap-[10px] items-center border-[1px] border-[#000E44] px-[20px] py-[5px] rounded-xl md:rounded-2xl xl:rounded-3xl">
            <IconContext.Provider value={{ size: "250px", color: "#000E44" }}>
              <VscDebugDisconnect></VscDebugDisconnect>
            </IconContext.Provider>

            <p className="text-center text-[20px] md:text-[24px] font-[600] capitalize">
              something went wrong on our side
            </p>
          </div>
        </div>
      )}

      {/* <div className="flex items-center py-[10px] justify-between md:px-[50px] w-[100%]">
        <IconButton
          placeholder={""}
          onPointerEnterCapture={() => {}}
          onPointerLeaveCapture={() => {}}
          size="md"
          disabled={currentPage <= 1}
          onClick={handlePreviousPage}
        >
          <IconContext.Provider value={{ size: "20px", color: "#374151" }}>
            <FaArrowLeft></FaArrowLeft>
          </IconContext.Provider>
        </IconButton>

        <div className="w-full xl:h-[400px] h-[400px] gap-x-[5px] gap-y-[10px] grid grid-cols-[repeat(auto-fit,_minmax(140px,_1fr))] md:grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] xl:grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] content-center justify-items-center place-content-start">
          {currentCategoryData.map((data) => (
            <Link
              key={data.category_id}
              to="/product"
              onClick={() => dispatch(store(data.category_id.toString()))}
            >
              <CardCategory categoryData={data} key={data.category_id} />
            </Link>
          ))}
        </div>

        <IconButton
          placeholder={""}
          onPointerEnterCapture={() => {}}
          onPointerLeaveCapture={() => {}}
          size="md"
          disabled={
            categoryData.length < categoriesPerPage ||
            endIndex >= categoryData.length
          }
          onClick={handleNextPage}
        >
          <IconContext.Provider value={{ size: "20px", color: "#374151" }}>
            <FaArrowRight></FaArrowRight>
          </IconContext.Provider>
        </IconButton>
      </div> */}
    </div>
  );
};

export default Category;
