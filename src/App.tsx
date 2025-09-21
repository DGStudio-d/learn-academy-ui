import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Languages } from "./pages/Languages";
import { Teachers } from "./pages/Teachers";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Programs } from "./pages/Programs";
import { Profile } from "./pages/Profile";
import { QuizAttempt } from "./pages/QuizAttempt";
import { MeetingRoom } from "./pages/MeetingRoom";
import { StudentDashboard } from "./pages/dashboard/StudentDashboard";
import { TeacherDashboard } from "./pages/dashboard/TeacherDashboard";
import { AdminDashboard } from "./pages/dashboard/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/languages" element={<Languages />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/quiz/:quizId" element={<QuizAttempt />} />
          <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
