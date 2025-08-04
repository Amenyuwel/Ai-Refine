import React from "react";
import { ClipLoader } from "react-spinners";

const LoadingOverlay = ({ loading }) => {
  if (!loading) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center">
      <ClipLoader size={50} color={"#000000"} loading={loading} />
      <p className="text-main text-semibold">Uploading...</p>
    </div>
  );
};

export default LoadingOverlay;
