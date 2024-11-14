export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-between gap-4">
    <div className="flex flex-col gap-4">
      {children}
    </div>
    <div className="flex justify-end  gap-4 w-96">
      <div className="w-full border sticky top-20 flex flex-col gap-4 text-center justify-center items-center text-primary/50 font-bold text-3xl shadow-md p-4 rounded-lg h-96">
        AD
      </div>
    </div>
  </div>
}