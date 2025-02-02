// src/classes/Projectsmanager.ts

import { IProject, Project } from "./Project";
import { Task, ITask } from "./Task";

export class ProjectsManager {
  list: Project[] = [];
  ui: HTMLElement;

  constructor(container: HTMLElement) {
    this.ui = container;
    this.newProject({
      name: "Default Project",
      description: "This is just a default app project",
      status: "pending",
      userRole: "architect",
      finishDate: new Date()
    });
  }

  private validateProjectName(name: string) {
    if (name.length < 5) {
      throw new Error("Project name must be at least 5 characters long");
    }
  }
 
  private validateNameInUse(name: string) {
    const projectNames = this.list.map(project => project.name);
    if (projectNames.includes(name)) {
      throw new Error(`A project with the name "${name}" already exists`);
    }
  }
 
  private validateFinishDate(date: Date) {
    if (!date || date.toString() === "Invalid Date") {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    return date;
  }

  newProject(data: IProject) {
    this.validateProjectName(data.name);
    this.validateNameInUse(data.name);
    data.finishDate = this.validateFinishDate(data.finishDate);
    
    const project = new Project(data);

    project.ui.addEventListener("click", () => {
      console.log("Project clicked:", project.id);
      const projectsPage = document.getElementById("projects-page");
      const detailsPage = document.getElementById("project-details");
      console.log("Details page found:", detailsPage);
      if (!projectsPage || !detailsPage) return;
      
      detailsPage.setAttribute("data-project-id", project.id);
      console.log("Set project ID:", project.id);
      
      projectsPage.style.display = "none";
      detailsPage.style.display = "flex";
      this.setDetailsPage(project);
    });

    this.ui.append(project.ui);
    this.list.push(project);	
    return project;
  }

  private setDetailsPage(project: Project) {
    const detailsPage = document.getElementById("project-details");
    if (!detailsPage) { return; }

    detailsPage.setAttribute("data-project-id", project.id);

    const shortageLogo = detailsPage.querySelector("#projectnameshortage");
    if (shortageLogo instanceof HTMLElement) {
      shortageLogo.style.backgroundColor = project.color;
    }

    for (const key in project) {
      const properties = detailsPage.querySelectorAll(`[data-project-info="${key}"]`);
      if (properties.length > 0) {
        console.log(properties.length);
        properties.forEach(propertie => {
          if (key === "finishDate" && project[key] instanceof Date) {
            propertie.textContent = (project[key] as Date).toLocaleDateString();
          } else {
            propertie.textContent = project[key]?.toString() || '';
          }
        });
      }
    }
  }

  getProject(id: string) {
    return this.list.find(project => project.id === id);
  }
  
  updateProject(id: string, updatedData: Partial<IProject>) {
    console.log("Projekt wird geupdatet");
    const project = this.getProject(id);
    console.log("Gefundenes Projekt:", project);
    if (!project) return;
    
    if (updatedData.name && updatedData.name !== project.name) {
      this.validateProjectName(updatedData.name);
      this.validateNameInUse(updatedData.name);
    }
    
    if (updatedData.finishDate) {
      updatedData.finishDate = this.validateFinishDate(updatedData.finishDate);
    }
    
    for (const key in updatedData) {
      if (key in project && key !== "id") {
        project[key] = updatedData[key];
      }
    }
    console.log(updatedData.name);
    console.log("Projectdaten", project);
    project.setUI();
    
    const detailsPage = document.getElementById("project-details");
    if (detailsPage && detailsPage.getAttribute("data-project-id") === id) {
      this.setDetailsPage(project);
    }

    return project;
  }

  deleteProject(id: string) {
    const project = this.getProject(id);
    if (!project) { return; }
    project.ui.remove();
    this.list = this.list.filter(project => project.id !== id);
  }
  
  exportToJSON(fileName: string = "projects") {
    const json = JSON.stringify(this.list, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  importFromJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const json = reader.result;
      console.log("1. Gelesene JSON:", json);
      
      if (!json) { return; }
      const projects: IProject[] = JSON.parse(json as string);
      console.log("2. Geparste Projekte:", projects);
      
      for (const project of projects) {
        try {
          console.log("3. Aktuelles Projekt vor newProject:", project);
          const newProject = this.newProject(project);
          
          const Tasks = newProject.Tasks;
          if (Tasks) {
            for (const taskData of Tasks) {
              const task = new Task(taskData);
              const taskContainer = document.getElementById("task-list");
              if (taskContainer) {
                taskContainer.appendChild(task.ui);
              }
            }
          }
          console.log("4. Erstelltes Projekt:", newProject);
        } catch (error) {
          console.error("5. Fehler beim Erstellen:", error);
        }
      }
    });

    input.addEventListener('change', () => {
      const filesList = input.files;
      console.log("0. Ausgewählte Datei:", filesList);
      if (!filesList) { return; }
      reader.readAsText(filesList[0]);
    });

    input.click();
  }
}