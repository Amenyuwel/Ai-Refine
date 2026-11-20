// Same hover effect as the UPLOAD IMAGE button on the home page.
export const greenButtonClass =
  "bg-[var(--primary)] text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:brightness-105";

export const outlinedButtonClass =
  "border border-[var(--primary)] bg-white text-main transition-colors hover:bg-[var(--bg-main)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white";

const tileButtonClass =
  "flex cursor-pointer items-center justify-center rounded-lg border-2 transition-all duration-200 ease-in-out hover:shadow-md active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--secondary)]";

// Tinted blue tile that reads as "add", matching the selected-thumbnail blue.
export const addButtonClass = `${tileButtonClass} border-[#009CFF] bg-[#87CEFA]/30 text-[#008cff] hover:bg-[#87CEFA]/60 active:bg-[#87CEFA]/80`;

// Outlined and tinted rather than a flat fill, so it warns without shouting.
export const deleteButtonClass = `${tileButtonClass} border-red-300 bg-red-50 text-red-600 hover:border-red-500 hover:bg-red-100 active:bg-red-200 focus-visible:outline-red-500`;
