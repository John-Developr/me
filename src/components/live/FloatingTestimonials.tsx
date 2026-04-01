// 'use client';

// import { useEffect, useRef, useState, useCallback } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import Image from "next/image";

// // ============================================================
// // TYPES
// // ============================================================

// interface Testimonial {
//   id:      number;
//   name:    string;
//   role?:   string;
//   avatar?: string;
//   message: string;
// }

// interface ActiveTestimonial extends Testimonial {
//   uid:       number; // unique instance id — prevents key collisions on repeat
//   isTyping:  boolean;
// }

// // ============================================================
// // EXAMPLE DATA
// // ============================================================

// export const testimonials: Testimonial[] = [
//   {
//     id:      1,
//     name:    "Sarah Chen",
//     role:    "Product Manager @ Stripe",
//     avatar:  "/avatars/sarah.jpg",
//     message: "John delivered an exceptional product. Clean code, great communication throughout the project.",
//   },
//   {
//     id:      2,
//     name:    "Marcus Rivera",
//     role:    "CTO @ Vercel",
//     avatar:  "/avatars/marcus.jpg",
//     message: "One of the best developers I've worked with. Attention to detail is incredible.",
//   },
//   {
//     id:      3,
//     name:    "Priya Nair",
//     role:    "Founder @ Luma",
//     avatar:  "/avatars/priya.jpg",
//     message: "Delivered ahead of schedule and the app works flawlessly. Highly recommend!",
//   },
//   {
//     id:      4,
//     name:    "David Park",
//     role:    "Lead Engineer @ Linear",
//     message: "Exceptional React and Next.js skills. The animations he built were jaw-dropping.",
//   },
//   {
//     id:      5,
//     name:    "Aisha Johnson",
//     role:    "Design Lead @ Figma",
//     avatar:  "/avatars/aisha.jpg",
//     message: "Pixel-perfect implementation of our designs. Truly understood what we were going for.",
//   },
// ];

// // ============================================================
// // CONSTANTS
// // ============================================================

// const MAX_VISIBLE      = 3;
// const TYPING_DURATION  = 1400;  // ms — typing indicator duration
// const DISPLAY_DURATION = 5000;  // ms — how long card stays visible
// const MIN_INTERVAL     = 4000;  // ms — min delay between testimonials
// const MAX_INTERVAL     = 7000;  // ms — max delay (randomized)

// // ============================================================
// // AVATAR FALLBACK
// // ============================================================

// const AvatarFallback = ({ name }: { name: string }) => (
//   <div
//     style={{
//       width:           "100%",
//       height:          "100%",
//       borderRadius:    "50%",
//       background:      "linear-gradient(135deg, #1e2330, #2d3748)",
//       display:         "flex",
//       alignItems:      "center",
//       justifyContent:  "center",
//       fontSize:        "13px",
//       fontWeight:      600,
//       color:           "#94a3b8",
//       letterSpacing:   "0.04em",
//     }}>
//     {name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
//   </div>
// );

// // ============================================================
// // TYPING INDICATOR
// // ============================================================

// const TypingIndicator = () => (
//   <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 0" }}>
//     {[0, 1, 2].map((i) => (
//       <motion.span
//         key={i}
//         style={{
//           width:        "5px",
//           height:       "5px",
//           borderRadius: "50%",
//           background:   "#4a5568",
//           display:      "block",
//         }}
//         animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
//         transition={{
//           duration:   0.7,
//           repeat:     Infinity,
//           delay:      i * 0.15,
//           ease:       "easeInOut",
//         }}
//       />
//     ))}
//   </div>
// );

// // ============================================================
// // TESTIMONIAL CARD
// // ============================================================

// interface CardProps {
//   item:     ActiveTestimonial;
//   index:    number;
//   total:    number;
//   isPaused: boolean;
// }

// const TestimonialCard = ({ item, index, total, isPaused }: CardProps) => {
//   // Older items (higher index from bottom) get more opacity reduction
//   const isOldest  = index === total - 1 && total > 1;
//   const opacity   = isOldest ? 0.5 : 1;
//   const blur      = isOldest ? "blur(0.6px)" : "none";
//   const scale     = isOldest ? 0.97 : 1;

//   return (
//     <motion.div
//       layout
//       initial={{
//         opacity:   0,
//         x:         -80,
//         scale:     0.92,
//         filter:    "blur(4px)",
//       }}
//       animate={{
//         opacity,
//         x:         0,
//         scale,
//         filter:    blur,
//       }}
//       exit={{
//         opacity:   0,
//         x:         -60,
//         scale:     0.9,
//         filter:    "blur(6px)",
//         transition: { duration: 0.35, ease: "easeIn" },
//       }}
//       transition={{
//         type:      "spring",
//         stiffness: 280,
//         damping:   28,
//         mass:      0.8,
//       }}
//       style={{
//         background:   "rgba(13, 17, 23, 0.92)",
//         backdropFilter: "blur(20px) saturate(180%)",
//         border:       "0.5px solid rgba(255, 255, 255, 0.08)",
//         borderRadius: "14px",
//         padding:      "14px 16px",
//         width:        "300px",
//         boxShadow:    "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
//         cursor:       "default",
//         position:     "relative",
//         overflow:     "hidden",
//       }}>

//       {/* Subtle accent line */}
//       <div style={{
//         position:     "absolute",
//         top:          0,
//         left:         0,
//         right:        0,
//         height:       "1px",
//         background:   "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
//       }} />

//       {/* Header row */}
//       <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>

//         {/* Avatar with online indicator */}
//         <div style={{ position: "relative", flexShrink: 0 }}>
//           <motion.div
//             initial={{ scale: 0.6, opacity: 0 }}
//             animate={{ scale: 1,   opacity: 1 }}
//             transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
//             style={{ width: "34px", height: "34px", borderRadius: "50%", overflow: "hidden" }}>
//             {item.avatar ? (
//               <Image
//                 src={item.avatar}
//                 alt={item.name}
//                 width={34}
//                 height={34}
//                 style={{ objectFit: "cover", borderRadius: "50%" }}
//               />
//             ) : (
//               <AvatarFallback name={item.name} />
//             )}
//           </motion.div>

//           {/* Online dot */}
//           <motion.div
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             transition={{ delay: 0.3, type: "spring" }}
//             style={{
//               position:     "absolute",
//               bottom:       "0px",
//               right:        "0px",
//               width:        "9px",
//               height:       "9px",
//               borderRadius: "50%",
//               background:   "#22c55e",
//               border:       "1.5px solid rgba(13, 17, 23, 0.95)",
//             }}
//           />
//         </div>

//         {/* Name + role */}
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <motion.p
//             initial={{ opacity: 0, y: 4 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.15 }}
//             style={{
//               fontSize:     "13px",
//               fontWeight:   600,
//               color:        "#e6edf3",
//               margin:       0,
//               letterSpacing: "0.01em",
//               whiteSpace:   "nowrap",
//               overflow:     "hidden",
//               textOverflow: "ellipsis",
//             }}>
//             {item.name}
//           </motion.p>
//           {item.role && (
//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.2 }}
//               style={{
//                 fontSize:     "10px",
//                 color:        "#4a5568",
//                 margin:       0,
//                 letterSpacing: "0.02em",
//                 whiteSpace:   "nowrap",
//                 overflow:     "hidden",
//                 textOverflow: "ellipsis",
//               }}>
//               {item.role}
//             </motion.p>
//           )}
//         </div>

//         {/* Recent badge */}
//         <motion.div
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ delay: 0.25 }}
//           style={{
//             fontSize:     "9px",
//             fontWeight:   500,
//             color:        "#22c55e",
//             background:   "rgba(34, 197, 94, 0.1)",
//             border:       "0.5px solid rgba(34, 197, 94, 0.2)",
//             borderRadius: "20px",
//             padding:      "2px 7px",
//             letterSpacing: "0.04em",
//             flexShrink:   0,
//           }}>
//           now
//         </motion.div>
//       </div>

//       {/* Message or typing indicator */}
//       <div style={{ paddingLeft: "44px" }}>
//         {item.isTyping ? (
//           <TypingIndicator />
//         ) : (
//           <motion.p
//             initial={{ opacity: 0, y: 4 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//             style={{
//               fontSize:   "12px",
//               color:      "#7d8590",
//               margin:     0,
//               lineHeight: 1.6,
//             }}>
//             "{item.message}"
//           </motion.p>
//         )}
//       </div>

//     </motion.div>
//   );
// };

// // ============================================================
// // MAIN COMPONENT
// // ============================================================

// /**
//  * FloatingTestimonials — displays testimonials as a live feed
//  * in the bottom-left corner of the screen.
//  *
//  * Features:
//  * - Slides in from the left with spring animation
//  * - Typing indicator before message appears
//  * - Auto-removes after DISPLAY_DURATION
//  * - Pauses on hover
//  * - Max MAX_VISIBLE items at once
//  * - Randomized intervals for realism
//  *
//  * @example
//  * // In your layout or page
//  * <FloatingTestimonials />
//  */
// export default function FloatingTestimonials() {
//   const [active,   setActive]   = useState<ActiveTestimonial[]>([]);
//   const [isPaused, setIsPaused] = useState(false);

//   const uidRef       = useRef(0);
//   const indexRef     = useRef(0);
//   const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const isPausedRef  = useRef(false);

//   // Keep isPausedRef in sync with state for use inside closures
//   useEffect(() => {
//     isPausedRef.current = isPaused;
//   }, [isPaused]);

//   /**
//    * Adds a new testimonial to the feed.
//    * Shows typing indicator first, then reveals the message.
//    */
//   const addTestimonial = useCallback(() => {
//     const testimonial = testimonials[indexRef.current % testimonials.length];
//     indexRef.current++;

//     const uid: number = uidRef.current++;

//     // Step 1 — show typing indicator
//     const typingItem: ActiveTestimonial = {
//       ...testimonial,
//       uid,
//       isTyping: true,
//     };

//     setActive((prev) => {
//       const next = [typingItem, ...prev].slice(0, MAX_VISIBLE);
//       return next;
//     });

//     // Step 2 — reveal message after typing duration
//     setTimeout(() => {
//       setActive((prev) =>
//         prev.map((item) =>
//           item.uid === uid ? { ...item, isTyping: false } : item
//         )
//       );
//     }, TYPING_DURATION);

//     // Step 3 — remove after display duration
//     setTimeout(() => {
//       setActive((prev) => prev.filter((item) => item.uid !== uid));
//     }, TYPING_DURATION + DISPLAY_DURATION);

//   }, []);

//   /**
//    * Schedules the next testimonial with a randomized delay.
//    */
//   const scheduleNext = useCallback(() => {
//     const delay = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);

//     timerRef.current = setTimeout(() => {
//       if (!isPausedRef.current) {
//         addTestimonial();
//       }
//       scheduleNext(); // recurse
//     }, delay);
//   }, [addTestimonial]);

//   // Start the feed on mount
//   useEffect(() => {
//     // First testimonial shows quickly
//     const initial = setTimeout(() => addTestimonial(), 1500);
//     scheduleNext();

//     return () => {
//       clearTimeout(initial);
//       if (timerRef.current) clearTimeout(timerRef.current);
//     };
//   }, [addTestimonial, scheduleNext]);

//   return (
//     <div
//       onMouseEnter={() => setIsPaused(true)}
//       onMouseLeave={() => setIsPaused(false)}
//       style={{
//         position:      "fixed",
//         bottom:        "24px",
//         left:          "24px",
//         zIndex:        9999,
//         display:       "flex",
//         flexDirection: "column-reverse", // newest at bottom
//         gap:           "10px",
//         pointerEvents: active.length > 0 ? "auto" : "none",
//       }}>
//       <AnimatePresence mode="popLayout">
//         {active.map((item, index) => (
//           <TestimonialCard
//             key={item.uid}
//             item={item}
//             index={index}
//             total={active.length}
//             isPaused={isPaused}
//           />
//         ))}
//       </AnimatePresence>
//     </div>
//   );
// }