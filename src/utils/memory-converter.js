const bytePower = (unit_type) => {
    let ut = unit_type.toLowerCase()
    const power = {
        'k': 3,
        'm': 6,
        'g': 9,
        't': 12,
        'p': 15,
        'e': 18,
        'z': 21,
        'y': 24,
    }

    return power[ut];
}

export const toBytes = (config) => {
    let units = config.substring(0, config.length - 1);
    let power_value = bytePower(config[config.length - 1])
    return units * Math.pow(10, power_value);
}

export const bytesToMegabytes = (bytes) => {
    return parseFloat((bytes / Math.pow(1000, 2)).toFixed(2)) + 'M';
}

// convert bytes to human readable unit type
export const formatBytes = (bytes, decimals) => {
    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const parsed = parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
    return parsed;
}

export const formatMemory = (mb, decimals = 2) => {
    let bytes = toBytes(mb);
    return formatBytes(bytes, decimals);
}