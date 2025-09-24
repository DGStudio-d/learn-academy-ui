import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Award, 
  Star,
  Target,
  Zap,
  Crown,
  Medal,
  Flame,
  BookOpen,
  Calendar,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

interface Achievement {
  id: number;
  title: string;
  description: string;
  earned_at: string;
  badge_icon?: string;
}

interface AchievementSystemProps {
  achievements?: Achievement[];
}

export function AchievementSystem({ achievements = [] }: AchievementSystemProps) {
  // Mock milestone data for progress tracking
  const milestones = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first quiz",
      icon: BookOpen,
      target: 1,
      current: achievements.length > 0 ? 1 : 0,
      type: "quiz",
      earned: achievements.some(a => a.title.includes("First") || a.title.includes("Quiz"))
    },
    {
      id: 2,
      title: "Quiz Master",
      description: "Complete 10 quizzes",
      icon: Target,
      target: 10,
      current: Math.min(achievements.length * 2, 10),
      type: "quiz",
      earned: achievements.length >= 5
    },
    {
      id: 3,
      title: "Perfect Score",
      description: "Get 100% on any quiz",
      icon: Star,
      target: 1,
      current: achievements.some(a => a.title.includes("Perfect")) ? 1 : 0,
      type: "performance",
      earned: achievements.some(a => a.title.includes("Perfect"))
    },
    {
      id: 4,
      title: "Consistent Learner",
      description: "Attend 5 meetings",
      icon: Calendar,
      target: 5,
      current: Math.min(achievements.length, 5),
      type: "attendance",
      earned: achievements.length >= 3
    },
    {
      id: 5,
      title: "Rising Star",
      description: "Maintain 80% average score",
      icon: TrendingUp,
      target: 80,
      current: 75 + (achievements.length * 2),
      type: "performance",
      earned: achievements.length >= 4
    },
    {
      id: 6,
      title: "Dedication",
      description: "Complete 30 days of learning",
      icon: Flame,
      target: 30,
      current: Math.min(achievements.length * 5, 30),
      type: "streak",
      earned: achievements.length >= 6
    }
  ];

  const getIconForAchievement = (achievement: Achievement) => {
    const iconName = achievement.badge_icon || 'trophy';
    const iconMap: { [key: string]: any } = {
      trophy: Trophy,
      award: Award,
      star: Star,
      crown: Crown,
      medal: Medal,
      target: Target,
      zap: Zap,
      flame: Flame,
      book: BookOpen,
      calendar: Calendar,
      trending: TrendingUp
    };
    
    return iconMap[iconName] || Trophy;
  };

  const earnedAchievements = achievements.filter(a => a.earned_at);
  const earnedMilestones = milestones.filter(m => m.earned);
  const inProgressMilestones = milestones.filter(m => !m.earned && m.current > 0);
  const lockedMilestones = milestones.filter(m => !m.earned && m.current === 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Achievements & Milestones</h2>
        <p className="text-muted-foreground">Track your progress and celebrate your accomplishments</p>
      </div>

      {/* Achievement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">{earnedAchievements.length}</div>
            <div className="text-sm text-muted-foreground">Achievements Earned</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{earnedMilestones.length}</div>
            <div className="text-sm text-muted-foreground">Milestones Reached</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{inProgressMilestones.length}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
      </div>

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Earned Achievements</span>
            </CardTitle>
            <CardDescription>Congratulations on your accomplishments!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedAchievements.map((achievement) => {
                const IconComponent = getIconForAchievement(achievement);
                return (
                  <div key={achievement.id} className="p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-yellow-500/10 rounded-lg">
                        <IconComponent className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700">
                        Earned
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(achievement.earned_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestone Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-500" />
            <span>Milestone Progress</span>
          </CardTitle>
          <CardDescription>Track your progress towards learning milestones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Earned Milestones */}
          {earnedMilestones.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 text-green-600">Completed Milestones</h4>
              <div className="grid gap-3">
                {earnedMilestones.map((milestone) => {
                  const IconComponent = milestone.icon;
                  return (
                    <div key={milestone.id} className="flex items-center space-x-4 p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <IconComponent className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{milestone.title}</h3>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* In Progress Milestones */}
          {inProgressMilestones.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 text-blue-600">In Progress</h4>
              <div className="grid gap-4">
                {inProgressMilestones.map((milestone) => {
                  const IconComponent = milestone.icon;
                  const progress = (milestone.current / milestone.target) * 100;
                  
                  return (
                    <div key={milestone.id} className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <IconComponent className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{milestone.title}</h3>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{milestone.current}/{milestone.target}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {Math.round(progress)}% complete
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Locked Milestones */}
          {lockedMilestones.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 text-gray-600">Upcoming Milestones</h4>
              <div className="grid gap-3">
                {lockedMilestones.map((milestone) => {
                  const IconComponent = milestone.icon;
                  return (
                    <div key={milestone.id} className="flex items-center space-x-4 p-3 border rounded-lg opacity-60">
                      <div className="p-2 bg-gray-500/10 rounded-lg">
                        <IconComponent className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </div>
                      <Badge variant="outline" className="text-gray-500">
                        Locked
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-purple-500" />
            <span>Tips for Earning Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <p>Complete quizzes regularly to unlock performance-based achievements</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <p>Attend live meetings to earn attendance milestones</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <p>Maintain consistent study habits to unlock streak achievements</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <p>Aim for high scores to earn performance excellence badges</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}