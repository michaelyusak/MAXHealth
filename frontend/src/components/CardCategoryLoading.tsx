import React from 'react'

const CardCategoryLoading = (): React.ReactElement => {
  return (
    <div className="h-[190px] xl:h-[180px] w-[140px] md:w-[200px] xl:w-[300px] flex flex-col items-center justify-center gap-[5px] hover:translate-y-px hover:translate-x-px cursor-pointer hover:bg-gray-200 border-2 p-[5px] xl:py-[10px] xl:px-3 rounded-lg bg-slate-50">

    <div className='w-[100px] xl:w-[90px] aspect-square object-cover p-2 bg-slate-300 animate-pulse border-1 rounded-md'></div>

    <div className='h-[40px] xl:h-[20px] w-[50%] bg-gray-300 animate-pulse font-semibold text-center'></div>
  </div>
  )
}

export default CardCategoryLoading