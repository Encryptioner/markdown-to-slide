import Editor from "@/components/Editor";
import SlidePreview from "@/components/SlidePreview";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="w-full lg:w-1/2 h-[45vh] lg:h-auto lg:min-h-0 flex-1">
          <Editor />
        </div>
        <div className="w-full lg:w-1/2 h-[45vh] lg:h-auto lg:min-h-0 flex-1">
          <SlidePreview />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}