import { useState } from "react";

import { calculatorApi } from "./api/calculatorApi";
import { Header } from "./components/Header";
import { AUTHOR_EMAIL, AUTHOR_NAME, GITHUB_URL } from "./config/about";
import { Calculator } from "./features/calculator/components/Calculator";
import { AboutDialog } from "./features/about/AboutDialog";

export function App() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="app">
      <Header onOpenAbout={() => setAboutOpen(true)} />
      <main className="app__main">
        <Calculator api={calculatorApi} />
      </main>
      {aboutOpen && (
        <AboutDialog
          api={calculatorApi}
          onClose={() => setAboutOpen(false)}
          authorName={AUTHOR_NAME}
          authorEmail={AUTHOR_EMAIL}
          githubUrl={GITHUB_URL}
        />
      )}
    </div>
  );
}
