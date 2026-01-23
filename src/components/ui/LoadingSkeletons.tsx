import { motion, Variants } from "framer-motion";
import { Skeleton } from "./skeleton";

/**
 * PortfolioCardSkeleton - Loading skeleton for portfolio cards
 */
export const PortfolioCardSkeleton = () => {
    return (
        <motion.div
            className="glass-card p-4 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Image skeleton */}
            <Skeleton className="w-full h-48 rounded-lg" />

            {/* Title skeleton */}
            <Skeleton className="w-3/4 h-6" />

            {/* Description skeletons */}
            <div className="space-y-2">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-5/6 h-4" />
            </div>

            {/* Tags skeleton */}
            <div className="flex gap-2 pt-2">
                <Skeleton className="w-16 h-6 rounded-full" />
                <Skeleton className="w-20 h-6 rounded-full" />
                <Skeleton className="w-14 h-6 rounded-full" />
            </div>
        </motion.div>
    );
};

/**
 * TestimonialCardSkeleton - Loading skeleton for testimonial cards
 */
export const TestimonialCardSkeleton = () => {
    return (
        <motion.div
            className="glass-card p-6 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header with avatar and name */}
            <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-24 h-3" />
                </div>
            </div>

            {/* Rating skeleton */}
            <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="w-5 h-5 rounded" />
                ))}
            </div>

            {/* Review text skeleton */}
            <div className="space-y-2">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-4/5 h-4" />
            </div>
        </motion.div>
    );
};

/**
 * ServiceCardSkeleton - Loading skeleton for service cards
 */
export const ServiceCardSkeleton = () => {
    return (
        <motion.div
            className="glass-card p-6 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Icon skeleton */}
            <div className="flex justify-center">
                <Skeleton className="w-16 h-16 rounded-full" />
            </div>

            {/* Title skeleton */}
            <Skeleton className="w-2/3 h-6 mx-auto" />

            {/* Description skeleton */}
            <div className="space-y-2">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-3/4 h-4" />
            </div>

            {/* Button skeleton */}
            <Skeleton className="w-full h-10 mt-4 rounded-lg" />
        </motion.div>
    );
};

/**
 * GridSkeleton - Generic grid layout skeleton with stagger animation
 */
interface GridSkeletonProps {
    count?: number;
    columns?: number;
    SkeletonComponent?: React.ComponentType;
}

export const GridSkeleton = ({
    count = 6,
    columns = 3,
    SkeletonComponent = () => <Skeleton className="w-full h-64 rounded-lg" />
}: GridSkeletonProps) => {
    return (
        <motion.div
            className={`grid gap-6`}
            style={{
                gridTemplateColumns: `repeat(auto-fill, minmax(300px, 1fr))`
            }}
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: {
                        staggerChildren: 0.05
                    }
                }
            } as Variants}
        >
            {[...Array(count)].map((_, i) => (
                <motion.div
                    key={i}
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                    } as Variants}
                    transition={{ duration: 0.4 }}
                >
                    <SkeletonComponent />
                </motion.div>
            ))}
        </motion.div>
    );
};
