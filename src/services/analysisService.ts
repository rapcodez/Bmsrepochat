import { ITEMS, MARKET_TRENDS } from '../data/mockDb';

export const getMarketAnalysis = (itemId: string) => {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return null;

    const cumminsPrice = item.cumminsPrice;
    const variance = ((item.price - cumminsPrice) / cumminsPrice) * 100;
    const isCheaper = variance < 0;

    // Find cheapest competitor
    const cheapestCompetitor = item.competitors.reduce((prev, curr) => prev.price < curr.price ? prev : curr);

    return {
        itemId: item.id,
        itemName: item.name,
        ourPrice: item.price,
        cumminsPrice: cumminsPrice,
        cheapestCompetitor: cheapestCompetitor.name,
        cheapestPrice: cheapestCompetitor.price,
        variancePercent: variance.toFixed(1),
        recommendation: isCheaper
            ? "Strong competitive advantage. Highlight price savings."
            : "Premium pricing detected. Focus on quality and durability."
    };
};

export const getSalesAnalysis = (itemId: string) => {
    const trends = MARKET_TRENDS.filter(t => t.itemId === itemId);
    if (trends.length === 0) return null;

    // Aggregate data (Last 12 months)
    const recentTrends = trends.slice(-12);
    const totalSales = recentTrends.reduce((sum, t) => sum + t.bmsSales, 0);

    // Calculate total market volume (BMS + All Competitors)
    let totalMarketVolume = totalSales;
    recentTrends.forEach(t => {
        Object.values(t.competitorSales).forEach(qty => totalMarketVolume += qty);
    });

    const marketShare = totalMarketVolume > 0 ? (totalSales / totalMarketVolume) * 100 : 0;
    const trendDirection = recentTrends[recentTrends.length - 1].bmsSales > recentTrends[0].bmsSales ? 'Up' : 'Down';

    return {
        itemId,
        totalSales,
        marketShare: marketShare.toFixed(1),
        trend: trendDirection,
        marketVolume: totalMarketVolume
    };
};
