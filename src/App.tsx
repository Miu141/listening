import { Routes, Route } from "react-router-dom";
import LevelSelectionPage from "./pages/LevelSelectionPage";
import TopicSelectionPage from "./pages/TopicSelectionPage";
import GeneratingPage from "./pages/GeneratingPage";
import ListeningPage from "./pages/ListeningPage";
import ResultPage from "./pages/ResultPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import LegalPage from "./pages/LegalPage";
import CompanyPage from "./pages/CompanyPage";
import ContactPage from "./pages/ContactPage";
import Header from "./components/Header";

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<LevelSelectionPage />} />
          <Route path="/topic-selection" element={<TopicSelectionPage />} />
          <Route path="/generating" element={<GeneratingPage />} />
          <Route path="/listening" element={<ListeningPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/company" element={<CompanyPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
