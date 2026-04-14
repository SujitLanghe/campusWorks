# campusWorks - Backend

campusWorks is a platform designed to bridge the communication and collaboration gap between college professors (who have industry-level problem statements) and students (who are interested in working on them).

## Objective
To provide a seamless workflow where professors can publish problem statements, students can apply to work on them, and both parties can collaborate through assigned tasks until the project's successful completion and certification.

## Tech Stack
Based on the current environment, the backend uses:
- **Node.js + Express.js**: REST API framework.
- **MongoDB + Mongoose**: Database & Schema modeling.
- **JWT & bcryptjs**: Authentication and security.
- **Cloudinary + Multer**: Media upload and storage (for task submission proofs like photos and videos).
- **PDFKit**: For generating certificates upon project completion.
- **node-cron**: For handling deadline checks and background tasks.

---

## Core Database Schemas (Proposed Design)

### 1. **User Schemas (Role-Based)**
- **Admin**: Contains basic auth details (email, password). Has access to view all system data.
- **Professor**: Contains name, email, department, professional qualifications. Can publish projects, approve applications, and assign tasks.
- **Student**: Contains name, email, enrollment number, branch, semester, skills, and qualifications (resume/portfolio). Can browse and apply to projects.

### 2. **Project Schema**
- `title`, `description`, `requirements`
- `professorId` (Reference to Professor)
- `studentIds` (Array of References to Students - allows for individual or team projects)
- `status`: ['Published', 'Ongoing', 'Completed']
- `createdAt`, `completedAt`

### 3. **Application Schema**
- `projectId` (Reference to Project)
- `studentId` (Reference to Student)
- `status`: ['Pending', 'Approved', 'Rejected']
- `appliedAt`

### 4. **Task Schema**
- `projectId` (Reference to Project)
- `title`, `description`
- `deadline` (Date)
- `status`: ['Assigned', 'Submitted', 'Rework Required', 'Incomplete', 'Locked', 'Completed']

### 5. **Submission Schema**
- `taskId` (Reference to Task)
- `mediaUrls`: [Array of Cloudinary URLs for videos, screenshots, or code repos]
- `submittedAt`

---

## Access Control & Core Workflows

1. **General/Public View:**
   - Any visitor can see the "General Page" listing all published, ongoing, and completed projects.
2. **Student Workflow:**
   - Register/Login.
   - Browse projects and apply (if they meet the criteria).
   - Once approved, access the Project Dashboard.
   - See assigned tasks. Upload video/photo proofs via Cloudinary integration before the deadline.
3. **Professor Workflow:**
   - Register/Login.
   - Create and publish new problem statements (Projects).
   - View student applications for each project. Approve the best candidate(s) to form a project team.
   - Assign tasks with specific deadlines.
   - Review task submissions. If unsatisfactory, the professor can "Reject" the submission, update the deadline, and request a rework. Mark project as completed when all tasks are done.
4. **Admin Workflow:**
   - See an aggregated dashboard of all professors, students, and projects.
   - Track which student is working under which professor.

---

## Background Handlers & Automation
- **Deadline Checker:** Utilizing `node-cron`, the backend runs a daily/hourly script to find tasks where the `deadline` has passed and no submission exists. It automatically marks these tasks as `Incomplete` and updates the task so it gets `locked`.
- **Missed Deadline Notifications:** When a deadline is missed, the system generates an alert/notification for the professor.
- **Certificate Generation:** When a professor marks a project as `Completed`, the backend uses `PDFKit` to dynamically generate a certificate template, fill in the student and professor names, and provide a downloadable link to the student.

---

## 📌 Proposed Additional Features & Clarifications (For Review)

While the requirements provided cover the core functionality well, here are some missing pieces or features you might want to consider to make the platform robust:

1. **Authentication Verification**: Does anyone can register as a professor? We might need an "Admin Approval" step for Professor accounts to verify their authenticity.
2. **True Communication / Chat System**: The core problem was "can't communicate". While tasks and submissions help manage the work, having a **Comment Thread / Messaging feature** directly on the project or task page will greatly improve collaboration.
3. **In-App/Email Notifications**: Students need to be notified when they are approved or rejected, or when a new task is assigned. Professors need to be notified when a student applies or submits a task. (Consider using something like `nodemailer` if you want emails).

Let me know if you would like to include these additional features in our implementation plan!
