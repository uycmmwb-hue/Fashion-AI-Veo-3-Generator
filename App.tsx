
import React, { useState, useEffect } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { ScriptGallery } from './components/ScriptGallery';
import { VeoPromptDisplay } from './components/VeoPromptDisplay';
import { AppConfig, Script, VideoStyle, VideoType, Language, Accent, GeneratedVeoData } from './types';
import { generateScripts, generateVeoPrompt } from './services/geminiService';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function App() {
  // --- State ---
  const [hasApiKey, setHasApiKey] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [config, setConfig] = useState<AppConfig>({
    videoStyle: VideoStyle.WITH_DIALOGUE,
    videoType: VideoType.SINGLE_NARRATION,
    language: Language.VIETNAMESE,
    accent: Accent.NORTHERN,
    productName: '',
    productDescription: '',
  });
  
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [veoData, setVeoData] = useState<GeneratedVeoData | null>(null);
  
  const [isGeneratingScripts, setIsGeneratingScripts] = useState(false);
  const [isGeneratingVeo, setIsGeneratingVeo] = useState(false);

  // --- API Key Check ---
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
        } catch (e) {
          console.error("Error checking API key", e);
        }
      }
    };
    checkKey();
  }, []);

  const handleStartApp = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
        if (!hasKey) {
          alert("Bạn cần chọn API Key để sử dụng các tính năng AI.");
        }
      } catch (e) {
        console.error("Error selecting API key", e);
      }
    } else {
      console.warn("Window.aistudio not found. Assuming development mode or fallback.");
      // In dev environment without the wrapper, we might want to let it pass if env var is set manually,
      // but for the prompt requirements, we enforce the flow.
      setHasApiKey(true); 
    }
  };

  // --- Handlers ---

  const handleGenerateScripts = async () => {
    setIsGeneratingScripts(true);
    try {
      const generatedScripts = await generateScripts(config);
      setScripts(generatedScripts);
      setStep(2);
    } catch (error) {
      console.error(error);
      // If error is related to API Key, prompt user again
      if (error instanceof Error && (error.message.includes("API Key") || error.message.includes("403"))) {
         alert("Lỗi API Key. Vui lòng chọn lại Key.");
         setHasApiKey(false);
      } else {
         alert("Không thể tạo kịch bản. Vui lòng thử lại.");
      }
    } finally {
      setIsGeneratingScripts(false);
    }
  };

  const handleGenerateVeo = async () => {
    if (!selectedScript) return;
    setIsGeneratingVeo(true);
    try {
      const data = await generateVeoPrompt(selectedScript, config);
      setVeoData(data);
      setStep(3);
    } catch (error) {
      console.error(error);
       if (error instanceof Error && (error.message.includes("API Key") || error.message.includes("403"))) {
         alert("Lỗi API Key. Vui lòng chọn lại Key.");
         setHasApiKey(false);
      } else {
         alert("Không thể tạo prompt Veo. Vui lòng thử lại.");
      }
    } finally {
      setIsGeneratingVeo(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setScripts([]);
    setSelectedScript(null);
    setVeoData(null);
  };

  const handleBackToGallery = () => {
    setStep(2);
    setVeoData(null); // Clear the specific Veo data but keep the scripts list
  };

  // --- Render ---

  if (!hasApiKey) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-fashion-50 font-sans text-fashion-900 relative overflow-hidden">
         {/* Decorative elements */}
         <div className="absolute top-0 left-0 w-64 h-64 bg-fashion-200 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
         <div className="absolute bottom-0 right-0 w-96 h-96 bg-fashion-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-30"></div>

         <div className="text-center space-y-8 p-12 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white max-w-lg z-10 mx-4">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-fashion-100 rounded-2xl flex items-center justify-center rotate-3 shadow-sm">
                 <Sparkles className="w-10 h-10 text-fashion-600" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-4xl font-serif font-bold text-fashion-900">
                Fashion<span className="text-fashion-500">AI</span>
              </h1>
              <p className="text-sm font-bold tracking-widest text-fashion-400 uppercase">Script & Veo-3 Generator</p>
            </div>
            
            <p className="text-fashion-600 leading-relaxed">
              Công cụ chuyên nghiệp hỗ trợ xây dựng kịch bản video thời trang và tạo Prompt Veo-3 chuẩn điện ảnh từ hình ảnh sản phẩm của bạn.
            </p>
            
            <button 
              onClick={handleStartApp}
              className="group w-full bg-fashion-900 text-white px-8 py-4 rounded-xl hover:bg-fashion-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 font-medium"
            >
              Bắt đầu ngay
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="pt-4 border-t border-fashion-100">
               <p className="text-xs text-fashion-400">
                 Powered by Google Gemini 2.5 Flash & Veo-3
               </p>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-fashion-50 font-sans text-fashion-900 overflow-hidden">
      
      {/* Sidebar: Always visible on Step 1 & 2 */}
      {(step === 1 || step === 2) && (
        <ConfigPanel 
          config={config} 
          setConfig={setConfig} 
          onGenerateScripts={handleGenerateScripts}
          isGeneratingScripts={isGeneratingScripts}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 h-full relative">
        
        {/* Step 1: Placeholder / Introduction */}
        {step === 1 && (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center select-none">
            <div className="w-40 h-40 bg-fashion-100 rounded-full mb-8 flex items-center justify-center animate-pulse">
               <Sparkles className="w-16 h-16 text-fashion-300 opacity-50" />
            </div>
            <h2 className="text-3xl font-serif text-fashion-400 mb-3">Sẵn sàng sáng tạo</h2>
            <p className="text-fashion-300 max-w-md text-lg">Cấu hình sản phẩm ở bên trái để bắt đầu tạo kịch bản thời trang chuyên nghiệp.</p>
          </div>
        )}

        {/* Step 2: Script Gallery */}
        {step === 2 && (
          <ScriptGallery 
            scripts={scripts} 
            selectedScript={selectedScript}
            onSelectScript={setSelectedScript}
            onGenerateVeo={handleGenerateVeo}
            isGeneratingVeo={isGeneratingVeo}
          />
        )}

        {/* Step 3: Final Results (Full Screen Overlay) */}
        {step === 3 && veoData && selectedScript && (
          <div className="absolute inset-0 z-50 bg-fashion-50">
            <VeoPromptDisplay 
              data={veoData}
              script={selectedScript}
              config={config}
              onReset={handleReset}
              onBack={handleBackToGallery}
            />
          </div>
        )}

      </div>
    </div>
  );
}
