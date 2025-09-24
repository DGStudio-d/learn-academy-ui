import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GuestQuizList } from '@/components/guest/GuestQuizList';
import { useTranslation } from 'react-i18next';

export function GuestQuizzes() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-bg py-16 lg:py-24">
        <div className="container text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Try Our <span className="text-gradient">Quizzes</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Test your language skills with our interactive quizzes. No registration required - 
            just enter your name and start learning!
          </p>
        </div>
      </section>

      {/* Quiz List */}
      <section className="py-20">
        <div className="container">
          <GuestQuizList showHeader={false} />
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default GuestQuizzes;
