import { IProject, Project } from "./Project"

export class ProjectsManager {
  list: Project[] = []
  ui: HTMLElement

  constructor(container: HTMLElement) {
    this.ui = container
    this.newProject({
      name: "Default Project",
      description: "This is just a default app project",
      status: "pending",
      userRole: "architect",
      finishDate: new Date()
    })
  }

  newProject(data: IProject) {
    const projectNames = this.list.map((project) => {
      return project.name
    })
    const nameInUse = projectNames.includes(data.name)
    if (nameInUse) {
      throw new Error(`A project with the name "${data.name}" already exists`)
    }
    const project = new Project(data)

    project.ui.addEventListener("click", () => {
      const projectsPage = document.getElementById("projects-page")
      const detailsPage = document.getElementById("project-details")
      if(!projectsPage || !detailsPage) {return}                        //Wenn dort keine projects-page oder keine details-page ist, stoppe die Funktion
      projectsPage.style.display = "none"                               //Manipulation der HTML mit Hilfe des style-Operators
      detailsPage.style.display = "flex"
      this.setDetailsPage(project)
    })


    this.ui.append(project.ui)
    this.list.push(project)	
    return project
  }

  private setDetailsPage(project: Project) {
    const detailsPage = document.getElementById("project-details")
    if (!detailsPage) { return }

    // Für alle verfügbaren Projekt-Keys
    for (const key in project) {
        // Finde alle Elemente mit dem entsprechenden data-project-info Attribut
        const properties = detailsPage.querySelectorAll(`[data-project-info="${key}"]`)
        
        // Überprüfe ob Elemente gefunden wurden
        if (properties.length > 0) {
          console.log(properties.length)
            // Aktualisiere jedes gefundene Element
            properties.forEach(propertie => {
                // Spezielle Behandlung für das Datum
                if (key === "finishDate" && project[key] instanceof Date) {
                    propertie.textContent = (project[key] as Date).toLocaleDateString()
                } else {
                    propertie.textContent = project[key]?.toString() || ''
                }
            })
        }
        
    }
  }

  getProject(id: string) {
    const project = this.list.find((project) => {
      return project.id === id
    })
    return project
  }
  
  deleteProject(id: string) {
    const project = this.getProject(id)
    if (!project) { return }
    project.ui.remove()
    const remaining = this.list.filter((project) => {
      return project.id !== id
    })
    this.list = remaining
  }
  
  exportToJSON(fileName: string = "projects") {
    const json = JSON.stringify(this.list, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }
  
  importFromJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        const json = reader.result;
        
        if (!json) { return; }
        const projects: IProject[] = JSON.parse(json as string);
        
        for (const project of projects) {
            try {
                const newProject = this.newProject(project);
            } catch (error) {
                console.error("5. Fehler beim Erstellen:", error); // Fehler loggen
            }
        }
    });

    input.addEventListener('change', () => {
        const filesList = input.files;
        console.log("0. Ausgewählte Datei:", filesList); // Prüfen der Dateiauswahl
        if (!filesList) { return; }
        reader.readAsText(filesList[0]);
    });

    input.click();
  }
}