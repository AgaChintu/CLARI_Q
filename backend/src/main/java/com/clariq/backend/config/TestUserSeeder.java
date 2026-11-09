package com.clariq.backend.config;

import com.clariq.backend.entity.*;
import com.clariq.backend.repository.*;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Configuration
@ConditionalOnProperty(name = "app.seed-test-data", havingValue = "true")
public class TestUserSeeder {

    @Bean
    public CommandLineRunner createTestData(
            UserRepository userRepository,
            ClassRepository classRepository,
            SubjectRepository subjectRepository,
            StudentProfileRepository studentProfileRepository,
            TeacherAssignmentRepository teacherAssignmentRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            // 1. Create test student
            User student = userRepository
                    .findByLoginIdAndRole("STU001", UserRole.STUDENT)
                    .orElseGet(() -> {
                        User user = new User();
                        user.setLoginId("STU001");
                        user.setName("Test Student");
                        user.setPasswordHash(
                                passwordEncoder.encode("Student@123"));
                        user.setRole(UserRole.STUDENT);
                        user.setActive(true);
                        return userRepository.save(user);
                    });

            // 2. Create test teacher
            User teacher = userRepository
                    .findByLoginIdAndRole("TCH001", UserRole.TEACHER)
                    .orElseGet(() -> {
                        User user = new User();
                        user.setLoginId("TCH001");
                        user.setName("Test Teacher");
                        user.setPasswordHash(
                                passwordEncoder.encode("Teacher@123"));
                        user.setRole(UserRole.TEACHER);
                        user.setActive(true);
                        return userRepository.save(user);
                    });

            // 3. Create class
            ClassEntity studentClass = classRepository.findAll()
                    .stream()
                    .filter(c -> c.getClassName().equals("Class 10"))
                    .findFirst()
                    .orElseGet(() -> {
                        ClassEntity c = new ClassEntity();
                        c.setClassName("Class 10");
                        return classRepository.save(c);
                    });

            // 4. Create subject
            Subject subject = subjectRepository.findAll()
                    .stream()
                    .filter(s -> s.getSubjectName().equals("Mathematics"))
                    .findFirst()
                    .orElseGet(() -> {
                        Subject s = new Subject();
                        s.setSubjectName("Mathematics");
                        return subjectRepository.save(s);
                    });

            // 5. Link student to class
            StudentProfile profile = studentProfileRepository
                    .findByUserId(student.getId())
                    .orElseGet(() -> {
                        StudentProfile p = new StudentProfile();
                        p.setUser(student);
                        return p;
                    });

            profile.setClassEntity(studentClass);
            studentProfileRepository.save(profile);

            // 6. Assign teacher to class and subject
            boolean assignmentExists = teacherAssignmentRepository.findAll()
                    .stream()
                    .anyMatch(a -> a.getTeacher().getId().equals(teacher.getId())
                            && a.getClassEntity().getId()
                                    .equals(studentClass.getId())
                            && a.getSubject().getId().equals(subject.getId()));

            if (!assignmentExists) {
                TeacherAssignment assignment = new TeacherAssignment();
                assignment.setTeacher(teacher);
                assignment.setClassEntity(studentClass);
                assignment.setSubject(subject);

                teacherAssignmentRepository.save(assignment);
            }

            System.out.println("ClariQ test data is ready!");
        };
    }
}