const DoubanCardSkeleton = () => {
  return (
    <div className='w-full'>
      <div className='group relative w-full rounded-lg bg-transparent shadow-none flex flex-col'>
        {/* 海报骨架 - 2:3 比例 */}
        <div className='relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-200 animate-pulse dark:bg-gray-800'>
          <div className='absolute inset-0 bg-gray-300 dark:bg-gray-700'></div>
        </div>

        {/* 信息层骨架 */}
        <div className='absolute top-[calc(100%+0.5rem)] left-0 right-0'>
          <div className='flex flex-col items-center justify-center'>
            <div className='h-4 w-24 sm:w-32 bg-gray-200 rounded animate-pulse mb-2'></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoubanCardSkeleton;
