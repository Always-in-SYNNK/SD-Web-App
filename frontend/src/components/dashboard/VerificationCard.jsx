export function VerificationCard() {
  return (
    <article className="bg-gray-50 p-8 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
      <section className="text-center">
        <figure className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow">
          <i className="text-[#035b9d] text-xl font-bold">+</i>
        </figure>
        <p className="font-bold text-gray-600">Request External Verification</p>
        <p className="text-xs text-gray-400 mt-1">
          Connect 3rd party providers like LinkedIn or Coursera
        </p>
      </section>
    </article>
  );
}