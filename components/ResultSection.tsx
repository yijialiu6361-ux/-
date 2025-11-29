import React, { useState } from 'react';
import { GeneratedResult } from '../types';

interface ResultSectionProps {
  result: GeneratedResult;
  onReset: () => void;
}

const ResultSection: React.FC<ResultSectionProps> = ({ result, onReset }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-purple-200">
        <div className="bg-purple-50 p-6 border-b border-purple-100 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-fun text-purple-700">✨ 写作魔法生成啦！</h2>
            <p className="text-purple-600 mt-1">主题：<span className="font-bold">{result.analysis.topic}</span></p>
          </div>
          <button 
            onClick={onReset}
            className="text-sm px-4 py-2 rounded-full border border-purple-300 text-purple-600 hover:bg-purple-100 transition-colors"
          >
            开始新写作
          </button>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                activeTab === 'basic' 
                  ? 'bg-white text-purple-600 shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🌱 基础版（结构+好词）
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                activeTab === 'advanced' 
                  ? 'bg-white text-pink-600 shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🚀 升级版（结构+好句）
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image Area */}
            <div className="lg:col-span-2 space-y-4">
               <div className="relative group rounded-2xl overflow-hidden shadow-lg border-2 border-gray-100 bg-gray-50 aspect-[4/3]">
                 <img 
                   src={activeTab === 'basic' ? result.basicMapUrl : result.advancedMapUrl} 
                   alt={activeTab === 'basic' ? "Basic Mind Map" : "Advanced Mind Map"} 
                   className="w-full h-full object-contain"
                 />
                 <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-end justify-end p-4 opacity-0 group-hover:opacity-100">
                   <a 
                     href={activeTab === 'basic' ? result.basicMapUrl : result.advancedMapUrl} 
                     download={`mindmap-${activeTab}.png`}
                     className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg font-medium hover:bg-gray-100"
                   >
                     下载图片
                   </a>
                 </div>
               </div>
               <p className="text-center text-sm text-gray-500">
                 * AI生成的文字可能并不完美，请结合右侧文字提示使用哦
               </p>
            </div>

            {/* Text Helper Area */}
            <div className="lg:col-span-1 bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-100 h-fit">
               <h3 className="font-fun text-xl text-yellow-700 mb-4 border-b-2 border-yellow-200 pb-2">
                 {activeTab === 'basic' ? '💡 灵感百宝箱' : '📚 佳句赏析'}
               </h3>
               
               <div className="space-y-4">
                 <div>
                   <h4 className="font-bold text-yellow-800 mb-2">写作框架：</h4>
                   <div className="flex flex-wrap gap-2">
                     {result.analysis.structure.map((item, idx) => (
                       <span key={idx} className="bg-white px-3 py-1 rounded-full text-yellow-900 text-sm border border-yellow-200 shadow-sm">
                         {item}
                       </span>
                     ))}
                   </div>
                 </div>

                 {activeTab === 'basic' ? (
                   <div className="animate-fade-in">
                     <h4 className="font-bold text-yellow-800 mb-2">推荐好词：</h4>
                     <div className="flex flex-wrap gap-2">
                       {result.analysis.keywords.map((word, idx) => (
                         <span key={idx} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg text-sm font-medium">
                           {word}
                         </span>
                       ))}
                     </div>
                   </div>
                 ) : (
                   <div className="animate-fade-in">
                     <h4 className="font-bold text-yellow-800 mb-2">示范句子：</h4>
                     <ul className="space-y-3">
                       {result.analysis.sentences.map((sentence, idx) => (
                         <li key={idx} className="bg-white p-3 rounded-lg text-gray-700 text-sm border border-yellow-200 shadow-sm leading-relaxed">
                           " {sentence} "
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultSection;
