# 🎓 AI-Powered Smart Campus Lost & Found Management System

An AI-powered web application designed to help students and campus administrators report, manage, track, and recover lost items efficiently within a college campus.

The system combines **Full-Stack Web Development, Machine Learning, Database Management, Data Visualization, and Software Engineering** to provide an organized and intelligent approach to campus lost-and-found management.

🚧 **Project Status:** Under Development

---

## 📌 Table of Contents

* [About the Project](#-about-the-project)
* [Problem Statement](#-problem-statement)
* [Project Objectives](#-project-objectives)
* [Key Features](#-key-features)
* [Technology Stack](#-technology-stack)
* [System Architecture](#-system-architecture)
* [Machine Learning Approach](#-machine-learning-approach)
* [Dataset](#-dataset)
* [Project Modules](#-project-modules)
* [Database Design](#-database-design)
* [Installation and Setup](#-installation-and-setup)
* [Project Structure](#-project-structure)
* [Future Enhancements](#-future-enhancements)
* [Academic Relevance](#-academic-relevance)
* [Contributing](#-contributing)
* [License](#-license)

---

## 📖 About the Project

Losing personal belongings on a college campus is a common problem. Students may lose items such as ID cards, wallets, mobile phones, laptops, books, keys, and other personal belongings.

Traditional lost-and-found systems often depend on manual reporting, physical notice boards, or communication through classmates and college staff. These methods can make tracking and recovering lost items difficult.

The **AI-Powered Smart Campus Lost & Found Management System** aims to digitize this process through a centralized web application.

Students can report lost items, browse available information, and track the status of their reports. Authorized campus operators can manage reports and update recovery statuses.

The project also explores machine learning techniques to predict the recovery status of reported items using historical and project-generated data.

The goal is to make campus lost-and-found management more organized, accessible, and data-driven.

---

## ❗ Problem Statement

Existing campus lost-and-found processes can suffer from several limitations:

* Lost-item reports are scattered across different communication channels.
* Students may have difficulty finding relevant information about lost belongings.
* Manual record management can become inefficient as the number of reports increases.
* Tracking the current status of reported items can be difficult.
* Administrators may lack analytical insights into lost-item reports and recovery patterns.

### Our Solution

We propose a centralized web application that provides:

1. Digital management of lost-and-found records.
2. A structured database for storing and retrieving reports.
3. Authentication and controlled access for authorized operators.
4. Machine learning-based recovery-status prediction.
5. Data visualization for understanding reporting and recovery trends.

---

## 🎯 Project Objectives

* Develop a responsive web application for campus lost-and-found management.
* Provide a centralized platform for managing lost-item reports.
* Implement a backend API to process application requests.
* Store and manage application data using MySQL.
* Develop and compare machine learning classification models.
* Evaluate models using appropriate classification metrics.
* Visualize important trends and patterns in lost-and-found data.
* Apply software engineering principles throughout the development process.

---

## ✨ Key Features

### 1. Lost Item Reporting

* Submit reports containing item names, descriptions, categories, dates, and relevant details.
* Maintain structured records of reported items.
* Make lost-item information easier to organize and retrieve.

### 2. Found Item Management

* Provide a centralized place to manage information about found belongings.
* Allow authorized operators to manage relevant records.
* Support organized handling of reported items.

### 3. Recovery Status Tracking

Each report follows a three-status workflow:

| Status    | Description                                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Pending   | The item has not yet been recovered and remains within the active reporting period.                                                        |
| Recovered | The item has been successfully recovered.                                                                                                  |
| Closed    | The report has passed the defined active reporting period without recovery and is retained according to the system's data-retention rules. |

The recovery status can be managed according to the system's business rules, with authorized operators able to correct predictions where appropriate.

## 🤖 AI and Machine Learning Modules

The project incorporates two distinct AI capabilities: **text similarity-based item discovery** and **recovery-status prediction**.

### 1. Text Similarity-Based Lost & Found Matching

Text similarity is a core feature of the Smart Campus Lost & Found Management System.

It helps identify potentially relevant found-item reports by comparing their descriptions with a user's lost-item description.

For example, a user searching for a *blue water bottle lost near the library* may receive a relevant result described as *a blue bottle found outside the college library*.

Even when descriptions are not identical, text similarity can help identify records containing related terms.

#### Workflow

1. Obtain the lost-item description.
2. Retrieve eligible candidate found-item descriptions.
3. Preprocess the text through normalization and other appropriate cleaning steps.
4. Convert the descriptions into numerical vectors using TF-IDF.
5. Calculate cosine similarity between the lost-item description and candidate descriptions.
6. Rank the candidates by similarity score.
7. Present relevant candidates for users or authorized operators to review.

#### Technologies

* Python
* Pandas
* Scikit-learn
* TF-IDF Vectorization
* Cosine Similarity

#### Benefits

* Reduces dependence on exact keyword matching.
* Helps users discover potentially relevant found-item records.
* Ranks candidate descriptions by textual similarity.
* Provides an explainable, lightweight NLP approach without requiring a large language model.

**Limitation:** Text similarity measures similarities in text, not physical item identity. Similar descriptions may refer to different items, and genuine matches may receive low scores when descriptions differ substantially.

### 2. Recovery Status Prediction

The second AI component focuses on predicting a report's recovery status using structured features and supervised classification algorithms.

The target variable contains three classes:

* `Pending`
* `Recovered`
* `Closed`

The planned algorithms are:

* Logistic Regression
* Decision Tree
* Random Forest
* Gradient Boosting

The models will be evaluated using accuracy, precision, recall, F1-score, and confusion matrices.

The recovery-status labels in the synthetic dataset are generated according to predefined rules. Therefore, the models may learn those rules rather than independent real-world recovery patterns. This limitation will be documented when reporting the results.

### Distinction Between the Two Modules

Text similarity supports item discovery by identifying descriptions that are textually similar.

Recovery-status prediction estimates a report's status class from its features.

The two modules have different objectives and should be developed and evaluated independently.

### 5. Data Visualization

The system is designed to support visual analysis of lost-and-found records, including:

* Number of reported items.
* Distribution of recovery statuses.
* Item-category distribution.
* Reporting trends over time.
* Comparison of model evaluation metrics.

### 6. Database Management

* Store structured item reports and associated information.
* Retrieve records through backend API endpoints.
* Maintain recovery-status information.
* Support consistent data management using MySQL.

### 7. Operator Authentication

* Provide a login mechanism for authorized project operators.
* Restrict administrative operations to authenticated users.
* Support controlled access to report management functionality.

*Features are being developed incrementally. The final implementation may differ from this planned feature list.*

---

## 🛠️ Technology Stack

The project combines frontend development, backend development, database management, and machine learning.

### Frontend

| Technology | Purpose                                    |
| ---------- | ------------------------------------------ |
| HTML5      | Web page structure                         |
| CSS3       | Styling and responsive layouts             |
| JavaScript | Client-side functionality                  |
| React.js   | Component-based user interface             |
| Vite       | Frontend development server and build tool |

### Backend

| Technology | Purpose                                                         |
| ---------- | --------------------------------------------------------------- |
| Node.js    | JavaScript runtime for server-side development                  |
| Express.js | Backend framework for building REST APIs                        |
| MySQL2     | Node.js driver for communicating with MySQL                     |
| CORS       | Controls cross-origin requests between the frontend and backend |
| dotenv     | Manages environment variables and configuration                 |

### Database

| Technology      | Purpose                                     |
| --------------- | ------------------------------------------- |
| MySQL           | Relational database management              |
| MySQL Workbench | Database administration and SQL development |

### Machine Learning and Data Analysis

| Technology   | Purpose                                          |
| ------------ | ------------------------------------------------ |
| Python       | Machine learning development and data processing |
| Pandas       | Dataset manipulation and analysis                |
| NumPy        | Numerical computations                           |
| Scikit-learn | Model training, evaluation, and preprocessing    |
| Matplotlib   | Data visualization and model evaluation plots    |

### Development Tools

| Tool                       | Purpose                               |
| -------------------------- | ------------------------------------- |
| Visual Studio Code         | Code editing and development          |
| Git                        | Version control                       |
| GitHub                     | Source code hosting and collaboration |
| npm                        | JavaScript dependency management      |
| Python virtual environment | Isolated Python dependencies          |

### Technology Stack Summary

**Frontend:** React.js + Vite
**Backend:** Node.js + Express.js
**Database:** MySQL
**Machine Learning:** Python + Scikit-learn
**Data Processing:** Pandas + NumPy
**Version Control:** Git + GitHub

---

## 🏗️ System Architecture

The application follows a client-server architecture with a separate machine learning development workflow.

```text
                   ┌──────────────────────────┐
                   │        User / Operator   │
                   └────────────┬─────────────┘
                                │
                                ▼
                   ┌──────────────────────────┐
                   │       React Frontend     │
                   │        Vite + CSS        │
                   └────────────┬─────────────┘
                                │
                         HTTP / REST API
                                │
                                ▼
                   ┌──────────────────────────┐
                   │     Node.js + Express    │
                   │       Backend API        │
                   └────────────┬─────────────┘
                                │
                                ▼
                   ┌──────────────────────────┐
                   │       MySQL Database     │
                   │     Application Data     │
                   └──────────────────────────┘


         MACHINE LEARNING DEVELOPMENT WORKFLOW

                   ┌──────────────────────────┐
                   │     Source Dataset       │
                   │ Public + Synthetic Data  │
                   └────────────┬─────────────┘
                                │
                                ▼
                   ┌──────────────────────────┐
                   │ Data Preprocessing       │
                   │ Cleaning and Encoding    │
                   └────────────┬─────────────┘
                                │
                                ▼
                   ┌──────────────────────────┐
                   │ Model Training           │
                   │ and Validation           │
                   └────────────┬─────────────┘
                                │
                                ▼
                   ┌──────────────────────────┐
                   │ Model Evaluation         │
                   │ and Comparison           │
                   └──────────────────────────┘
```

The machine learning workflow is developed separately from the web application. Integrating the trained model into the backend is a subsequent implementation step if it is not already complete.

### How the System Works

1. A user interacts with the React frontend.
2. The frontend sends requests to the Express backend.
3. The backend validates requests and processes application logic.
4. MySQL stores and retrieves application records.
5. The machine learning workflow processes the dataset and trains classification models.
6. Model predictions and evaluation results can be incorporated into the application as the relevant integration is implemented.

---

## 🤖 Machine Learning Approach

Machine learning is one of the core academic components of this project.

### Objective

Develop and compare supervised classification models to predict the recovery status associated with an item report.

The target variable is:

`recovery_status`

The classification problem uses three possible labels:

* `Pending`
* `Recovered`
* `Closed`

### Algorithms Under Evaluation

We plan to evaluate the following four classification algorithms.

| Algorithm           | Type                      | Purpose                                               |
| ------------------- | ------------------------- | ----------------------------------------------------- |
| Logistic Regression | Linear classification     | Establish a baseline classifier                       |
| Decision Tree       | Tree-based classification | Learn interpretable decision rules                    |
| Random Forest       | Ensemble learning         | Combine multiple decision trees                       |
| Gradient Boosting   | Ensemble learning         | Improve predictions through sequential model training |

### Machine Learning Workflow

The workflow includes the following stages:

1. Load the dataset.
2. Inspect the dataset structure and data types.
3. Handle missing values and inconsistent records.
4. Identify input features and the target variable.
5. Encode categorical features.
6. Split the dataset into training, validation, and test sets.
7. Train the classification models.
8. Tune model parameters using training and validation data.
9. Evaluate the selected models on held-out test data.
10. Compare the results and document the best-performing model.

### Evaluation Metrics

The models will be evaluated using appropriate classification metrics.

| Metric           | Purpose                                                     |
| ---------------- | ----------------------------------------------------------- |
| Accuracy         | Measures the proportion of correct predictions              |
| Precision        | Measures how many predictions for a class are correct       |
| Recall           | Measures how many actual examples of a class are identified |
| F1-score         | Balances precision and recall                               |
| Confusion Matrix | Shows correct and incorrect predictions for each class      |

The final model and its performance metrics will be documented after the experiments are completed.

**Note on synthetic labels:** The recovery-status target is generated using predefined rules based on observable item and contextual characteristics. A model trained on these labels may reproduce the underlying rules rather than discover independent real-world recovery patterns. The project will document this limitation and avoid presenting synthetic-label performance as proof of real-world predictive accuracy.

---

## 📊 Dataset

The project uses a combination of publicly sourced data and project-generated synthetic data for development and experimentation.

### Public Data Source

The initial source dataset contains approximately **13,713 Delhi Metro lost-item records**.

The original records include fields such as:

* Item name
* Item description
* Item quantity
* Station name
* Receiving date
* Receiving time

These records provide a starting point for understanding the structure and characteristics of lost-and-found data.

### Synthetic Dataset

A larger synthetic dataset was planned to support model development and experimentation.

The project-generated dataset has been discussed in the context of approximately 100,000 or more records. The final row count, column count, and dataset version should be documented after the dataset has been finalized.

Synthetic records can provide additional examples for testing preprocessing pipelines, database operations, and classification workflows.

### Target Variable

The target variable is `recovery_status`, with three possible values:

* `Pending`
* `Recovered`
* `Closed`

The synthetic labels are assigned using predefined business rules.

For example, the intended status logic uses a defined reporting period to distinguish active reports from closed reports, while recovery information determines whether a report is marked as recovered.

The exact label-generation rules must be documented alongside the dataset so that the training process is reproducible.

### Data Preparation

The data preparation process includes:

* Removing duplicate or invalid records where appropriate.
* Handling missing values.
* Standardizing categorical values.
* Converting date and time fields into suitable formats.
* Encoding categorical variables.
* Checking feature ranges and data consistency.
* Preventing information leakage between training and evaluation datasets.

### Dataset Limitations

* Synthetic records may not accurately represent real campus behavior.
* Synthetic labels reflect the assumptions used to generate them.
* Model performance on synthetic data may not generalize to real-world data.
* Evaluation results must be reported separately for each dataset and experimental setup.

Dataset statistics and final model scores will be added after the corresponding experiments are complete.

---

## 📦 Project Modules

The project is organized into the following functional modules.

### 1. Frontend Module

Provides the user interface for interacting with the application.

Responsibilities:

* Display application pages and forms.
* Collect report information.
* Present records and status information.
* Communicate with the backend API.

### 2. Backend Module

Handles server-side application logic.

Responsibilities:

* Expose REST API endpoints.
* Process frontend requests.
* Validate incoming data.
* Communicate with the MySQL database.
* Support authentication and report management.

### 3. Database Module

Manages persistent application records.

Responsibilities:

* Store lost-and-found reports.
* Maintain recovery statuses.
* Support record retrieval and updates.
* Enforce data consistency.

### 4. Machine Learning Module

Supports experimentation with recovery-status classification.

Responsibilities:

* Prepare the training dataset.
* Train and evaluate classification models.
* Compare model performance.
* Save experimental results and selected model artifacts.

### 5. Data Visualization Module

Supports analysis of application and model data.

Responsibilities:

* Summarize lost-and-found records.
* Visualize reporting and recovery-status distributions.
* Display model comparison results.

---

## 🗄️ Database Design

The application uses **MySQL** as its relational database.

The database is intended to manage item reports, operator accounts, and recovery-status information.

### Proposed Core Entities

| Entity             | Purpose                                                    |
| ------------------ | ---------------------------------------------------------- |
| Users / Operators  | Stores authorized operator account information             |
| Item Reports       | Stores lost-and-found report details                       |
| Recovery Status    | Stores the current status and related tracking information |
| Prediction Records | Optionally stores model predictions and related metadata   |

The final schema may combine some of these responsibilities into fewer tables.

### Example Item Report Fields

| Field               | Description                                             |
| ------------------- | ------------------------------------------------------- |
| `report_id`         | Unique report identifier                                |
| `item_name`         | Name of the reported item                               |
| `description`       | Additional item details                                 |
| `category`          | Item category                                           |
| `location`          | Relevant reporting or item location                     |
| `report_date`       | Date the report was created                             |
| `recovery_status`   | Current status of the report                            |
| `predicted_status`  | Model-generated status prediction, if available         |
| `operator_override` | Operator-provided correction or override, if applicable |

These fields are illustrative; the actual names and data types should match the implemented database schema.

### Database Design Considerations

* Use primary keys to identify records.
* Apply appropriate constraints to maintain data integrity.
* Store sensitive authentication information securely.
* Validate user input before inserting or updating records.
* Restrict access to administrative operations.
* Define suitable data-retention rules for closed reports.

---

## 🚀 Installation and Setup

Follow these instructions to set up the development environment.

### Prerequisites

Install the following software:

* Node.js and npm
* Python 3
* MySQL Server
* MySQL Workbench (optional, but useful for database management)
* Git
* Visual Studio Code or another code editor

### Step 1: Clone the Repository

```bash
git clone https://github.com/gopichand463/AI-Smart-Campus-Lost-Found.git
```

Navigate into the repository:

```bash
cd AI-Smart-Campus-Lost-Found
```

### Step 2: Set Up the Frontend

Navigate to the frontend directory.

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will display the local development URL in the terminal.

> If the repository currently contains the React application at its root rather than inside a `frontend` directory, run these commands from the directory containing the frontend's `package.json`.

### Step 3: Set Up the Backend

Open a separate terminal and navigate to the backend directory.

```bash
cd backend
```

Install the dependencies:

```bash
npm install
```

Create a `.env` file inside the backend directory.

Example configuration:

```env
PORT=5000

DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=smart_campus_lost_found
```

Replace the example credentials with your local MySQL configuration.

**Security:** Never commit the `.env` file or real database credentials to GitHub.

Start the backend:

```bash
node server.js
```

The backend should listen on the configured port, which is set to `5000` in this example.

### Step 4: Set Up the MySQL Database

Open MySQL Workbench and connect to your MySQL Server.

Create the project database:

```sql
CREATE DATABASE smart_campus_lost_found;
```

Select the database:

```sql
USE smart_campus_lost_found;
```

Create the tables according to the project's database schema before running database-dependent application features.

> Database table creation scripts should be added to the repository as the schema is finalized.

### Step 5: Set Up the Machine Learning Environment

From the machine learning project directory, create a Python virtual environment.

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

Install the core data science dependencies:

```bash
pip install pandas numpy scikit-learn matplotlib
```

Save the installed dependencies:

```bash
pip freeze > requirements.txt
```

Run the machine learning scripts using the Python interpreter associated with the virtual environment.

> The machine learning environment may be maintained separately from the Node.js application. If the model is later integrated into the backend, the integration mechanism and execution requirements should be documented.

---

## 📁 Project Structure

The following is a suggested structure for organizing the project as development progresses.

```text
AI-Smart-Campus-Lost-Found/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── ml/
│   ├── data/
│   ├── notebooks/
│   ├── src/
│   │   ├── preprocessing.py
│   │   ├── train.py
│   │   └── evaluate.py
│   ├── models/
│   └── requirements.txt
│
├── database/
│   └── schema.sql
│
├── docs/
│   └── SRS.md
│
├── .gitignore
└── README.md
```

**Note:** This tree represents the proposed organization, not a verified listing of the current repository. Keep the README aligned with the actual folders and files as they are created.

---

## 🔮 Future Enhancements

Potential improvements include:

* Email notifications for relevant report updates.
* Improved report search and filtering.
* More comprehensive analytics dashboards.
* Model monitoring and evaluation on real-world data.
* Better handling of missing, duplicate, and inconsistent records.
* Enhanced authentication and role-based access control.
* Secure handling of item images and uploaded files.
* Improved responsive design for mobile devices.
* Automated database backup and maintenance procedures.

Any future image-based similarity or automated lost-to-found matching functionality will require separate implementation and evaluation; it is not assumed to be part of the current machine learning scope.

---

## 🎓 Academic Relevance

This project brings together concepts from five academic subjects.

| Subject                     | Application in the Project                                           |
| --------------------------- | -------------------------------------------------------------------- |
| Machine Learning            | Classification, preprocessing, model training, and evaluation        |
| Full-Stack Development      | React frontend, Express backend, and API integration                 |
| Database Management Systems | Relational schema design, SQL queries, and data integrity            |
| Data Visualization          | Reporting trends, status distributions, and model comparisons        |
| Software Engineering        | Requirements analysis, SRS documentation, system design, and testing |

The project provides practical experience in integrating these concepts into a single application.

---

## 👨‍💻 Development Team

**Project:** AI-Powered Smart Campus Lost & Found Management System

**Developer:** Vemula Gopi Chand

**Branch:** B.Tech CSE – Artificial Intelligence and Machine Learning

**Institution:** GLA University

**Academic Year:** 2026–2027

---

## 🤝 Contributing

Contributions and suggestions are welcome as the project develops.

To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Commit your changes with a descriptive message.
5. Open a pull request.

Please ensure that new features are documented and tested before they are merged.

---

## 📄 License

A license has not yet been specified for this project.

If the project is intended to be publicly reused or distributed, add an appropriate license file before granting others permission to reuse the code.

---

## ⭐ Support

If you find this project interesting, consider starring the repository on GitHub.

**GitHub Repository:**
https://github.com/gopichand463/AI-Smart-Campus-Lost-Found

---

*Built as an academic project exploring the integration of full-stack development, machine learning, database systems, data visualization, and software engineering.*

