export function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export function truncateString(str, maxLength) {
    if (str.length > maxLength) {
        return str.slice(0, maxLength) + '...';
    } else {
        return str;
    }
}
