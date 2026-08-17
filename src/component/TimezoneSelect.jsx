import { useMemo } from "react";
import { getAllTimeZones, groupTimeZonesByRegion, formatZoneLabel } from "../timeUtils";

// A polished, searchable-by-typing native <select> for choosing any
// IANA timezone manually, grouped by region for easy scanning.
function TimezoneSelect({ value, onChange, id, className = "" }) {

    const groups = useMemo(() => {
        const zones = getAllTimeZones();
        return groupTimeZonesByRegion(zones);
    }, []);

    const regionNames = Object.keys(groups).sort();

    return (
        <select
            id={id}
            className={`form-select tz-select ${className}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {regionNames.map((region) => (
                <optgroup label={region} key={region}>
                    {groups[region]
                        .slice()
                        .sort()
                        .map((zone) => (
                            <option key={zone} value={zone}>
                                {formatZoneLabel(zone)} ({zone})
                            </option>
                        ))}
                </optgroup>
            ))}
        </select>
    );
}

export default TimezoneSelect;
