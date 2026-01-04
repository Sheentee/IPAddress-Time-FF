export function formatTime(date, options = {}) {
    const {
        use24Hour = false,
        showSeconds = true,
        showDate = true
    } = options;

    const timeOptions = {
        hour: 'numeric',
        minute: 'numeric',
        second: showSeconds ? 'numeric' : undefined,
        hour12: !use24Hour
    };

    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    const timeString = date.toLocaleTimeString(undefined, timeOptions);

    if (showDate) {
        const dateString = date.toLocaleDateString(undefined, dateOptions);
        return { time: timeString, date: dateString };
    }

    return { time: timeString, date: '' };
}
