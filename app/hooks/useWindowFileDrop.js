import { useEffect, useRef, useState } from "react";
import { isAcceptedImageFile } from "@/utils/imageTypes";
import { EXAMPLE_DRAG_TYPE } from "@/utils/exampleImages";

// Browsers repeat dragover every ~50-350ms while a drag is over the page, so
// silence for longer than that means the drag ended without any end event.
const DRAG_IDLE_TIMEOUT_MS = 600;

const isExampleDrag = (event) =>
  event.dataTransfer?.types.includes(EXAMPLE_DRAG_TYPE);

const hasFiles = (event) =>
  isExampleDrag(event) || event.dataTransfer?.types.includes("Files");

// Tracks file drags over the whole window, so the navbar counts as drop area.
// onDrop receives (acceptedFiles, rejectedFiles) like react-dropzone does.
// onExampleDrop receives the example name when an in-page example is dropped.
const useWindowFileDrop = (onDrop, onExampleDrop) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const onDropRef = useRef(onDrop);
  const onExampleDropRef = useRef(onExampleDrop);

  useEffect(() => {
    onDropRef.current = onDrop;
    onExampleDropRef.current = onExampleDrop;
  }, [onDrop, onExampleDrop]);

  useEffect(() => {
    // dragenter/dragleave fire for every child element crossed, so count them
    let enterCount = 0;
    let idleTimer = null;
    let isActive = false;

    const endDrag = () => {
      clearTimeout(idleTimer);
      enterCount = 0;
      isActive = false;
      setIsDragActive(false);
    };

    const restartIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(endDrag, DRAG_IDLE_TIMEOUT_MS);
    };

    const handleDragEnter = (event) => {
      if (!hasFiles(event)) return;
      enterCount += 1;
      isActive = true;
      setIsDragActive(true);
      restartIdleTimer();
    };

    const handleDragOver = (event) => {
      if (!hasFiles(event)) return;
      // Without this the browser opens the file instead of dropping it
      event.preventDefault();
      if (!isActive) {
        // The idle timer fired during a slow drag that is still going. The
        // original dragenter is gone, so count the element under the cursor
        // as 1: the next dragleave then only ends the drag at the window edge.
        enterCount = 1;
        isActive = true;
        setIsDragActive(true);
      }
      restartIdleTimer();
    };

    const handleDragLeave = (event) => {
      if (!hasFiles(event)) return;
      enterCount = Math.max(0, enterCount - 1);
      if (enterCount === 0) endDrag();
    };

    const handleDrop = (event) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      endDrag();

      if (isExampleDrag(event)) {
        onExampleDropRef.current(event.dataTransfer.getData(EXAMPLE_DRAG_TYPE));
        return;
      }

      const files = Array.from(event.dataTransfer.files);
      onDropRef.current(
        files.filter(isAcceptedImageFile),
        files.filter((file) => !isAcceptedImageFile(file)),
      );
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("dragend", endDrag);
    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("dragend", endDrag);
    };
  }, []);

  return isDragActive;
};

export default useWindowFileDrop;
