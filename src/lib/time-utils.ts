
export const getDayStart = (time: number) => {
    const date = new Date(time);
    date.setHours(0, 0, 0, 0);
    return date;
}

export const getDayEnd = (time: number) => {
    const date = new Date(time);
    date.setHours(23, 59, 59, 999);
    return date;
}

