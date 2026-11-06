import styles from "@/styles/pages/techStack.module.css";

import TechChips from "@/components/tech/TechChips";
import { useAnimateIn } from "@/hooks/useAnimateIn";
import { TechCategory } from "@/utils/types";

interface CategoryCardProps {
    category: TechCategory;
    index:    number; // for the staggered entrance
}

/**
 * A category in the "Full Toolkit." grid: icon, title, what it covers,
 * tool count, and the tools as chips.
 */
export default function CategoryCard({ category, index }: CategoryCardProps) {
    const { ref, style } = useAnimateIn<HTMLElement>({
        delay:    100 + (index % 2) * 80, // stagger within each row
        duration: 600,
    });
    const Icon = category.icon;

    return (
        <article
            ref={ref}
            style={style}
            className={styles.category}
            aria-labelledby={`category-${category.slug}`}>
            <header className={styles["category-header"]}>
                <span className={styles["category-icon"]}>
                    <Icon width={20} height={20} aria-hidden="true" />
                </span>
                <div className={styles["category-heading"]}>
                    <h3 id={`category-${category.slug}`}>{category.title}</h3>
                    <p>{category.description}</p>
                </div>
                <span className={styles.count}>
                    {category.items.length} tools
                </span>
            </header>

            <TechChips items={category.items} ariaLabel={`${category.title} tools`} />
        </article>
    );
}
