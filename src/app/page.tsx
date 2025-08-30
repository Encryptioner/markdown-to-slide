import Editor from "@/components/Editor";
import SlidePreview from "@/components/SlidePreview";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LandingSections from "@/components/LandingSections";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <div className="flex flex-col lg:flex-row flex-1 bg-white">
          <div className="w-full lg:w-1/2 h-[50vh] lg:h-auto lg:flex-1">
            <Editor />
          </div>
          <div className="w-full lg:w-1/2 h-[50vh] lg:h-auto lg:flex-1">
            <SlidePreview />
          </div>
        </div>
        
        <LandingSections />
      </main>
      
      <Footer />
    </div>
  );
}