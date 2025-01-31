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
  private validateProjectName(name: string) {
    if (name.length < 5) {
        throw new Error("Project name must be at least 5 characters long")
    }
 }
 
 private validateNameInUse(name: string) {
    const projectNames = this.list.map(project => project.name)
    if (projectNames.includes(name)) {
        throw new Error(`A project with the name "${name}" already exists`)
    }
 }
 
 private validateFinishDate(date: Date) {
    if (!date || date.toString() === "Invalid Date") {
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
    return date
 }

  newProject(data: IProject) {
   
    this.validateProjectName(data.name)
    this.validateNameInUse(data.name)
    data.finishDate = this.validateFinishDate(data.finishDate)
    
    const project = new Project(data)

    project.ui.addEventListener("click", () => { // Sobald die UI angecklickt wird, wird der Listener ausgelöst
      console.log("Project clicked:", project.id); // Log project ID
      const projectsPage = document.getElementById("projects-page")
      const detailsPage = document.getElementById("project-details")
      console.log("Details page found:", detailsPage); // Log details page element
      
      if(!projectsPage || !detailsPage) return //Wenn dort keine projects-page oder keine details-page ist, stoppe die Funktion
      
      
      detailsPage.setAttribute("data-project-id", project.id)
      console.log("Set project ID:", project.id); // Log setting ID
      
      projectsPage.style.display = "none" //Manipulation der HTML mit Hilfe des style-Operators
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

    detailsPage.setAttribute("data-project-id", project.id)

    // Projektfarbe aktualisieren
    const shortageLogo = detailsPage.querySelector("#projectnameshortage")
    if (shortageLogo instanceof HTMLElement) {
        shortageLogo.style.backgroundColor = project.color
    }

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
  
  updateProject(id: string, updatedData: Partial<IProject>) {
    console.log("Projekt wird geupdatet")
    const project = this.getProject(id);
    console.log("Gefundenes Projekt:", project)
    if (!project) return;
    
    if (updatedData.name && updatedData.name !== project.name) {
        this.validateProjectName(updatedData.name);
        this.validateNameInUse(updatedData.name);
    }
    
    if (updatedData.finishDate) {
        updatedData.finishDate = this.validateFinishDate(updatedData.finishDate);
    }
    
    // Update project properties
    for (const key in updatedData) {
        if (key in project && key !== "id") {
            project[key] = updatedData[key];
        }
        
    }
    console.log(updatedData.name)
        console.log("Projectdaten", project)
    // Update UI
    project.setUI()    // Neue UI erstellen    
    
    // Update details page if we're on it
    const detailsPage = document.getElementById("project-details")
    if (detailsPage && detailsPage.getAttribute("data-project-id") === id) {
        this.setDetailsPage(project)
    }

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
        console.log("1. Gelesene JSON:", json); // Prüfen was gelesen wurde
        
        if (!json) { return; }
        const projects: IProject[] = JSON.parse(json as string);
        console.log("2. Geparste Projekte:", projects); // Prüfen was geparst wurde
        
        for (const project of projects) {
            try {
                console.log("3. Aktuelles Projekt vor newProject:", project); // Prüfen des einzelnen Projekts
                const newProject = this.newProject(project);
                console.log("4. Erstelltes Projekt:", newProject); // Prüfen was erstellt wurde
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