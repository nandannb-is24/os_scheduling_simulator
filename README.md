# OS CPU Scheduling Simulator & Visualizer

This project is a **web-based CPU scheduling simulator** created to help understand how different **Operating System scheduling algorithms** work in practice.  
It allows users to **visualize process execution**, generate **Gantt charts**, and calculate important performance metrics such as **Waiting Time** and **Turnaround Time**.

The main goal of this project is to convert **theoretical OS concepts** into a **clear visual and interactive experience**.

---

## 🚀 Live Demo
🔗 [Insert your Vercel URL here]

---

## 🧠 What This Project Does

- Simulates how the CPU schedules processes
- Shows step-by-step execution using a Gantt chart
- Helps compare different scheduling algorithms
- Calculates important OS performance metrics automatically

---

## ⚙️ Scheduling Algorithms Implemented

- **FCFS (First Come First Served)**  
  Processes are executed in the order they arrive.

- **SJF (Shortest Job First)**  
  The process with the shortest burst time runs first.

- **SRTF (Shortest Remaining Time First)**  
  A preemptive version of SJF where the CPU switches if a shorter job arrives.

- **Round Robin**  
  Each process gets a fixed time slice to ensure fairness.

- **Priority Scheduling**  
  Processes are scheduled based on priority (both preemptive and non-preemptive).

---

## 📊 Performance Metrics Shown

The simulator calculates the following automatically:

- **Turnaround Time (TAT)**  
  Time taken from process arrival to completion.

- **Waiting Time (WT)**  
  Time a process spends waiting in the ready queue.

- **Average Waiting Time and Turnaround Time**  
  Used to compare which algorithm performs better.

---

## 🖥️ How to Use the Simulator

1. Enter process details such as Arrival Time, Burst Time, and Priority.
2. Select a CPU scheduling algorithm.
3. Click **Run Simulation**.
4. Observe the Gantt chart and performance metrics.
5. Compare results across different algorithms.

---

## 🛠️ Technologies Used

- React.js
- TypeScript
- Tailwind CSS
- Vercel (for deployment)

---

## 🎯 Purpose of the Project

This project is designed as an **educational tool** for students learning **Operating Systems**.  
It helps in understanding:
- CPU scheduling behavior
- Process execution flow
- Algorithm efficiency comparison

---

## 👨‍💻 Author

**Nandan**  
Operating Systems Mini Project
