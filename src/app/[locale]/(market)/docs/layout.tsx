import DocsSidebar from "./docs-sidebar";


export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex pt-16 pl-16">
      <div className="w-64">
        <DocsSidebar />
      </div>
      <div className="w-full">
        {children}
      </div>
    </div>
  )
}
