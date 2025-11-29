import React, { useState, useEffect } from 'react';
import InputSection from './components/InputSection';
import ResultSection from './components/ResultSection';
import { analyzeWritingTask, generateMindMapImage } from './services/geminiService';
import { GeneratedResult, LoadingState } from './types';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'idle', message: '' });
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success based on instructions to mitigate race condition
      setHasApiKey(true);
    }
  };

  const handleAnalyze = async (text: string, image: string | undefined, mimeType: string | undefined) => {
    try {
      // 1. Analyze
      setLoadingState({ status: 'analyzing', message: 'Gemini 正在分析题目...' });
      const analysis = await analyzeWritingTask(text, image, mimeType);

      // 2. Generate Images in Parallel (Basic & Advanced)
      setLoadingState({ status: 'generating-basic', message: 'Nano Banana Pro 正在绘制思维导图...' });
      
      const [basicUrl, advancedUrl] = await Promise.all([
        generateMindMapImage(analysis, 'basic'),
        generateMindMapImage(analysis, 'advanced')
      ]);

      setResult({
        analysis,
        basicMapUrl: basicUrl,
        advancedMapUrl: advancedUrl
      });
      setLoadingState({ status: 'complete', message: '' });

    } catch (error: any) {
      console.error(error);
      if (error.message && error.message.includes("Requested entity was not found")) {
        // Handle case where API key might be invalid/project not found
        setHasApiKey(false);
        setLoadingState({ status: 'idle', message: '' });
        alert("API Key 似乎无效或未选择，请重新选择。");
      } else {
        setLoadingState({ status: 'error', message: '哎呀，生成出错了，请稍后再试！' });
      }
    }
  };

  const handleReset = () => {
    setResult(null);
    setLoadingState({ status: 'idle', message: '' });
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] bg-amber-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full text-center border-4 border-amber-200">
          <div className="text-6xl mb-6">✏️</div>
          <h1 className="text-3xl md:text-4xl font-fun text-amber-600 mb-4">AI 写作魔法师</h1>
          <p className="text-gray-600 mb-8 text-lg">
            欢迎使用 AI 写作助手！为了使用 Nano Banana Pro 强大的绘图能力，我们需要您选择一个 API Key。
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-bold text-xl shadow-lg hover:scale-105 transition-transform"
          >
            选择 API Key 开始使用 🚀
          </button>
          <p className="mt-4 text-xs text-gray-400">
            请确保选择关联了计费项目的 API Key。<br/>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-amber-500">
              了解更多关于计费的信息
            </a>
          </p>
        </div>
      </div>
    );
  }

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
              <p className="font-bold">出错啦</p>
              <p>{loadingState.message}</p>
              <button onClick={() => setLoadingState({status: 'idle', message: ''})} className="mt-2 text-sm underline">重试</button>
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
                    style={{ width: loadingState.status === 'analyzing' ? '30%' : '80%' }}
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