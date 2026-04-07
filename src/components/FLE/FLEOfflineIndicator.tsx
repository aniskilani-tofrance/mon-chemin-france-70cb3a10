import { WifiOff, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function FLEOfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const goOffline = () => { setIsOffline(true); setShowBanner(true); };
    const goOnline = () => {
      setIsOffline(false);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!showBanner && !isOffline) return null;

  return (
    <AnimatePresence>
      {(isOffline || showBanner) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow-lg ${
            isOffline
              ? "bg-orange-500 text-white"
              : "bg-emerald-500 text-white"
          }`}
        >
          {isOffline ? (
            <>
              <WifiOff className="h-4 w-4" /> Mode hors-ligne
            </>
          ) : (
            <>
              <Wifi className="h-4 w-4" /> Reconnecté !
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
