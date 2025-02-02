import { Task, ITask } from "./Task"
import { v4 as uuidv4 } from 'uuid'
import {handleTaskModal} from "../index"

export type ProjectStatus = "pending" | "active" | "finished"
export type UserRole = "architect" | "engineer" | "developer"

export interface IProject {
  name: string
	description: string
	status: ProjectStatus
	userRole: UserRole
	finishDate: Date
  tasks?: Task[]
}

export class Project implements IProject {
	//To satisfy IProject
  name: string
	description: string
	status: "pending" | "active" | "finished"
	userRole: "architect" | "engineer" | "developer"
  finishDate: Date
  
  //Class internals
  ui: HTMLDivElement
  cost: number = 0
  progress: number = 0
  id: string
  color: string


  constructor(data: IProject) {
    this.id = uuidv4()
    const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`
    this.color = randomColor
    
    //Project data definition
    for (const key in data) {
      if (key === "ui") {
        continue
      }
      this[key] = data[key]
    }
    
    this.setUI()
  }
    //Erstellung einer UI für ein Projekt card
    setUI() {
      // Bei existierendem UI-Element nur Inhalt aktualisieren
      if (this.ui && this.ui instanceof HTMLDivElement) {
        const oldUI = this.ui
        const newUI = this.createCard()
        oldUI.innerHTML = newUI
      } else {
        // Neues Element erstellen
        this.ui = document.createElement("div")
        this.ui.className = "project-card"
        this.ui.setAttribute("data-project-id", this.id)
        this.ui.innerHTML = this.createCard()
      }
    }
  
    private createCard(): string {
      return `
        <div class="card-header">
          <p id="projectnameshortage" style="font-size: 20px; background-color:${this.color}; aspect-ratio: 1; border-radius: 100%; padding: 12px;">${this.name.slice(0, 2).toUpperCase()}</p>
          <div>
            <h5>${this.name}</h5>
            <p>${this.description}</p>
          </div>
        </div>
        <div class="card-content">
          <div class="card-property">
            <p style="color: #969696;">Status</p>
            <p>${this.status}</p>
          </div>
          <div class="card-property">
            <p style="color: #969696;">Role</p>
            <p>${this.userRole}</p>
          </div>
          <div class="card-property">
            <p style="color: #969696;">Cost</p>
            <p>$${this.cost}</p>
          </div>
          <div class="card-property">
            <p style="color: #969696;">Estimated Progress</p>
            <p>${this.progress * 100}%</p>
          </div>
        </div>`
    }

    Tasks: Task[] = []

    private validateFinishDate(date: Date) {
      if (!date || date.toString() === "Invalid Date") {
          return new Date(Date.now())
      }
      return date
   }

    newTask(taskData: ITask) {
      taskData.taskDate = this.validateFinishDate(taskData.taskDate)
      const task = new Task(taskData)
      this.Tasks.push(task)
      console.log("Task wurde erstellt:", task)

      //Task zur UI hinzufügen
      const taskcontainer = document.getElementById("task-list")
      if (taskcontainer) {
        taskcontainer.appendChild(task.ui)
      } else {
        console.warn("Task-Container wurde nicht gefunden")
      }

      task.ui.addEventListener( "click", () => {
        console.log("Project clicked:", task.taskId);
        handleTaskModal("edit", task.taskId)
        
        
        
        //const taskId = document.getElementById()
        //ID identifizieren
        // Updaten
        //const taskId = 
        //const taskContainer = document.getElementById(taskId)


      })

      return task
    }

    

    getTask(id: string) {
      const task = this.Tasks.find((task) => {
        return task.taskId === id
      })
      return task
    }
  
    // In Project.ts
updateTask(taskId: string, updatedData: Partial<ITask>) {
  const task = this.getTask(taskId);
  if (!task) {
    console.warn(`Task mit ID ${taskId} nicht gefunden.`);
    return;
  }
  // Update der Task-Eigenschaften
  if (updatedData.taskName !== undefined) {
    task.taskName = updatedData.taskName;
  }
  if (updatedData.taskProgress !== undefined) {
    task.taskProgress = updatedData.taskProgress;
    // Aktualisiere die Farbe, basierend auf dem neuen Fortschritt
    task.color = task.setColor();
  }
  if (updatedData.taskDate !== undefined) {
    task.taskDate = updatedData.taskDate;
  }
  // UI neu rendern
  task.setUI();
  return task;
}
}