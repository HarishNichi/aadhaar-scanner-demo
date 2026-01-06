import AadhaarQRReader from "@/components/AadhaarQRReader";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <main className="max-w-4xl mx-auto">
        <AadhaarQRReader />
      </main>
    </div>
  );
}
