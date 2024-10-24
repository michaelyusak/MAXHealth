import React, { useEffect, useState } from "react";
import CardCategory from "./CardCategory";
import { CategoryData } from "../interfaces/Category";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAppDispatch } from "../redux/reduxHooks";
import { store } from "../slices/InitailCategoryFilter";
import { IconButton } from "@material-tailwind/react";
import { IconContext } from "react-icons";

const Category = (): React.ReactElement => {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [categoriesPerPage, setCategoriesPerPage] = useState<number>(
    window.innerWidth <= 768 ? 4 : 8
  );

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
    try {
      const response = await fetch(
        import.meta.env.VITE_HTTP_BASE_URL + "/categories/"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const categoriesData = await response.json();
      setCategoryData(categoriesData.data);
    } catch (error) {
      setError(error instanceof Error ? error : new Error("An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setCategoriesPerPage(window.innerWidth <= 768 ? 4 : 8);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    fetchDataCategory();
  }, []);

  const startIndex = (currentPage - 1) * categoriesPerPage;
  const endIndex = startIndex + categoriesPerPage;
  const currentCategoryData = categoryData.slice(startIndex, endIndex);

  const isArrowLeftDisabled = currentPage <= 1;
  const isArrowRightDisabled =
    categoryData.length < categoriesPerPage || endIndex >= categoryData.length;

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!categoryData) return <p>No data</p>;

  return (
    <div className="items-start p-3 md:px-0 flex flex-col md:items-center gap-[30px] bg-[#f6f7fb] md:py-10">
      <h1 className="font-extrabold md:text-[50px] text-[#000D44] capitalize text-[30px]">
        Explore Our Product and Services
      </h1>
      <div className="flex items-center py-[10px] justify-between md:px-[50px] w-[100%]">
        <IconButton
          placeholder={""}
          onPointerEnterCapture={() => {}}
          onPointerLeaveCapture={() => {}}
          size="md"
          disabled={isArrowLeftDisabled}
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
          disabled={isArrowRightDisabled}
          onClick={handleNextPage}
        >
          <IconContext.Provider value={{ size: "20px", color: "#374151" }}>
            <FaArrowRight></FaArrowRight>
          </IconContext.Provider>
        </IconButton>
      </div>
    </div>
  );
};

export default Category;
