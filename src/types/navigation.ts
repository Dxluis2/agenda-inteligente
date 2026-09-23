import { Career } from './career';
import { Subject } from './subject';
import { Course } from './course';
export * from './course';
export type RootStackParamList = {
  RoleSelection: undefined;
  Login: undefined;
  ActivateAccount: undefined;

  AdminTabs: undefined;
  TeacherTabs: undefined;
  StudentTabs: undefined;

  RegisterUser: undefined;
  UsersList: undefined;
  PendingUsers: undefined;
  CreateGroup: undefined;
  GroupList: undefined;
  CreateCareer: undefined;
  CareerList: undefined;


  TeacherHome: undefined;
  StudentHome: undefined;
  CreateSubject: undefined;
  SubjectsList: undefined;
  SubjectDetails: undefined;
  CreateTask: undefined;
  TasksList: undefined;
    AdminSubjectList: {
  career: Career;
};
CourseList: {
  subject: Subject;
};
EditSubject: {
  subject: Subject;
};
EditCourse: {
  course: Course;
};
EditCareer: {
  career: Career;
};
};
