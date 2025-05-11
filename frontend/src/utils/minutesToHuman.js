export default function minutesToHuman(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    // Правила склонения для часов
    const getHoursWord = (h) => {
        if (h % 10 === 1 && h % 100 !== 11) return 'час';
        if ([2, 3, 4].includes(h % 10) && ![12, 13, 14].includes(h % 100)) return 'часа';
        return 'часов';
    };
    
    // Правила склонения для минут
    const getMinutesWord = (m) => {
        if (m % 10 === 1 && m % 100 !== 11) return 'минута';
        if ([2, 3, 4].includes(m % 10) && ![12, 13, 14].includes(m % 100)) return 'минуты';
        return 'минут';
    };

    // Сборка результата
    const parts = [];
    if (hours > 0) parts.push(`${hours} ${getHoursWord(hours)}`);
    if (mins > 0) parts.push(`${mins} ${getMinutesWord(mins)}`);
    
    return parts.length ? parts.join(' ') : '0 минут';
}