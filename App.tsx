import React, { useState } from 'react';
import InputSection from './components/InputSection';
import ResultSection from './components/ResultSection';
import { analyzeWritingTask, generateMindMapImage } from './services/geminiService';
import { GeneratedResult, LoadingState } from './types';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'idle', message: '' });
  const [result, setResult] = useState<GeneratedResult | null>(null);

  const handleAnalyze = async (text: string, image: string | undefined, mimeType: string | undefined) => {
    try {
      // 1. Analyze
      setLoadingState({ status: 'analyzing', message: 'Gemini 正在分析题目...' });
      const analysis = await analyzeWritingTask(text, image, mimeType);

      // 2. Generate Basic Image
      setLoadingState({ status: 'generating-basic', message: 'Nano Banana Pro 正在绘制基础思维导图...' });
      const basicUrl = await generateMindMapImage(analysis, 'basic');

      // 3. Generate Advanced Image
      setLoadingState({ status: 'generating-advanced', message: 'Nano Banana Pro 正在绘制升级版导图...' });
      const advancedUrl = await generateMindMapImage(analysis, 'advanced');

      setResult({
        analysis,
        basicMapUrl: basicUrl,
        advancedMapUrl: advancedUrl
      });
      setLoadingState({ status: 'complete', message: '' });

    } catch (error) {
      console.error(error);
      setLoadingState({ status: 'error', message: '哎呀，生成出错了，请稍后再试！' });
    }
  };

  const handleReset = () => {
    setResult(null);
    setLoadingState({ status: 'idle', message: '' });
  };

  return (
    <div className="min-h-screen bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] bg-amber-50">
      <header className="bg-gradient-to-b from-amber-400 to-orange-400 py-8 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-fun text-white drop-shadow-md">
            ✏️ AI 写作魔法师
          </h1>
          <p className="text-white mt-2 opacity-90 text-lg">
            基于 Gemini 3 Pro & Nano Banana Pro
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {loadingState.status === 'error' && (
           <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md" role="alert">
              <p className="font-bold">Error</p>
              <p>{loadingState.message}</p>
              <button onClick={() => setLoadingState({status: 'idle', message: ''})} className="mt-2 text-sm underline">Try Again</button>
           </div>
        )}

        {/* Loading Overlay */}
        {(loadingState.status !== 'idle' && loadingState.status !== 'complete' && loadingState.status !== 'error') && (
           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm">
             <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4 animate-bounce-slow">
               <div className="text-6xl mb-4 animate-pulse">🎨</div>
               <h3 className="text-xl font-bold text-gray-800 mb-2">魔法施展中...</h3>
               <p className="text-amber-600">{loadingState.message}</p>
               <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                 <div 
                    className="bg-amber-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: loadingState.status === 'analyzing' ? '30%' : loadingState.status === 'generating-basic' ? '60%' : '90%' }}
                 ></div>
               </div>
             </div>
           </div>
        )}

        {!result ? (
          <InputSection 
            onAnalyze={handleAnalyze} 
            isProcessing={loadingState.status !== 'idle' && loadingState.status !== 'error'} 
          />
        ) : (
          <ResultSection result={result} onReset={handleReset} />
        )}
      </main>

      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Powered by Google Gemini 3 Pro</p>
      </footer>
    </div>
  );
};

export default App;
