'use client'

import Styles from "@/styles/general/component.module.css";

import SortUp from "@/components/icons/SortUp";
import SortDown from "@/components/icons/SortDown";

interface FilterSortBarProps<T extends string> {
    /** Filter pills in display order (e.g. "All", then each category). */
    options:       readonly T[];
    active:        T;
    onSelect:      (option: T) => void;
    /** Current order: true = oldest first (button shows filled). */
    ascending:     boolean;
    onToggleSort:  () => void;
    /** Accessible names for the pill group and the sort button's next action. */
    filterLabel:   string;
    sortLabel:     string;
}

/**
 * Row of glass filter pills with a round sort toggle on the right — the
 * blog's category bar, shared with the /projects "More Projects." list.
 * On narrow screens the pills scroll sideways; the sort button stays put.
 */
export default function FilterSortBar<T extends string>({
    options, active, onSelect, ascending, onToggleSort, filterLabel, sortLabel,
}: FilterSortBarProps<T>) {
    return (
        <div className={Styles["filter-sort"]}>
            <section role="group" aria-label={filterLabel}>
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        aria-pressed={option === active}
                        className={`liquid_glass_btn ${option === active ? Styles.active : ""}`}
                        onClick={() => { if (option !== active) onSelect(option); }}>
                        {option}
                    </button>
                ))}
            </section>
            <button
                type="button"
                className={`liquid_glass_btn ${Styles.sort} ${ascending ? Styles["active-sort"] : ""}`}
                aria-label={sortLabel}
                onClick={onToggleSort}>
                {ascending ?
                <SortUp width={20} height={20} /> :
                <SortDown width={20} height={20} />}
            </button>
        </div>
    );
}
