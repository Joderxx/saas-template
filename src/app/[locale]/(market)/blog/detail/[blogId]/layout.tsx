import {ReactNode} from "react";

export default function Layout({children}: {children: ReactNode}) {
  return (
    <div className="w-full">
      <div className="prose">

      </div>
      {children}
    </div>
  )
}