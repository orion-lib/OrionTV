"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

// 客户端收藏 API
import { clearAllFavorites, getAllFavorites } from "@/lib/db.client";

import CapsuleSwitch from "@/components/CapsuleSwitch";
import ContinueWatching from "@/components/ContinueWatching";
import DemoCard from "@/components/DemoCard";
import PageLayout from "@/components/PageLayout";
import ScrollableRow from "@/components/ScrollableRow";
import VideoCard from "@/components/VideoCard";

interface DoubanItem {
  title: string;
  poster: string;
  rate?: string;
}

interface DoubanResponse {
  code: number;
  message: string;
  list: DoubanItem[];
}

function HomeClient() {
  const [activeTab, setActiveTab] = useState("home");
  const [hotMovies, setHotMovies] = useState<DoubanItem[]>([]);
  const [hotTvShows, setHotTvShows] = useState<DoubanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 收藏夹数据
  type FavoriteItem = {
    id: string;
    source: string;
    title: string;
    poster: string;
    episodes: number;
    source_name: string;
  };

  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const fetchDoubanData = async () => {
      try {
        setLoading(true);

        // 并行获取热门电影和热门剧集
        const [moviesResponse, tvShowsResponse] = await Promise.all([
          fetch("/api/douban?type=movie&tag=热门"),
          fetch("/api/douban?type=tv&tag=热门"),
        ]);

        if (moviesResponse.ok) {
          const moviesData: DoubanResponse = await moviesResponse.json();
          setHotMovies(moviesData.list);
        }

        if (tvShowsResponse.ok) {
          const tvShowsData: DoubanResponse = await tvShowsResponse.json();
          setHotTvShows(tvShowsData.list);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoubanData();
  }, []);

  // 当切换到收藏夹时加载收藏数据
  useEffect(() => {
    if (activeTab !== "favorites") return;

    (async () => {
      const all = await getAllFavorites();
      // 根据保存时间排序（从近到远）
      const sorted = Object.entries(all)
        .sort(([, a], [, b]) => b.save_time - a.save_time)
        .map(([key, fav]) => {
          const plusIndex = key.indexOf("+");
          const source = key.slice(0, plusIndex);
          const id = key.slice(plusIndex + 1);
          return {
            id,
            source,
            title: fav.title,
            year: fav.year,
            poster: fav.cover,
            episodes: fav.total_episodes,
            source_name: fav.source_name,
          } as FavoriteItem;
        });
      setFavoriteItems(sorted);
    })();
  }, [activeTab]);

  return (
    <PageLayout>
      <div className="px-2 sm:px-10 py-4 sm:py-8 overflow-visible">
        {/* 顶部 Tab 切换 */}
        <div className="mb-8 flex justify-center">
          <CapsuleSwitch
            options={[
              { label: "首页", value: "home" },
              { label: "收藏夹", value: "favorites" },
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="max-w-[95%] mx-auto">
          {activeTab === "favorites" ? (
            // 收藏夹视图
            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  我的收藏
                </h2>
                {favoriteItems.length > 0 && (
                  <button
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={async () => {
                      await clearAllFavorites();
                      setFavoriteItems([]);
                    }}
                  >
                    清空
                  </button>
                )}
              </div>
              <div className="justify-start grid grid-cols-3 gap-x-2 gap-y-14 sm:gap-y-20 px-2 sm:grid-cols-[repeat(auto-fill,_minmax(11rem,_1fr))] sm:gap-x-8 sm:px-4">
                {favoriteItems.map((item) => (
                  <div key={item.id + item.source} className="w-full">
                    <VideoCard {...item} from="favorites" />
                  </div>
                ))}
                {favoriteItems.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-8 dark:text-gray-400">
                    暂无收藏内容
                  </div>
                )}
              </div>
            </section>
          ) : (
            // 首页视图
            <>
              {/* 继续观看 */}
              <ContinueWatching />

              {/* 热门电影 */}
              <section className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    热门电影
                  </h2>
                  <Link
                    href="/douban?type=movie&tag=热门&title=热门电影"
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    查看更多
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                <ScrollableRow>
                  {loading
                    ? // 加载状态显示灰色占位数据
                      Array.from({ length: 8 }).map((_, index) => (
                        <div
                          key={index}
                          className="min-w-[96px] w-24 sm:min-w-[180px] sm:w-44"
                        >
                          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-200 animate-pulse dark:bg-gray-800">
                            <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700"></div>
                          </div>
                          <div className="mt-2 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-800"></div>
                        </div>
                      ))
                    : // 显示真实数据
                      hotMovies.map((movie, index) => (
                        <div
                          key={index}
                          className="min-w-[96px] w-24 sm:min-w-[180px] sm:w-44"
                        >
                          <DemoCard
                            title={movie.title}
                            poster={movie.poster}
                            rate={movie.rate}
                          />
                        </div>
                      ))}
                </ScrollableRow>
              </section>

              {/* 热门剧集 */}
              <section className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    热门剧集
                  </h2>
                  <Link
                    href="/douban?type=tv&tag=热门&title=热门剧集"
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    查看更多
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                <ScrollableRow>
                  {loading
                    ? // 加载状态显示灰色占位数据
                      Array.from({ length: 8 }).map((_, index) => (
                        <div
                          key={index}
                          className="min-w-[96px] w-24 sm:min-w-[180px] sm:w-44"
                        >
                          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-200 animate-pulse dark:bg-gray-800">
                            <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700"></div>
                          </div>
                          <div className="mt-2 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-800"></div>
                        </div>
                      ))
                    : // 显示真实数据
                      hotTvShows.map((show, index) => (
                        <div
                          key={index}
                          className="min-w-[96px] w-24 sm:min-w-[180px] sm:w-44"
                        >
                          <DemoCard
                            title={show.title}
                            poster={show.poster}
                            rate={show.rate}
                          />
                        </div>
                      ))}
                </ScrollableRow>
              </section>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeClient />
    </Suspense>
  );
}
