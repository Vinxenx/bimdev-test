import { v4 as uuidv4 } from 'uuid'

export type ProjectStatus = "pending" | "active" | "finished"
export type UserRole = "architect" | "engineer" | "developer"

export interface IProject {
  name: string
	description: string
	status: ProjectStatus
	userRole: UserRole
	finishDate: Date
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
  }