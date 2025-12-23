export type TabRouteName = 'Home' | 'Search' | 'Live' | 'Favorites' | 'Settings';

export const TAB_ITEMS: Array<{
  name: TabRouteName;
  title: string;
  icon: string;
}> = [
  {name: 'Home', title: '首页', icon: 'home-outline'},
  {name: 'Search', title: '搜索', icon: 'search-outline'},
  {name: 'Live', title: '直播', icon: 'tv-outline'},
  {name: 'Favorites', title: '收藏', icon: 'heart-outline'},
  {name: 'Settings', title: '设置', icon: 'settings-outline'},
];
