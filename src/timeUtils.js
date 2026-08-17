// Utility functions for World Clock Dashboard Pro
// Handles time conversion, formatting, offsets, solar calculations, and clock mathematics

// Get the browser / device's local IANA timezone
export function getLocalTimeZone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
        return "UTC";
    }
}

// Get current formatted time string for selected timezone (24h or 12h)
export function getCurrentTime(timeZone, hour12 = false, includeSeconds = true) {
    const zone = timeZone || getLocalTimeZone();
    try {
        return new Date().toLocaleTimeString("en-US", {
            timeZone: zone,
            hour12: hour12,
            hour: "2-digit",
            minute: "2-digit",
            ...(includeSeconds ? { second: "2-digit" } : {})
        });
    } catch {
        return "--:--:--";
    }
}

// Get complete date information
export function getCurrentDate(timeZone) {
    const zone = timeZone || getLocalTimeZone();
    try {
        return new Date().toLocaleDateString("en-US", {
            timeZone: zone,
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    } catch {
        return "";
    }
}

// Get short date string (e.g. "Mon, Oct 24")
export function getShortDate(timeZone, targetDate = new Date()) {
    const zone = timeZone || getLocalTimeZone();
    try {
        return targetDate.toLocaleDateString("en-US", {
            timeZone: zone,
            weekday: "short",
            month: "short",
            day: "numeric"
        });
    } catch {
        return "";
    }
}

// Convert time into 12 hour format with AM/PM
export function convertTo12Hour(time) {
    if (!time) return "";
    const parts = time.split(":");
    let hour = Number(parts[0]);
    const minute = parts[1] || "00";
    const second = parts[2] ? `:${parts[2].split(" ")[0]}` : "";
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${String(hour).padStart(2, "0")}:${minute}${second} ${period}`;
}

// Read hour, minute, second, millisecond for a given timezone and optional base date
export function getZonedTimeParts(timeZone, baseDate = new Date()) {
    const zone = timeZone || getLocalTimeZone();
    try {
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: zone,
            hour12: false,
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            fractionalSecondDigits: 3
        });

        const parts = formatter.formatToParts(baseDate).reduce((acc, part) => {
            acc[part.type] = part.value;
            return acc;
        }, {});

        return {
            year: Number(parts.year),
            month: Number(parts.month),
            day: Number(parts.day),
            hour: Number(parts.hour) % 24,
            minute: Number(parts.minute),
            second: Number(parts.second),
            ms: Number(parts.fractionalSecond || 0)
        };
    } catch {
        // Fallback
        const str = getCurrentTime(zone, false, true);
        const [h, m, s] = str.split(":").map(Number);
        return {
            year: baseDate.getFullYear(),
            month: baseDate.getMonth() + 1,
            day: baseDate.getDate(),
            hour: isNaN(h) ? baseDate.getHours() : h,
            minute: isNaN(m) ? baseDate.getMinutes() : m,
            second: isNaN(s) ? baseDate.getSeconds() : s,
            ms: baseDate.getMilliseconds()
        };
    }
}

// Calculate clock hand angles (0 to 360 deg) for Analog Clock
export function getClockAngles(timeZone, continuous = true, customDate = null) {
    const now = customDate || new Date();
    const { hour, minute, second, ms } = getZonedTimeParts(timeZone, now);
    const secondsFloat = continuous ? second + ms / 1000 : second;

    return {
        second: (secondsFloat * 6) % 360,
        minute: (minute * 6 + (continuous ? secondsFloat * 0.1 : 0)) % 360,
        hour: ((hour % 12) * 30 + minute * 0.5 + (continuous ? secondsFloat * (0.5 / 60) : 0)) % 360,
        rawHour24: hour,
        minuteRaw: minute,
        secondRaw: second,
        day: now.getDate()
    };
}

// Get timezone UTC offset string (e.g. "UTC+05:30", "UTC-04:00", "UTC+00:00")
export function getUtcOffsetString(timeZone) {
    const zone = timeZone || getLocalTimeZone();
    try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: zone,
            timeZoneName: "shortOffset"
        });
        const parts = formatter.formatToParts(now);
        const tzNamePart = parts.find(p => p.type === "timeZoneName");
        if (tzNamePart && tzNamePart.value) {
            return tzNamePart.value.replace("GMT", "UTC");
        }
    } catch {
        // fall through
    }

    // Manual offset calculation fallback
    try {
        const now = new Date();
        const zoned = new Date(now.toLocaleString("en-US", { timeZone: zone }));
        const utc = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
        const diffMinutes = Math.round((zoned.getTime() - utc.getTime()) / 60000);
        const sign = diffMinutes >= 0 ? "+" : "-";
        const absM = Math.abs(diffMinutes);
        const h = String(Math.floor(absM / 60)).padStart(2, "0");
        const m = String(absM % 60).padStart(2, "0");
        return `UTC${sign}${h}:${m}`;
    } catch {
        return "UTC+00:00";
    }
}

// Calculate relative time difference between target timezone and local timezone
export function getRelativeTimeDifference(targetZone, localZone = getLocalTimeZone()) {
    if (targetZone === localZone) {
        return { text: "Your local time", hoursDiff: 0, isLocal: true, dayShift: "today" };
    }

    try {
        const now = new Date();
        const targetParts = getZonedTimeParts(targetZone, now);
        const localParts = getZonedTimeParts(localZone, now);

        const targetEpoch = Date.UTC(targetParts.year, targetParts.month - 1, targetParts.day, targetParts.hour, targetParts.minute);
        const localEpoch = Date.UTC(localParts.year, localParts.month - 1, localParts.day, localParts.hour, localParts.minute);

        const diffMinutes = Math.round((targetEpoch - localEpoch) / 60000);
        const diffHours = diffMinutes / 60;

        let dayShift = "today";
        if (targetParts.day > localParts.day || (targetParts.month > localParts.month)) {
            dayShift = "tomorrow";
        } else if (targetParts.day < localParts.day || (targetParts.month < localParts.month)) {
            dayShift = "yesterday";
        }

        if (diffMinutes === 0) {
            return { text: "Same time", hoursDiff: 0, isLocal: false, dayShift };
        }

        const absHours = Math.abs(diffHours);
        const h = Math.floor(absHours);
        const m = Math.round((absHours - h) * 60);

        let timeStr = "";
        if (h > 0 && m > 0) timeStr = `${h}h ${m}m`;
        else if (h > 0) timeStr = `${h}h`;
        else timeStr = `${m}m`;

        const direction = diffMinutes > 0 ? "ahead" : "behind";
        const dayLabel = dayShift === "tomorrow" ? " (Tomorrow)" : dayShift === "yesterday" ? " (Yesterday)" : "";

        return {
            text: `${timeStr} ${direction}${dayLabel}`,
            hoursDiff: diffHours,
            isLocal: false,
            dayShift
        };
    } catch {
        return { text: "Difference unavailable", hoursDiff: 0, isLocal: false, dayShift: "today" };
    }
}

// Get Business Hours status (Work hours 09:00 - 17:00, Transition/Lunch 07:00-09:00 & 17:00-19:00, Off/Night)
export function getBusinessStatus(timeZone, customHour = null) {
    const hour = customHour !== null ? customHour : getZonedTimeParts(timeZone).hour;

    if (hour >= 9 && hour < 17) {
        return { status: "open", label: "Business Hours", badgeClass: "badge-business-open", color: "#10b981", icon: "🟢" };
    } else if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 19)) {
        return { status: "transition", label: "Early / Late Hours", badgeClass: "badge-business-transition", color: "#f59e0b", icon: "🟡" };
    } else {
        return { status: "closed", label: "Closed / Off-Hours", badgeClass: "badge-business-closed", color: "#64748b", icon: "🌙" };
    }
}

// Estimate solar phase (Dawn, Morning, Afternoon, Golden Hour, Dusk, Night)
export function getSolarPhase(timeZone, customHour = null) {
    const hour = customHour !== null ? customHour : getZonedTimeParts(timeZone).hour;

    if (hour >= 5 && hour < 7) {
        return { phase: "Dawn", icon: "🌅", description: "Early morning / Dawn", bgGradient: "linear-gradient(135deg, #f97316, #fbbf24)" };
    } else if (hour >= 7 && hour < 12) {
        return { phase: "Morning", icon: "☀️", description: "Morning daylight", bgGradient: "linear-gradient(135deg, #38bdf8, #60a5fa)" };
    } else if (hour >= 12 && hour < 17) {
        return { phase: "Afternoon", icon: "☀️", description: "Bright afternoon", bgGradient: "linear-gradient(135deg, #3b82f6, #6366f1)" };
    } else if (hour >= 17 && hour < 19) {
        return { phase: "Sunset", icon: "🌇", description: "Golden hour sunset", bgGradient: "linear-gradient(135deg, #ec4899, #f97316)" };
    } else if (hour >= 19 && hour < 21) {
        return { phase: "Twilight", icon: "🌆", description: "Dusk / Twilight", bgGradient: "linear-gradient(135deg, #6366f1, #312e81)" };
    } else {
        return { phase: "Night", icon: "🌙", description: "Night time", bgGradient: "linear-gradient(135deg, #1e1b4b, #0f172a)" };
    }
}

// Convert hours (0..23.99) into time string
export function formatFloatHours(hourFloat, is24Hour = true) {
    const normalized = (hourFloat + 24) % 24;
    const h = Math.floor(normalized);
    const m = Math.floor((normalized - h) * 60);
    const padH = String(h).padStart(2, "0");
    const padM = String(m).padStart(2, "0");

    if (is24Hour) {
        return `${padH}:${padM}`;
    } else {
        const period = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return `${String(h12).padStart(2, "0")}:${padM} ${period}`;
    }
}

// Calculate target time given a base date/time in one timezone for another timezone (for Time Scrubber)
export function getConvertedTime(sourceZone, targetZone, sliderMinutesOffset = 0) {
    const now = new Date();
    const adjustedDate = new Date(now.getTime() + sliderMinutesOffset * 60000);
    
    const targetParts = getZonedTimeParts(targetZone, adjustedDate);
    const time24 = `${String(targetParts.hour).padStart(2, "0")}:${String(targetParts.minute).padStart(2, "0")}`;
    const time12 = convertTo12Hour(time24);
    const dateStr = getShortDate(targetZone, adjustedDate);

    return {
        time24,
        time12,
        dateStr,
        hour: targetParts.hour,
        minute: targetParts.minute,
        business: getBusinessStatus(targetZone, targetParts.hour),
        solar: getSolarPhase(targetZone, targetParts.hour)
    };
}

// Curated default world time zones with rich metadata
export const defaultTimeZones = [
    { city: "Mumbai", country: "India", zone: "Asia/Kolkata", emoji: "🇮🇳", region: "Asia" },
    { city: "London", country: "United Kingdom", zone: "Europe/London", emoji: "🇬🇧", region: "Europe" },
    { city: "New York", country: "USA", zone: "America/New_York", emoji: "🇺🇸", region: "Americas" },
    { city: "Tokyo", country: "Japan", zone: "Asia/Tokyo", emoji: "🇯🇵", region: "Asia" },
    { city: "Sydney", country: "Australia", zone: "Australia/Sydney", emoji: "🇦🇺", region: "Oceania" },
    { city: "Dubai", country: "UAE", zone: "Asia/Dubai", emoji: "🇦🇪", region: "Middle East" },
    { city: "San Francisco", country: "USA", zone: "America/Los_Angeles", emoji: "🇺🇸", region: "Americas" },
    { city: "Singapore", country: "Singapore", zone: "Asia/Singapore", emoji: "🇸🇬", region: "Asia" }
];

// Preset bundles for quick timezone loading
export const timezonePresetBundles = [
    {
        name: "Global Financial Hubs",
        description: "New York, London, Tokyo, Hong Kong, Frankfurt, Singapore",
        zones: [
            { city: "New York", country: "USA", zone: "America/New_York", emoji: "🇺🇸" },
            { city: "London", country: "UK", zone: "Europe/London", emoji: "🇬🇧" },
            { city: "Tokyo", country: "Japan", zone: "Asia/Tokyo", emoji: "🇯🇵" },
            { city: "Hong Kong", country: "Hong Kong", zone: "Asia/Hong_Kong", emoji: "🇭🇰" },
            { city: "Frankfurt", country: "Germany", zone: "Europe/Berlin", emoji: "🇩🇪" },
            { city: "Singapore", country: "Singapore", zone: "Asia/Singapore", emoji: "🇸🇬" }
        ]
    },
    {
        name: "Tech & Silicon Ecosystem",
        description: "San Francisco, Seattle, Bengaluru, London, Sydney, Tokyo",
        zones: [
            { city: "San Francisco", country: "USA", zone: "America/Los_Angeles", emoji: "🇺🇸" },
            { city: "Bengaluru", country: "India", zone: "Asia/Kolkata", emoji: "🇮🇳" },
            { city: "London", country: "UK", zone: "Europe/London", emoji: "🇬🇧" },
            { city: "Sydney", country: "Australia", zone: "Australia/Sydney", emoji: "🇦🇺" },
            { city: "Tokyo", country: "Japan", zone: "Asia/Tokyo", emoji: "🇯🇵" },
            { city: "Singapore", country: "Singapore", zone: "Asia/Singapore", emoji: "🇸🇬" }
        ]
    },
    {
        name: "Americas Coast-to-Coast",
        description: "Honolulu, Los Angeles, Chicago, New York, São Paulo, Toronto",
        zones: [
            { city: "Honolulu", country: "USA", zone: "Pacific/Honolulu", emoji: "🌺" },
            { city: "Los Angeles", country: "USA", zone: "America/Los_Angeles", emoji: "🇺🇸" },
            { city: "Chicago", country: "USA", zone: "America/Chicago", emoji: "🇺🇸" },
            { city: "New York", country: "USA", zone: "America/New_York", emoji: "🇺🇸" },
            { city: "São Paulo", country: "Brazil", zone: "America/Sao_Paulo", emoji: "🇧🇷" },
            { city: "Toronto", country: "Canada", zone: "America/Toronto", emoji: "🇨🇦" }
        ]
    }
];

// Fallback timezone list if Intl.supportedValuesOf is unsupported
const FALLBACK_TIME_ZONES = [
    "UTC",
    "Pacific/Midway", "Pacific/Honolulu", "America/Anchorage",
    "America/Los_Angeles", "America/Tijuana", "America/Vancouver",
    "America/Denver", "America/Phoenix", "America/Chicago",
    "America/Mexico_City", "America/New_York", "America/Toronto",
    "America/Bogota", "America/Lima", "America/Caracas",
    "America/Santiago", "America/Sao_Paulo", "America/Argentina/Buenos_Aires",
    "Atlantic/Azores", "Europe/London", "Europe/Dublin", "Europe/Lisbon",
    "Europe/Madrid", "Europe/Paris", "Europe/Amsterdam", "Europe/Brussels",
    "Europe/Berlin", "Europe/Rome", "Europe/Zurich", "Europe/Vienna",
    "Europe/Warsaw", "Europe/Prague", "Europe/Budapest", "Europe/Athens",
    "Europe/Bucharest", "Europe/Helsinki", "Europe/Kyiv", "Europe/Istanbul",
    "Europe/Moscow", "Africa/Casablanca", "Africa/Lagos", "Africa/Cairo",
    "Africa/Johannesburg", "Africa/Nairobi", "Asia/Jerusalem", "Asia/Beirut",
    "Asia/Dubai", "Asia/Riyadh", "Asia/Tehran", "Asia/Baku", "Asia/Karachi",
    "Asia/Kolkata", "Asia/Kathmandu", "Asia/Dhaka", "Asia/Yangon",
    "Asia/Bangkok", "Asia/Jakarta", "Asia/Ho_Chi_Minh", "Asia/Shanghai",
    "Asia/Hong_Kong", "Asia/Taipei", "Asia/Singapore", "Asia/Kuala_Lumpur",
    "Asia/Manila", "Asia/Seoul", "Asia/Tokyo", "Australia/Perth",
    "Australia/Adelaide", "Australia/Darwin", "Australia/Brisbane",
    "Australia/Sydney", "Australia/Melbourne", "Pacific/Guam",
    "Pacific/Auckland", "Pacific/Fiji"
];

// Retrieve all selectable IANA timezones
export function getAllTimeZones() {
    try {
        if (typeof Intl.supportedValuesOf === "function") {
            const zones = Intl.supportedValuesOf("timeZone");
            if (zones && zones.length) return zones;
        }
    } catch {
        // fallback
    }
    return FALLBACK_TIME_ZONES;
}

// Group timezones by region
export function groupTimeZonesByRegion(zones) {
    const groups = {};
    zones.forEach((zone) => {
        const [region, ...rest] = zone.split("/");
        const label = rest.length ? region.replace(/_/g, " ") : "Global";
        if (!groups[label]) groups[label] = [];
        groups[label].push(zone);
    });
    return groups;
}

// Format timezone into clean readable label
export function formatZoneLabel(zone) {
    if (!zone) return "";
    return zone
        .split("/")
        .slice(1)
        .join(" / ")
        .replace(/_/g, " ") || zone;
}

// Format alarm time display
export function formatAlarmTime(hour, minute) {
    const h = Number(hour);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}
