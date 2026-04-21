import { useState } from "react";

export function CVUploadSection({ onFileSelect }) {
  const [fileName, setFileName] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <section className="bg-white p-8 lg:p-12 rounded-xl shadow-sm">
      <header className="mb-10">
        <h3 className="text-2xl font-bold text-[#1b1c1c] mb-2">CV / Resume</h3>
        <p className="text-gray-400 text-sm">Upload your latest CV.</p>
      </header>

      <div className="group relative border-2 border-dashed border-gray-200 hover:border-[#035b9d] rounded-2xl p-12 transition-all duration-300 bg-gray-50/30 hover:bg-blue-50/20 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform text-3xl">
          📄
        </div>
        {fileName ? (
          <p className="font-bold text-[#035b9d]">{fileName}</p>
        ) : (
          <>
            <h4 className="font-bold text-[#1b1c1c] mb-2">
              Drop your CV here, or <span className="text-[#035b9d] cursor-pointer hover:underline">browse files</span>
            </h4>
            <p className="text-sm text-gray-400">PDF, Word or Image (Max 5MB)</p>
          </>
        )}
        <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer" />
      </div>
    </section>
  );
}