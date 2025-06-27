import { Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface DemoCardProps {
  title: string;
  poster: string;
  rate?: string;
}

function SearchCircle({
  className = "",
  fillColor = "none",
}: {
  className?: string;
  fillColor?: string;
}) {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block" }}
    >
      <circle
        cx="22"
        cy="22"
        r="20"
        stroke="white"
        strokeWidth="1.5"
        fill={fillColor}
      />
      <g>
        <foreignObject x="12" y="12" width="20" height="20">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <Search className="h-7 w-7 text-white" strokeWidth={2} />
          </div>
        </foreignObject>
      </g>
    </svg>
  );
}

const DemoCard = ({ title, poster, rate }: DemoCardProps) => {
  const [hover, setHover] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    router.push(`/aggregate?q=${encodeURIComponent(title)}`);
  };

  return (
    <div
      className="group relative w-full rounded-lg bg-transparent shadow-none flex flex-col cursor-pointer"
      onClick={handleClick}
    >
      {/* 海报图片 - 2:3 比例 */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md">
        <Image
          src={poster}
          alt={title}
          fill
          className="object-cover"
          referrerPolicy="no-referrer"
          unoptimized
        />
        {/* 评分徽章 */}
        {rate && (
          <div className="absolute top-2 right-2 min-w-[1.25rem] h-4 sm:min-w-[1.5rem] sm:h-6 bg-pink-500 rounded-full flex items-center justify-center px-1">
            <span className="text-white text-[0.5rem] sm:text-xs font-bold leading-none">
              {rate}
            </span>
          </div>
        )}
        {/* Hover 效果 */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center group">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              className={`transition-all duration-200 ${
                hover ? "scale-110" : ""
              }`}
            >
              <SearchCircle fillColor={hover ? "#22c55e" : "none"} />
            </div>
          </div>
        </div>
      </div>
      {/* 信息层 */}
      <div className="absolute top-[calc(100%+0.2rem)] left-0 right-0">
        <div className="flex flex-col items-center justify-center">
          <span className="text-gray-900 font-semibold truncate w-full text-center text-xs sm:text-sm dark:text-gray-200">
            {title}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DemoCard;
