import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ThemeProvider } from "@/providers/theme-provider";
import { MainLayout } from "@/components/layout/main-layout";
import Home from "@/pages/home";
import { wagmiAdapter } from "@/config/reown";
import { WagmiProvider } from "wagmi";
function App() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </WagmiProvider>
  );
}

export default App;
