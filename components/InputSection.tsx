import React, { useRef, useState } from 'react';

interface InputSectionProps {
  onAnalyze: (text: string, image: string | undefined, mimeType: string | undefined) => void;
  isProcessing: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isProcessing }) => {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | undefined>(undefined);
  const [rawBase64, setRawBase64] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        
        // Extract raw base64 and mime type
        const matches = result.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          setMimeType(matches[1]);
          setRawBase64(matches[2]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text && !rawBase64) return;
    onAnalyze(text, rawBase64, mimeType);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border-4 border-yellow-200">
      <h2 className="text-2xl font-fun text-amber-600 mb-6 flex items-center">
        <span className="text-3xl mr-2">📝</span> 第一步：告诉我你想写什么？
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-bold mb-2">
            写下你的作文题目或要求：
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="例如：写一写我最难忘的一次旅行..."
            className="w-full p-4 rounded-xl border-2 border-amber-100 focus:border-amber-400 focus:ring-amber-200 focus:outline-none transition-colors h-32 resize-none text-lg"
          />
        </div>

        <div className="border-t-2 border-dashed border-gray-200 pt-6">
          <label className="block text-gray-700 font-bold mb-2">
            或者拍一张老师布置的作业单：
          </label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              上传图片
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            {preview && (
              <div className="relative group">
                <img src={preview} alt="Preview" className="h-16 w-16 object-cover rounded-lg border-2 border-amber-300" />
                <button
                  type="button"
                  onClick={() => { setPreview(null); setRawBase64(undefined); setMimeType(undefined); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing || (!text && !rawBase64)}
          className={`w-full py-4 rounded-xl text-white font-fun text-xl shadow-lg transform transition-all 
            ${isProcessing || (!text && !rawBase64) 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:scale-[1.02] hover:shadow-orange-200'}`}
        >
          {isProcessing ? 'AI 正在思考中...' : '开始生成写作指导 🚀'}
        </button>
      </form>
    </div>
  );
};

export default InputSection;
