export const formatFundingProgress = (current: bigint, goal: bigint): number => {
    if (goal === 0n) return 0;
    const progress = (Number(current) / Number(goal)) * 100;
    return Math.min(Math.max(progress, 0), 100);
};
