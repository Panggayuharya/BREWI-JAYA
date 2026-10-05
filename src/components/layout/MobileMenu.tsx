"use client";
import { AnimatePresence, motion } from "motion/react";
import { navLinks } from "@/data/site";

interface MobileMenuProps {
  open: boolean;
  active: string;
  hrefFor: (id: string) => string;
  onNavigate: (id: string) => void;
}

export function MobileMenu({ open, active, hrefFor, onNavigate }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          data-lenis-prevent
          className="fixed inset-0 z-40 flex flex-col justify-center bg-ink lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.ul
            className="container-brewi flex flex-col gap-2"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          >
            {navLinks.map((link) => (
              <motion.li key={link.id} variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}>
                <a
                  href={hrefFor(link.id)}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(link.id);
                  }}
                  className={`block py-2 font-display text-section font-semibold tracking-tight ${
                    active === link.id ? "text-accent" : "text-warm"
                  }`}
                >
                  {link.label}
                </a>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
