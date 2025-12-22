import { Solar, Lunar } from 'lunar-typescript';
import type { LunarInfo } from '../types';

export function getLunarDate(date: Date): LunarInfo {
  try {
    // 将公历日期转换为 Solar 对象
    const solar = Solar.fromDate(date);
    // 转换为农历对象
    const lunar = solar.getLunar();

    // 获取农历月（如：正月、冬月、闰二月）
    const month = lunar.getMonthInChinese();
    // 获取农历日（如：初一、十五）
    const day = lunar.getDayInChinese();
    
    // 获取干支年份（如：乙巳）
    const yearGanzhi = lunar.getYearInGanZhiByLiChun();

    return {
      fullDate: `${month}月${day}`, // 例如：冬月十五
      date: day === '初一' ? `${month}月` : day, // 初一时显示月份名
      year: `${yearGanzhi}年`, // 例如：乙巳年
      month: `${month}月`, // 例如：冬月
    };
  } catch (e) {
    console.error("Lunar date error (lunar-typescript):", e);
    return { 
      fullDate: "加载失败", 
      date: "加载失败", 
      year: "--年",
      month: "加载失败"
    };
  }
}
