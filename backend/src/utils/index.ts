export function cleanHtmlTags(text: string): string {
  if (!text) return "";
  return text
    .replace(/<[^>]+>/g, "\n") // 将 HTML 标签替换为换行
    .replace(/\n+/g, "\n") // 将多个连续换行合并为一个
    .replace(/[ \t]+/g, " ") // 将多个连续空格和制表符合并为一个空格，但保留换行符
    .replace(/^\n+|\n+$/g, "") // 去掉首尾换行
    .replace(/&nbsp;/g, " ") // 将 &nbsp; 替换为空格
    .trim(); // 去掉首尾空格
}
