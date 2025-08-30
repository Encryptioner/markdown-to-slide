import Editor from "@/components/Editor";
import SlidePreview from "@/components/SlidePreview";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-auto">
          <Editor />
        </div>
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-auto">
          <SlidePreview />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}