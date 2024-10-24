import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaSearch } from "react-icons/fa";
import { MdOutlineFilterList } from "react-icons/md";
import { CategoryData } from "../interfaces/Category";
import { HandleGet } from "../util/API";
import { BsDashLg } from "react-icons/bs";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";

type filterProps = {
  onSelectCategory: (id: number) => void;
  onApplyPrice: (minPrice: number, maxPrice: number) => void;
  initialCategoryId: string;
  onSearch: (searchParams: string) => void;
};

const Filter = ({
  onSelectCategory,
  onApplyPrice,
  initialCategoryId,
  onSearch,
}: filterProps): React.ReactElement => {
  const { setToast } = useContext(ToastContext);
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);

  useEffect(() => {
    const url = import.meta.env.VITE_HTTP_BASE_URL + "/categories/";

    HandleGet<CategoryData[]>(url)
      .then((responseData) => {
        setCategories(responseData);

        const newList: string[] = [];
        responseData.forEach((category: CategoryData) => {
          newList.push(category.category_name);
        });
        setCategoryNames(newList);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      });
  }, [setToast]);

  function getIdByName(name: string): number {
    let id = 0;

    categories.forEach((category) => {
      if (category.category_name == name) {
        id = category.category_id;
      }
    });

    return id;
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { value: searchTerm } = event.target;

    if (searchTerm.trim() === "") {
      searchTerm = "";
    }

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      onSearch(searchTerm);
    }, 1000);
  };

  function getNameById(id: string): string {
    let name = "";

    categories.forEach((category) => {
      if (category.category_id == +id) {
        name = category.category_name;
      }
    });

    return name;
  }

  useEffect(() => {
    let name = "";

    categories.forEach((category) => {
      if (category.category_id == +initialCategoryId) {
        name = category.category_name;
      }
    });

    setSelectedCategory(name);
  }, [initialCategoryId, categories]);

  const [selectedCategory, setSelectedCategory] = useState<string>(
    getNameById(initialCategoryId)
  );
  const [isShowCategory, setIsShowCategory] = useState<boolean>(true);
  const [isShowPrice, setIsShowPrice] = useState<boolean>(true);

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);

  function handleSetPrice(
    e: ChangeEvent<HTMLInputElement>,
    key: "min" | "max"
  ) {
    if (e.target.value == "") {
      key == "min" && setMinPrice(0);
      key == "max" && setMaxPrice(0);
      return;
    }

    if (isNaN(+e.target.value)) {
      return;
    }

    key == "min" && setMinPrice(+e.target.value);
    key == "max" && setMaxPrice(+e.target.value);
  }

  const handleCategoryClick = (category: string) => {
    if (selectedCategory == category) {
      setSelectedCategory("");
      onSelectCategory(0);

      return;
    }

    setSelectedCategory(category);
    onSelectCategory(getIdByName(category));
  };

  const handleShowMenu = (menuType: string) => {
    if (menuType === "category") {
      setIsShowCategory(!isShowCategory);
    } else if (menuType === "price") {
      setIsShowPrice(!isShowPrice);
    }
  };

  return (
    <div className="w-[100%] md:w-[30%] flex flex-col gap-2">
      <div className=" relative text-gray-600 flex items-center gap-1 bg-slate-100 rounded-md p-2">
        <p className="w-[40%]">Drug Name</p>
        <input
          className="w-[100%] border-2 border-gray-300 bg-white h-9 px-5 pr-16 rounded-lg text-sm focus:outline-none "
          type="search"
          name="search"
          placeholder="Search Drugs"
          onChange={handleInputChange}
        />
        <button type="submit" className="absolute right-0 top-4 mr-4">
          <FaSearch />
        </button>
      </div>
      <div className="flex justify-between bg-slate-100 rounded-md p-4 items-center">
        <p className="flex text-xl gap-1 items-center">
          <MdOutlineFilterList /> Filter
        </p>
        <button
          onClick={() => {
            handleCategoryClick("");
            setMaxPrice(0);
            setMinPrice(0);
            onApplyPrice(0, 0);
          }}
          className="text-xl cursor-pointer"
        >
          Reset
        </button>
      </div>
      <div className="bg-slate-100 rounded-md p-4 flex flex-col gap-2">
        <div className="flex justify-between">
          <p className="text-[20px] font-[600]">Category</p>
          <button
            className="text-xl"
            onClick={() => handleShowMenu("category")}
          >
            {isShowCategory ? <FaArrowUp /> : <FaArrowDown />}
          </button>
        </div>
        {isShowCategory && (
          <div
            id="category-list"
            className="h-[300px] flex flex-col overflow-y-auto gap-[5px]"
            style={{ scrollbarWidth: "thin" }}
          >
            {categoryNames.map((category, i) => (
              <button
                key={i}
                id="selected-category"
                className={`text-[18px] py-[5px] text-left px-[10px] rounded-[5px] mr-[5px] ${
                  selectedCategory == category
                    ? "bg-[#14C57B] text-white"
                    : "hover:bg-[#DFF1FD]"
                }`}
                onClick={() => {
                  handleCategoryClick(category);
                }}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-100 rounded-md p-4 flex flex-col gap-[15px]">
        <div className="flex justify-between">
          <p className="text-[20px] font-[600]">Price</p>
          <button className="text-xl" onClick={() => handleShowMenu("price")}>
            {isShowPrice ? <FaArrowUp /> : <FaArrowDown />}
          </button>
        </div>
        {isShowPrice && (
          <div className="items-end flex flex-col gap-[10px]">
            <div className="flex justify-between items-center">
              <input
                className="w-[45%] px-[10px] py-[2px] rounded-xl text-[18px] border-2 border-slate-400"
                type="text"
                value={minPrice == 0 ? "" : minPrice}
                onChange={(e) => handleSetPrice(e, "min")}
                placeholder="Min Price"
              ></input>
              <BsDashLg></BsDashLg>
              <input
                className="w-[45%] px-[10px] py-[2px] rounded-xl text-[18px] border-2 border-slate-400"
                type="text"
                placeholder="Max Price"
                value={maxPrice == 0 ? "" : maxPrice}
                onChange={(e) => handleSetPrice(e, "max")}
              ></input>
            </div>
            <button
              onClick={() => onApplyPrice(minPrice, maxPrice)}
              className="bg-[#14C57B] text-white w-fit px-[15px] py-[5px] rounded-xl font-[600]"
            >
              Apply Price Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filter;
