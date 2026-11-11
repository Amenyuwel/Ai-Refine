import { createPortal } from "react-dom";

// Rendered into document.body: a transformed ancestor (the parallax section)
// would otherwise make `fixed` relative to it instead of the viewport.
// z-[100] sits above the navbar (z-50) and below the toasts (z-9999).
const DragOverlay = ({ isDragActive, tintClassName }) => {
  if (!isDragActive) return null;

  return createPortal(
    <div
      className={`pointer-events-none fixed inset-0 z-[100] ${tintClassName}`}
    >
      <p className="background-blur-md text-main absolute top-1/2 left-1/2 z-60 w-full -translate-x-1/2 -translate-y-1/2 transform px-4 text-center text-[clamp(2.5rem,10vw,9rem)] font-bold text-balance">
        Drop your image here!
      </p>
      <div className="absolute top-8 left-8 h-[80px] w-[80px] rounded-tl-3xl border-t-[8px] border-l-[8px] border-white"></div>
      <div className="absolute top-8 right-8 h-[80px] w-[80px] rounded-tr-3xl border-t-[8px] border-r-[8px] border-white"></div>
      <div className="absolute bottom-8 left-8 h-[80px] w-[80px] rounded-bl-3xl border-b-[8px] border-l-[8px] border-white"></div>
      <div className="absolute right-8 bottom-8 h-[80px] w-[80px] rounded-br-3xl border-r-[8px] border-b-[8px] border-white"></div>
    </div>,
    document.body,
  );
};

export default DragOverlay;
