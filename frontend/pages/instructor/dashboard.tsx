
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { timetableAPI, studentAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { Book, Calendar, Clock, Users, Hash, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MotionDiv = motion.div as any;

export default function InstructorDashboard() {
  const { user, isInstructor, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>({
    pendingRequests: 0,
    acceptedCourses: 0,
    totalClasses: 0,
  });
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // Check if user is authorized
    if (!user || (!isInstructor && user.role !== 'admin')) {
      router.push('/login');
      return;
    }

    loadDashboardData();
  }, [authLoading, isInstructor, user, router]);

  const loadDashboardData = async () => {
    try {
      const [pendingRes, acceptedRes, timetableRes, studentsRes] = await Promise.all([
        timetableAPI.getCourseRequests({ status: 'pending' }),
        timetableAPI.getCourseRequests({ status: 'accepted', instructor_id: user?.id }),
        timetableAPI.getTimetable({ teacher_id: user?.id }),
        studentAPI.getEnrolledStudents(),
      ]);

      setStats({
        pendingRequests: pendingRes.data.requests.length,
        acceptedCourses: acceptedRes.data.requests.length,
        totalClasses: timetableRes.data.timetable.length,
      });

      setEnrolledStudents(studentsRes.data.students || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    { icon: Book, label: 'Pending Requests', value: stats.pendingRequests, color: 'bg-yellow-500' },
    { icon: Calendar, label: 'Accepted Courses', value: stats.acceptedCourses, color: 'bg-green-500' },
    { icon: Clock, label: 'Total Classes', value: stats.totalClasses, color: 'bg-blue-500' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <MotionDiv
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card flex items-center space-x-4"
              >
                <div className={`${stat.color} p-4 rounded-lg text-white`}>
                  <Icon size={32} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </MotionDiv>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/instructor/requests">
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="card hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-purple-500 p-4 rounded-lg text-white">
                  <Book size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Course Requests</h3>
                  <p className="text-gray-600">View and accept course assignments</p>
                </div>
              </div>
            </MotionDiv>
          </Link>

          <Link href="/instructor/timetable">
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="card hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-500 p-4 rounded-lg text-white">
                  <Calendar size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">My Timetable</h3>
                  <p className="text-gray-600">View your class schedule</p>
                </div>
              </div>
            </MotionDiv>
          </Link>
        </div>

        {/* Enrolled Students Section */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Enrolled Students</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enrolledStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No students found enrolled in your courses.</p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">
                          <div className="flex items-center space-x-1">
                             <Hash className="w-3 h-3" />
                             <span>Roll No</span>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center space-x-1">
                             <User className="w-3 h-3" />
                             <span>Name</span>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center space-x-1">
                             <Book className="w-3 h-3" />
                             <span>Course</span>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center space-x-1">
                             <Users className="w-3 h-3" />
                             <span>Section</span>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center space-x-1">
                             <Mail className="w-3 h-3" />
                             <span>Email</span>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrolledStudents.map((student) => (
                        <TableRow key={`${student.id}-${student.course_code}`}>
                          <TableCell className="font-mono">{student.roll_number}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.course_name} <span className="text-xs text-muted-foreground">({student.course_code})</span></TableCell>
                          <TableCell>{student.section_name}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{student.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </MotionDiv>
      </div>
    </Layout>
  );
}
