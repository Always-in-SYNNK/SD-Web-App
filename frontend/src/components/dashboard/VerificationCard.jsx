export function VerificationCard() {
  return (
    <div className="bg-gray-50 p-8 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
      <div className="text-center">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow">
          <span className="text-[#035b9d] text-xl font-bold">+</span>
        </div>
        <p className="font-bold text-gray-600">Request External Verification</p>
        <p className="text-xs text-gray-400 mt-1">
          Connect 3rd party providers like LinkedIn or Coursera
        </p>
      </div>
    </div>
  );
}