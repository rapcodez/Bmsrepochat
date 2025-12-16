import { ITEMS, SALES_FORECAST } from '../data/mockDb';

export const getMarketAnalysis = (itemId: string) => {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return null;

    const cumminsPrice = item.cumminsPrice || item.price * 1.2; // Fallback if missing
    const variance = ((item.price - cumminsPrice) / cumminsPrice) * 100;
    const isCheaper = variance < 0;

    return {
        itemId: item.id,
        itemName: item.name,
        ourPrice: item.price,
        cumminsPrice: cumminsPrice,
        competitorName: item.competitorRef?.name || 'Unknown',
        competitorPrice: item.competitorRef?.price || 0,
        variancePercent: variance.toFixed(1),
        recommendation: isCheaper
            ? "Strong competitive advantage. Highlight price savings."
            : "Premium pricing detected. Focus on quality and durability."
    };
};

export const getSalesAnalysis = (itemId: string) => {
    const forecasts = SALES_FORECAST.filter(f => f.itemId === itemId);
    if (forecasts.length === 0) return null;

    // Aggregate data
    const totalSales = forecasts.reduce((sum, f) => sum + f.actualQty, 0);
    const totalCompetitorSales = forecasts.reduce((sum, f) => sum + (f.competitorSales || 0), 0);
    const marketShare = (totalSales / (totalSales + totalCompetitorSales)) * 100;

    const recentTrend = forecasts.slice(-6); // Last 6 months
    const trendDirection = recentTrend[recentTrend.length - 1].actualQty > recentTrend[0].actualQty ? 'Up' : 'Down';

    return {
        itemId,
        totalSales,
        marketShare: marketShare.toFixed(1),
        trend: trendDirection,
        competitorVolume: totalCompetitorSales
    };
};
