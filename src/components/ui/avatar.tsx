import * as React from "react";

export function Avatar({ className, children }: any) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full overflow-hidden bg-gray-200 ${className}`}
      style={{ width: "40px", height: "40px" }}
    >
      {children}
    </div>
  );
}

export function AvatarImage({ src }: { src?: string }) {
  return src ? (
    <img src={src} alt="" className="object-cover w-full h-full" />
  ) : null;
}

export function AvatarFallback({ children }: any) {
  return (
    <span className="text-gray-600 font-medium text-lg">{children}</span>
  );
}
