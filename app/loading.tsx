export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
        <p className="text-gray-500 text-sm">جاري التحميل...</p>
      </div>
    </div>
  )
}
