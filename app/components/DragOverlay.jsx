const DragOverlay = ({ isDragActive }) => {
  if (!isDragActive) return null;

  return (
    <>
      <p className="background-blur-md text-main absolute top-1/2 left-1/2 z-60 -translate-x-1/2 -translate-y-1/2 transform text-[9rem] font-bold whitespace-nowrap">
        Drop your image here!
      </p>
      <div className="absolute top-8 left-8 h-[80px] w-[80px] rounded-tl-3xl border-t-[8px] border-l-[8px] border-white"></div>
      <div className="absolute top-8 right-8 h-[80px] w-[80px] rounded-tr-3xl border-t-[8px] border-r-[8px] border-white"></div>
      <div className="absolute bottom-8 left-8 h-[80px] w-[80px] rounded-bl-3xl border-b-[8px] border-l-[8px] border-white"></div>
      <div className="absolute right-8 bottom-8 h-[80px] w-[80px] rounded-br-3xl border-r-[8px] border-b-[8px] border-white"></div>
    </>
  );
};

export default DragOverlay;
